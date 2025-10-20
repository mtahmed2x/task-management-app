import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

export function useIsOnline() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(
        state.isConnected != null &&
          state.isConnected &&
          Boolean(state.isInternetReachable)
      );
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return isOnline;
}
