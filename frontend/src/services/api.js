import axios from 'axios';
import safeLocalStorage from './storage';

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
export const API_BASE_URL = (configuredApiUrl || '').replace(/\/$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const clearSession = () => {
  safeLocalStorage.removeItem('token');
  safeLocalStorage.removeItem('refreshToken');
  delete api.defaults.headers.common.Authorization;
};

// Request interceptor to attach authentication token
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

// Response interceptor for refresh-token retry on expired access tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/api/v1/auth/refresh')
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
          clearSession();
          return Promise.reject(refreshError);
        }
      }
    }

    if (error.response?.status === 401) {
      clearSession();
    }

    return Promise.reject(error);
  }
);

export { clearSession };
export default api;
