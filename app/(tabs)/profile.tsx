import Button from "@/components/Shared/Button";
import { logout } from "@/lib/features/authSlice";
import { RootState } from "@/lib/store";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/login");
  };

  return (
    <View style={styles.container}>
      {user ? (
        <View style={styles.content}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.info}>{user.name}</Text>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.info}>{user.email}</Text>
          <Button
            title="Logout"
            onPress={handleLogout}
            style={styles.logoutButton}
          />
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={styles.info}>You are not logged in.</Text>
          <Button title="Go to Login" onPress={() => router.push("/login")} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f0f0f0",
  },
  content: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "gray",
    marginTop: 10,
  },
  info: {
    fontSize: 18,
    marginBottom: 10,
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: "#dc3545",
  },
});
