import Button from "@/components/Shared/Button";
import Input from "@/components/Shared/Input";
import { useIsOnline } from "@/hooks/useIsOnline";
import {
  api,
  getSocket,
  MutationEndpointName,
  useCreateTaskMutation,
  useGetTaskByIdQuery,
  useUpdateTaskMutation,
} from "@/lib/api";
import { addMutationToQueue } from "@/lib/features/offlineQueueSlice";
import { RootState, useAppDispatch } from "@/lib/store";
import { Task } from "@/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";

export default function TaskDetailScreen() {
  const dispatch = useAppDispatch();
  const isOnline = useIsOnline();
  const router = useRouter();
  const { taskId } = useLocalSearchParams<{ taskId?: string }>();
  const { user } = useSelector((state: RootState) => state.auth);

  const { data: task, isLoading: isLoadingTask } = useGetTaskByIdQuery(
    taskId!,
    {
      skip: !taskId,
    }
  );

  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    const socket = getSocket();

    if (socket && taskId) {
      socket.emit("start_edit", { taskId });
    }

    return () => {
      if (socket && taskId) {
        socket.emit("end_edit", { taskId });
      }
    };
  }, [taskId]);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setBody(task.body);
    }
  }, [task]);

  const handleSave = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (isOnline) {
      try {
        if (taskId && task) {
          await updateTask({ id: taskId, title, body }).unwrap();
        } else {
          await createTask({ title, body }).unwrap();
        }
        router.back();
      } catch (err: any) {
        Alert.alert(
          "Save Failed",
          err.data?.message || "Could not save the task."
        );
      }
    } else {
      console.log("Offline: Queuing mutation.");
      const actionId = new Date().toISOString();
      let endpointName: MutationEndpointName;
      let originalArgs = {};

      if (taskId && task) {
        endpointName = "updateTask";
        originalArgs = { id: taskId, title, body };

        dispatch(
          api.util.updateQueryData("getTasks", undefined, (draft) => {
            const taskToUpdate = draft.find((t) => t.id === taskId);
            if (taskToUpdate) {
              taskToUpdate.title = title;
              taskToUpdate.body = body;
            }
          })
        );
      } else {
        endpointName = "createTask";
        originalArgs = { title, body };

        const tempTask: Task = {
          id: actionId,
          title,
          body,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdById: user.id,
          createdBy: { id: user.id, name: user.name, email: user.email },
          lastEditedById: null,
          lastEditedBy: null,
          lockedById: null,
          lockedAt: null,
          lockedBy: null,
        };
        dispatch(
          api.util.updateQueryData("getTasks", undefined, (draft) => {
            draft.push(tempTask);
          })
        );
      }

      dispatch(
        addMutationToQueue({ id: actionId, endpointName, originalArgs })
      );
      router.back();
    }
  };

  if (isLoadingTask) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const isLoading = isCreating || isUpdating;

  return (
    <View style={styles.container}>
      <Input placeholder="Title" value={title} onChangeText={setTitle} />
      <Input placeholder="Body" value={body} onChangeText={setBody} multiline />
      <Button
        title={isLoading ? "Saving..." : "Save Task"}
        onPress={handleSave}
        disabled={isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
