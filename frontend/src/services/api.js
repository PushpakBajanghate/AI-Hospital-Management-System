import axios from 'axios';
import safeLocalStorage from './storage';

// In production (Vercel), VITE_API_URL must be set to your Render backend URL.
// In development, it defaults to http://localhost:8000 via the .env file.
const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

// Strip trailing slash for clean URL concatenation
export const API_BASE_URL = (configuredApiUrl || '').replace(/\/$/, '');

// Warn loudly if the API URL is missing in a browser context (production)
if (typeof window !== 'undefined' && !API_BASE_URL) {
  console.error(
    '[MedOS] VITE_API_URL is not set!\n' +
    'Login and all API calls will fail.\n' +
    'Set VITE_API_URL in your Vercel project → Settings → Environment Variables\n' +
    'Value should be: https://your-backend.onrender.com'
  );
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // 30-second timeout prevents silent hangs on cold-start Render instances
  timeout: 30000,
});

const clearSession = () => {
  safeLocalStorage.removeItem('token');
  safeLocalStorage.removeItem('refreshToken');
  delete api.defaults.headers.common.Authorization;
};

// Request interceptor — attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = safeLocalStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor — auto-refresh expired access tokens using refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Attempt token refresh if we get a 401 and haven't already retried
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/api/v1/auth/refresh') &&
      !originalRequest.url?.includes('/api/v1/auth/login')
    ) {
      originalRequest._retry = true;
      const refreshToken = safeLocalStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
            refresh_token: refreshToken,
          });
          const { access_token, refresh_token } = response.data;
          safeLocalStorage.setItem('token', access_token);
          safeLocalStorage.setItem('refreshToken', refresh_token);
          api.defaults.headers.common.Authorization = `Bearer ${access_token}`;
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed — clear session and let the caller handle it
          clearSession();
          return Promise.reject(refreshError);
        }
      }
    }

    // Clear session on any other 401
    if (error.response?.status === 401) {
      clearSession();
    }

    return Promise.reject(error);
  }
);

export { clearSession };
export default api;
