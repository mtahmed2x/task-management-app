import { BASE_SOCKET_URL, BASE_URL } from "@/constants/BaseUrl";
import {
  ApiResponse,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  Task,
} from "@/types";
import {
  createApi,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";
import { io, Socket } from "socket.io-client";
import { loginSuccess, logout } from "./features/authSlice";

export type MutationEndpointName = "createTask" | "updateTask" | "deleteTask";

let socket: Socket;

interface MinimalRootState {
  auth: {
    accessToken: string | null;
    refreshToken: string | null;
  };
}

const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as unknown as MinimalRootState).auth.accessToken;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: typeof baseQuery = async (
  args,
  api,
  extraOptions
) => {
  await mutex.waitForUnlock();
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && (result.error as FetchBaseQueryError).status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const refreshToken = (api.getState() as unknown as MinimalRootState)
          .auth.refreshToken;
        if (refreshToken) {
          const refreshResult = await baseQuery(
            {
              url: "auth/refresh",
              method: "POST",
              body: { token: refreshToken },
            },
            api,
            extraOptions
          );

          if (refreshResult.data) {
            const data = refreshResult.data as ApiResponse<LoginResponse>;

            api.dispatch(loginSuccess(data.data));

            result = await baseQuery(args, api, extraOptions);
          } else {
            console.log("Refresh token failed. Logging out.");
            api.dispatch(logout());
          }
        } else {
          api.dispatch(logout());
        }
      } finally {
        release();
      }
    } else {
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }
  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Task"],
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginPayload>({
      query: (credentials) => ({
        url: "auth/login",
        method: "POST",
        body: credentials,
      }),
      transformResponse: (response: ApiResponse<LoginResponse>) =>
        response.data,
    }),
    register: builder.mutation<LoginResponse, RegisterPayload>({
      query: (userInfo) => ({
        url: "auth/register",
        method: "POST",
        body: userInfo,
      }),
      transformResponse: (response: ApiResponse<LoginResponse>) =>
        response.data,
    }),
    refreshToken: builder.mutation<LoginResponse, { token: string }>({
      query: (credentials) => ({
        url: "auth/refresh",
        method: "POST",
        body: credentials,
      }),
      transformResponse: (response: ApiResponse<LoginResponse>) =>
        response.data,
    }),
    logout: builder.mutation<{ success: boolean }, void>({
      queryFn: async (arg, { getState }, extraOptions, baseQuery) => {
        const refreshToken = (getState() as unknown as MinimalRootState).auth
          .refreshToken;
        if (refreshToken) {
          const result = await baseQuery({
            url: "auth/logout",
            method: "POST",
            body: { token: refreshToken },
          });

          if (result.error) {
            return { error: result.error as FetchBaseQueryError };
          }
        }
        return { data: { success: true } };
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(logout());
          dispatch(api.util.resetApiState());
        } catch (err) {
          console.error("Failed to logout:", err);
          dispatch(logout());
          dispatch(api.util.resetApiState());
        }
      },
    }),
    getTasks: builder.query<Task[], void>({
      query: () => "task",
      transformResponse: (response: ApiResponse<Task[]>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Task" as const, id })),
              { type: "Task", id: "LIST" },
            ]
          : [{ type: "Task", id: "LIST" }],

      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved, getState }
      ) {
        const accessToken = (getState() as unknown as MinimalRootState).auth
          .accessToken;
        console.log(
          "Access Token for Socket:",
          accessToken ? "Exists" : "null"
        );

        if (!accessToken) return;

        socket = io(BASE_SOCKET_URL, {
          auth: {
            token: accessToken,
          },
        });

        socket.on("connect_error", (err) => {
          console.error("Socket.IO connection error:", err.message);
        });

        socket.on("connect", () => {
          console.log("Socket.IO connected successfully.");
        });

        try {
          await cacheDataLoaded;
          socket.on(
            "task_locked",
            (data: { taskId: string; userId: string; userName: string }) => {
              updateCachedData((draft) => {
                const task = draft.find((t) => t.id === data.taskId);
                if (task) {
                  task.lockedById = data.userId;
                  task.lockedBy = { id: data.userId, name: data.userName };
                }
              });
            }
          );
          socket.on("task_unlocked", (data: { taskId: string }) => {
            updateCachedData((draft) => {
              const task = draft.find((t) => t.id === data.taskId);
              if (task) {
                task.lockedById = null;
                task.lockedBy = null;
              }
            });
          });
        } catch {}
        await cacheEntryRemoved;
        socket.disconnect();
        console.log("Socket.IO disconnected.");
      },
    }),

    getTaskById: builder.query<Task, string>({
      query: (id) => `task/${id}`,
      transformResponse: (response: ApiResponse<Task>) => response.data,
      providesTags: (result, error, id) => [{ type: "Task", id }],
    }),

    createTask: builder.mutation<Task, Pick<Task, "body" | "title">>({
      query: (newTask) => ({
        url: "task/create",
        method: "POST",
        body: newTask,
      }),
      transformResponse: (response: ApiResponse<Task>) => response.data,
      invalidatesTags: [{ type: "Task", id: "LIST" }],
    }),

    updateTask: builder.mutation<
      Task,
      Partial<Pick<Task, "body" | "title">> & Pick<Task, "id">
    >({
      query: ({ id, ...body }) => ({
        url: `task/update/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (response: ApiResponse<Task>) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: "Task", id },
        { type: "Task", id: "LIST" },
      ],
    }),

    deleteTask: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `task/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Task", id },
        { type: "Task", id: "LIST" },
      ],
    }),
  }),
});

export const getSocket = () => socket;

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetTasksQuery,
  useGetTaskByIdQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = api;
