// src/store/slices/adminSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { apiConfig } from "../../config/api";

const getAuthToken = () => localStorage.getItem("access_token");
const headers = () => ({ Authorization: `Bearer ${getAuthToken()}` });

export const fetchAllUsers = createAsyncThunk("admin/fetchAllUsers", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(apiConfig.endpoints.admin.users, { headers: headers() });
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

export const updateUser = createAsyncThunk("admin/updateUser", async ({ userId, userData }, { rejectWithValue }) => {
  try {
    const response = await axios.put(
      apiConfig.endpoints.admin.updateUser(userId),
      userData, // Make sure this matches UserUpdate model
      { headers: headers() }
    );
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { detail: "Update failed" });
  }
});

export const createUser = createAsyncThunk("admin/createUser", async (userData, { rejectWithValue }) => {
  try {
    const response = await axios.post(apiConfig.endpoints.auth.register, userData, { headers: headers() });
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
});

export const deleteUser = createAsyncThunk("admin/deleteUser", async (userId, { rejectWithValue }) => {
  try {
    await axios.delete(apiConfig.endpoints.admin.deleteUser(userId), { headers: headers() });
    return userId;
  } catch (err) {
    return rejectWithValue(err.response.data);
  }
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
      .addCase(fetchAllUsers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.users = action.payload;
        state.status = "succeeded";
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex((user) => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.push(action.payload);
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((user) => user.id !== action.payload);
      });
  },
});

export default adminSlice.reducer;
