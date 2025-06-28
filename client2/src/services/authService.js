import axiosInstance from "../api/axios";

export const registerUser = async (userData) => {
  try {
    const response = await axiosInstance.post("/api/auth/register", userData);
    return response.data;
  } catch (error) {
    console.error("User registration failed:", error);
    throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await axiosInstance.post("/api/auth/login", credentials);
    const { access_token, refresh_token, role, name, email } = response.data;
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);
    localStorage.setItem("user_role", role);
    localStorage.setItem("user_name", name);
    localStorage.setItem("user_email", email);
    return response.data;
  } catch (error) {
    console.error("User login failed:", error);
    throw error;
  }
};

export const logoutUser = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user_role");
  localStorage.removeItem("user_name");
  localStorage.removeItem("user_email");
};
