import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useDispatch } from "react-redux";

import Button from "@/components/Shared/Button";
import Input from "@/components/Shared/Input";
import { useLoginMutation } from "@/lib/api";
import { loginSuccess } from "@/lib/features/authSlice";

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [login, { isLoading }] = useLoginMutation();

  const handleLogin = async () => {
    try {
      const data = await login({ email, password }).unwrap();
      dispatch(loginSuccess(data));
      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert("Login Failed", err.data?.message || "Invalid credentials.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Input
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        title={isLoading ? "Logging in..." : "Login"}
        onPress={handleLogin}
        disabled={isLoading}
      />
      <Button
        title="Don't have an account? Register"
        onPress={() => router.push("/register")}
        style={styles.secondaryButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: "center",
  },
  secondaryButton: {
    backgroundColor: "gray",
    marginTop: 10,
  },
});
