import Button from "@/components/Shared/Button";
import TaskCard from "@/components/Task/TaskCard";
import { useDeleteTaskMutation, useGetTasksQuery } from "@/lib/api";
import { RootState } from "@/lib/store";
import { Task } from "@/types";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSelector } from "react-redux";

export default function TaskListScreen() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const {
    data: tasks,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useGetTasksQuery();
  const [deleteTask] = useDeleteTaskMutation();

  const handleEditTask = (task: Task) => {
    router.push({ pathname: "/task-detail", params: { taskId: task.id } });
  };

  const handleDeleteTask = (taskId: string) => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "OK",
        onPress: async () => {
          try {
            await deleteTask(taskId).unwrap();
          } catch (err) {
            Alert.alert("Error", "Could not delete task.");
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>Error fetching tasks.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onEdit={() => handleEditTask(item)}
            onDelete={() => handleDeleteTask(item.id)}
            isLoggedIn={!!user}
          />
        )}
        contentContainerStyle={styles.list}
        onRefresh={refetch}
        refreshing={isFetching}
      />
      {user ? (
        <Button title="Add Task" onPress={() => router.push("/task-detail")} />
      ) : (
        <Button
          title="Login to Add/Edit"
          onPress={() => router.push("/login")}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  list: { paddingBottom: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
