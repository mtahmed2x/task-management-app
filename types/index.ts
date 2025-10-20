export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  lastEditedById: string | null;
  lockedById: string | null;
  lockedAt: string | null;
  createdBy: Pick<User, "id" | "name" | "email">;
  lastEditedBy: Pick<User, "id" | "name"> | null;
  lockedBy: string | Pick<User, "id" | "name"> | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type LoginResponse = {
  user: User;
  accessToken: string;
  refreshToken: string;
};
