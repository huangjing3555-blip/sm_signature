export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Local authentication - no OAuth
// Store token in localStorage
export const setAuthToken = (token: string) => {
  localStorage.setItem("auth_token", token);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem("auth_token");
};

export const removeAuthToken = () => {
  localStorage.removeItem("auth_token");
};

// Get Authorization header for API requests
export const getAuthHeader = (): { Authorization?: string } => {
  const token = getAuthToken();
  if (token) {
    return {
      Authorization: `Bearer ${token}`,
    };
  }
  return {};
};
