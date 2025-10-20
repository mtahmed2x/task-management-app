import { Task } from "@/types";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Button from "../Shared/Button";

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  isLoggedIn: boolean;
}

const getUserName = (
  userField: string | { name?: string } | null
): string | null => {
  console.log(userField);

  if (!userField) {
    return null;
  }

  if (typeof userField === "object" && userField.name) {
    return userField.name;
  }

  if (typeof userField === "string") {
    return "an editor";
  }
  return null;
};

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  isLoggedIn,
}: TaskCardProps) {
  console.log(task);

  const isLocked = !!task.lockedBy;
  const creatorName = task.createdBy?.name || "Unknown";
  const editorName = getUserName(task.lockedBy);
  const lastEditorName = getUserName(task.lastEditedBy);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{task.title}</Text>
      <Text style={styles.body}>{task.body}</Text>

      <View style={styles.statusContainer}>
        {isLocked && editorName && (
          <Text style={styles.editingText}>Editing by: {editorName}</Text>
        )}

        {!isLocked && (
          <View>
            <Text style={styles.meta}>Created by: {creatorName}</Text>
            {lastEditorName && (
              <Text style={styles.meta}>Last edited by: {lastEditorName}</Text>
            )}
          </View>
        )}
      </View>

      {isLoggedIn && (
        <View style={styles.actions}>
          <Button title="Edit" onPress={onEdit} disabled={isLocked} />
          <Button
            title="Delete"
            onPress={onDelete}
            style={styles.deleteButton}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    color: "#333",
  },
  statusContainer: {
    marginTop: 12,
    minHeight: 40,
  },
  meta: {
    fontSize: 12,
    color: "gray",
  },
  editingText: {
    fontStyle: "italic",
    fontWeight: "bold",
    color: "#d97706",
    fontSize: 14,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
  },
  deleteButton: {
    backgroundColor: "#dc3545",
    marginLeft: 8,
  },
});
