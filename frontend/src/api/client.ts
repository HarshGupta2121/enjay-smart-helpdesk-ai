import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Enterprise-ready Axios instance
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  withCredentials: true, // Crucial for sending HttpOnly cookies (Refresh Token)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Access Token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Handle Global Errors & Token Refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 Unauthorized, and we haven't already retried this request
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      // Don't intercept login or refresh failures to prevent infinite loops
      originalRequest.url !== '/auth/login' &&
      originalRequest.url !== '/auth/refresh-token'
    ) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token using the HttpOnly cookie
        const res = await axios.post(
          `${api.defaults.baseURL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = res.data.data;
        const { user } = useAuthStore.getState();

        if (user) {
          // Update global Zustand store with the new access token
          useAuthStore.getState().setAuth(user, accessToken);
        }

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails (e.g., refresh token expired/revoked), log the user out
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);