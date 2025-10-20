import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MutationEndpointName } from "../api";

interface QueuedMutation {
  id: string;
  endpointName: MutationEndpointName;
  originalArgs: any;
}

interface OfflineQueueState {
  mutations: QueuedMutation[];
}

const initialState: OfflineQueueState = {
  mutations: [],
};

const offlineQueueSlice = createSlice({
  name: "offlineQueue",
  initialState,
  reducers: {
    addMutationToQueue(state, action: PayloadAction<QueuedMutation>) {
      state.mutations.push(action.payload);
    },
    removeMutationFromQueue(state, action: PayloadAction<{ id: string }>) {
      state.mutations = state.mutations.filter(
        (m) => m.id !== action.payload.id
      );
    },
  },
});

export const { addMutationToQueue, removeMutationFromQueue } =
  offlineQueueSlice.actions;
export default offlineQueueSlice.reducer;
