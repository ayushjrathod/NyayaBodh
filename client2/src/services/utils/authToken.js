// Helper function to get tokens from localStorage
export const getTokens = () => {
  return {
    token: localStorage.getItem("access_token"),
    refreshToken: localStorage.getItem("refresh_token"),
  };
};

// Helper function to update tokens if refreshed
export const replaceJWTIfRefreshed = (response) => {
  const newToken = response.headers["x-new-token"];
  if (newToken) {
    localStorage.setItem("access_token", newToken);
  }
};
