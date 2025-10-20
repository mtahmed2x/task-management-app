import { createSlice } from "@reduxjs/toolkit";

interface TasksState {}

const initialState: TasksState = {};

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {},
});

export const {} = tasksSlice.actions;
export default tasksSlice.reducer;
