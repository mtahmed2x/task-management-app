import { SyncManager } from "@/components/Offline/SyncManager";
import { persistor, store } from "@/lib/store";
import { Stack } from "expo-router";
import { ActivityIndicator } from "react-native";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={<ActivityIndicator />} persistor={persistor}>
        <SyncManager />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ title: "Login" }} />
          <Stack.Screen name="register" options={{ title: "Register" }} />
          <Stack.Screen
            name="task-detail"
            options={{ title: "Task Details" }}
          />
        </Stack>
      </PersistGate>
    </Provider>
  );
}
