import axios from "axios";
import { apiConfig } from "../config/api";
import { getTokens, replaceJWTIfRefreshed } from "./utils/authToken";
// User Management
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(apiConfig.endpoints.auth.register, {
      email: userData.email,
      password: userData.password,
      fullname: userData.name, // Backend expects 'fullname'
      role: userData.role,
    });
    return response.data;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(apiConfig.endpoints.auth.login, {
      email: credentials.email,
      password: credentials.password,
    });

    if (response.data.access_token) {
      localStorage.setItem("access_token", response.data.access_token);
      localStorage.setItem("user_role", response.data.role);
      return response.data;
    }
    throw new Error("Invalid response from server");
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const getUserProfile = async () => {
  try {
    const { token, refreshToken } = getTokens();
    const response = await axios.get(apiConfig.endpoints.auth.profile, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-refresh-token": refreshToken,
      },
    });
    replaceJWTIfRefreshed(response);
    return response.data;
  } catch (error) {
    console.error("Fetching user profile failed:", error);
    throw error;
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const { token, refreshToken } = getTokens();
    const response = await axios.put(`${apiConfig.baseURL}/api/users/profile`, profileData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-refresh-token": refreshToken,
      },
    });
    replaceJWTIfRefreshed(response);
    console.log(profileData, "updated");

    return response.data;
  } catch (error) {
    console.error("Updating user profile failed:", error);
    throw error;
  }
};
