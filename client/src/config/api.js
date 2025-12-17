// API Configuration
// Use environment variables first, then fallback to production URL
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://nyaybodh-backend-1750354950-7824ed4d28cf.herokuapp.com";
const AUTH_BASE_URL = import.meta.env.VITE_AUTH_BASE_URL || API_BASE_URL;

export const apiConfig = {
  baseURL: API_BASE_URL,
  authBaseURL: AUTH_BASE_URL,
  endpoints: {
    // Chat endpoints
    ask: `${API_BASE_URL}/ask`,
    getReady: (id) => `${API_BASE_URL}/get-ready/${id}`,

    // Search endpoints
    search: (type) => `${API_BASE_URL}/search/${type}`,
    searchEntity: `${API_BASE_URL}/search/entity`,
    searchSemantic: `${API_BASE_URL}/search/semantic`,

    // Recommendation endpoints
    recommend: (uuid) => `${API_BASE_URL}/recommend/${uuid}`,

    // Auth endpoints (all through main API server)
    auth: {
      login: `${AUTH_BASE_URL}/api/auth/login`,
      register: `${AUTH_BASE_URL}/api/auth/register`,
      logout: `${AUTH_BASE_URL}/api/auth/logout`,
      profile: `${AUTH_BASE_URL}/api/auth/profile`,
      forgotPassword: `${AUTH_BASE_URL}/api/auth/forgot-password`,
      resetPassword: `${AUTH_BASE_URL}/api/auth/reset-password`,
      verifyOtp: `${AUTH_BASE_URL}/api/auth/verify-otp`,
      resendOtp: `${AUTH_BASE_URL}/api/auth/resend-otp`,
      refresh: `${AUTH_BASE_URL}/api/auth/refresh`,
      google: `${AUTH_BASE_URL}/api/auth/google`,
      googleCallback: `${AUTH_BASE_URL}/api/auth/google/callback`,
      googleVerify: `${AUTH_BASE_URL}/api/auth/google/verify`,
    },
    // Admin endpoints
    admin: {
      users: `${AUTH_BASE_URL}/api/admin/users`,
      deleteUser: (userId) => `${AUTH_BASE_URL}/api/admin/users/${userId}`,
      updateUser: (userId) => `${AUTH_BASE_URL}/api/admin/users/${userId}`,
    },
  },
};

export default apiConfig;
