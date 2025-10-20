import { useIsOnline } from "@/hooks/useIsOnline";
import { api } from "@/lib/api";
import { removeMutationFromQueue } from "@/lib/features/offlineQueueSlice";
import { RootState, useAppDispatch } from "@/lib/store";
import { useEffect } from "react";
import { useSelector } from "react-redux";

export function SyncManager() {
  const isOnline = useIsOnline();
  const dispatch = useAppDispatch();
  const queuedMutations = useSelector(
    (state: RootState) => state.offlineQueue.mutations
  );

  useEffect(() => {
    const syncOfflineMutations = async () => {
      if (isOnline && queuedMutations.length > 0) {
        for (const mutation of queuedMutations) {
          try {
            let promise;
            switch (mutation.endpointName) {
              case "createTask":
                promise = dispatch(
                  api.endpoints.createTask.initiate(mutation.originalArgs)
                );
                break;
              case "updateTask":
                promise = dispatch(
                  api.endpoints.updateTask.initiate(mutation.originalArgs)
                );
                break;
              case "deleteTask":
                promise = dispatch(
                  api.endpoints.deleteTask.initiate(mutation.originalArgs)
                );
                break;
              default:
                throw new Error(
                  `Unknown mutation endpoint: ${mutation.endpointName}`
                );
            }

            await promise.unwrap();

            dispatch(removeMutationFromQueue({ id: mutation.id }));
            console.log(`Successfully synced action: ${mutation.endpointName}`);
          } catch (error) {
            console.error(
              `Failed to sync action: ${mutation.endpointName}`,
              error
            );
            break;
          }
        }
      }
    };

    syncOfflineMutations();
  }, [isOnline, queuedMutations, dispatch]);

  return null;
}
