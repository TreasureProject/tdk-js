const AUTH_TOKEN_KEY = "tdk:authToken";

export const getStoredAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY);
export const setStoredAuthToken = (authToken: string) =>
  localStorage.setItem(AUTH_TOKEN_KEY, authToken);
export const clearStoredAuthToken = () =>
  localStorage.removeItem(AUTH_TOKEN_KEY);
