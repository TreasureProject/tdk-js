const AUTH_TOKEN_KEY = "tdk:authToken";
const AUTH_METHOD_KEY = "tdk:authMethod";

export const getStoredAuthToken = () =>
  localStorage.getItem(AUTH_TOKEN_KEY) || undefined;
export const setStoredAuthToken = (authToken: string) =>
  localStorage.setItem(AUTH_TOKEN_KEY, authToken);
export const clearStoredAuthToken = () =>
  localStorage.removeItem(AUTH_TOKEN_KEY);

export const getStoredAuthMethod = () =>
  localStorage.getItem(AUTH_METHOD_KEY) || undefined;
export const setStoredAuthMethod = (authMethod: string) =>
  localStorage.setItem(AUTH_METHOD_KEY, authMethod);
export const clearStoredAuthMethod = () =>
  localStorage.removeItem(AUTH_METHOD_KEY);
