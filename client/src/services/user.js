import axios from "axios";
import { getTokens, replaceJWTIfRefreshed } from "./utils/authToken";
const API_URL = "http://127.0.0.1:8000";
// User Management
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/register`, {
      email: userData.email,
      password: userData.password,
      fullname: userData.name, // Backend expects 'name' instead of 'fullname'
      role: "USER",
    });
    return response.data;
  } catch (error) {
    console.error("User registration failed:", error);
    throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, credentials);
    const { access_token, user } = response.data;
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("user_role", user.role);
    return response.data;
  } catch (error) {
    console.error("User login failed:", error);
    throw error;
  }
};

export const getUserProfile = async () => {
  try {
    const { token, refreshToken } = getTokens();
    const response = await axios.get(`${API_URL}/api/auth/profile`, {
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
    const response = await axios.put(`${API_URL}/api/users/profile`, profileData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-refresh-token": refreshToken,
      },
    });
    replaceJWTIfRefreshed(response);
    console.log(profileData, "updated");

    return response.data;
  } catch (error) {
    console.error("Updating user profile failed:", error, token);
    throw error;
  }
};
