import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getUserProfile, updateUserProfile as updateProfileService } from "../../services/user";

export const fetchUserProfile = createAsyncThunk("user/fetchProfile", async () => {
  const response = await getUserProfile();
  return response;
});

export const updateProfile = createAsyncThunk("user/updateProfile", async (profileData) => {
  const response = await updateProfileService(profileData);
  return response;
});

const initialState = {
  name: localStorage.getItem("user_name") || null,
  email: localStorage.getItem("user_email") || null,
  role: localStorage.getItem("user_role") || null,
  isLoggedIn: !!localStorage.getItem("access_token"),
  status: "idle",
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action) => {
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.role = action.payload.role;
      state.isLoggedIn = true;
      localStorage.setItem("user_name", action.payload.name);
      localStorage.setItem("user_email", action.payload.email);
      localStorage.setItem("user_role", action.payload.role);
    },
    logout: (state) => {
      state.name = null;
      state.email = null;
      state.role = null;
      state.isLoggedIn = false;
      localStorage.removeItem("user_name");
      localStorage.removeItem("user_email");
      localStorage.removeItem("user_role");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.name = action.payload.name;
        state.email = action.payload.email;
        state.role = action.payload.role;
        state.isLoggedIn = true;
        localStorage.setItem("user_name", action.payload.name);
        localStorage.setItem("user_email", action.payload.email);
        localStorage.setItem("user_role", action.payload.role);
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.name = action.payload.name;
        state.email = action.payload.email;
        state.role = action.payload.role;
        localStorage.setItem("user_name", action.payload.name);
        localStorage.setItem("user_email", action.payload.email);
        localStorage.setItem("user_role", action.payload.role);
      });
  },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
