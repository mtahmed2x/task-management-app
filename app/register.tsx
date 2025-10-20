import Button from "@/components/Shared/Button";
import Input from "@/components/Shared/Input";
import { useRegisterMutation } from "@/lib/api";
import { loginSuccess } from "@/lib/features/authSlice";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useDispatch } from "react-redux";

export default function RegisterScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [register, { isLoading }] = useRegisterMutation();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      const data = await register({ name, email, password }).unwrap();
      dispatch(loginSuccess(data));
      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert(
        "Registration Failed",
        err.data?.message || "An error occurred."
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Input placeholder="Name" value={name} onChangeText={setName} />
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
        title={isLoading ? "Registering..." : "Register"}
        onPress={handleRegister}
        disabled={isLoading}
      />
      <Button
        title="Already have an account? Login"
        onPress={() => router.push("/login")}
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
