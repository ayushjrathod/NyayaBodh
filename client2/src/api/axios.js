import axios from "axios";

const FRONTEND_URL = "http://localhost:5173";
// Use environment variable first, then fallback to localhost for development
const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: BACKEND_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    console.debug("API Response:", {
      status: response.status,
      data: response.data,
      headers: response.headers,
    });
    return response;
  },
  (error) => {
    console.error("Response Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const checkAuth = async () => {
  try {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      throw new Error("Missing auth data");
    }

    const response = await api.get("/api/auth/profile");

    localStorage.setItem("isAuthenticated", "true");
    window.dispatchEvent(new Event("auth-state-changed"));

    return true;
  } catch (error) {
    localStorage.clear();
    return false;
  }
};

export const register = async (data) => {
  try {
    const response = await api.post("/api/auth/register", data);
    return response.data;
  } catch (error) {
    console.error("Registration failed:", error.response?.data || error.message);
    throw error;
  }
};

export const verifyOTP = async (otp, userId) => {
  try {
    const response = await api.post("/api/auth/verify-otp", { otp, userId });
    return response.data;
  } catch (error) {
    console.error("OTP verification failed:", error.response?.data || error.message);
    throw error;
  }
};

export const login = async (data) => {
  try {
    const response = await api.post("/api/auth/login", data);
    const { access_token, role, user_id, fullname } = response.data;

    // Create user object from the response data
    const user = {
      id: user_id,
      role: role,
      fullname: fullname,
    };

    localStorage.clear();
    localStorage.setItem("token", access_token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("isAuthenticated", "true");

    console.log("Regular login - stored data:", {
      hasToken: Boolean(localStorage.getItem("token")),
      user: localStorage.getItem("user"),
      isAuthenticated: localStorage.getItem("isAuthenticated"),
    });

    window.dispatchEvent(new Event("auth-state-changed"));
    return response.data;
  } catch (error) {
    console.error("Login failed:", error.response?.data || error.message);
    throw error;
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await api.post("/api/auth/forgot-password", { email });
    return response.data;
  } catch (error) {
    console.error("Forgot password failed:", error.response?.data || error.message);
    throw {
      message: error.response?.data?.detail || "Failed to process forgot password request",
      status: error.response?.status,
    };
  }
};

export const resetPassword = async (token, newPassword) => {
  try {
    const response = await api.post("/api/auth/reset-password", {
      token,
      new_password: newPassword,
    });
    return response.data;
  } catch (error) {
    console.error("Reset password failed:", error.response?.data || error.message);
    throw {
      message: error.response?.data?.detail || "Failed to reset password",
      status: error.response?.status,
    };
  }
};

export const checkOAuthStatus = async (email) => {
  try {
    const response = await api.post("/api/auth/check-oauth", { email });
    return response.data.isOAuthUser;
  } catch (error) {
    return false;
  }
};

export const handleGoogleSignIn = (remember_me) => {
  localStorage.clear();

  const state = JSON.stringify({
    from: window.location.pathname,
    remember_me,
    timestamp: Date.now(),
  });

  const params = new URLSearchParams({
    remember_me: remember_me.toString(),
    state,
  });
  console.log("Starting OAuth flow:", { state, params: params.toString() });
  window.location.href = `${BACKEND_URL}/api/auth/google?${params}`;
};

export const logout = async () => {
  try {
    await api.post("/api/auth/logout");
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    localStorage.clear();
    document.cookie = "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    window.dispatchEvent(new Event("auth-state-changed"));
  }
};

export default api;