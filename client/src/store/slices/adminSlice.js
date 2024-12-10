// src/store/slices/adminSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axios";

export const fetchAllUsers = createAsyncThunk("admin/fetchAllUsers", async () => {
  const response = await axiosInstance.get("/api/admin/users");
  return response.data;
});

export const updateUserRole = createAsyncThunk("admin/updateUserRole", async ({ userId, role }) => {
  const response = await axiosInstance.put(`/api/admin/users/${userId}/role`, { role });
  return response.data;
});

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    users: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.users = action.payload;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const index = state.users.findIndex((user) => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      });
  },
});

export default adminSlice.reducer;
