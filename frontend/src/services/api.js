import axios from 'axios';
import safeLocalStorage from './storage';

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const isBrowser = typeof window !== 'undefined';
const isLocalHost =
  isBrowser && ['localhost', '127.0.0.1'].includes(window.location.hostname);
const isLocalApiUrl = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(
  configuredApiUrl || ''
);
const shouldUseConfiguredApiUrl =
  configuredApiUrl && !(import.meta.env.PROD && !isLocalHost && isLocalApiUrl);

export const API_BASE_URL = (
  shouldUseConfiguredApiUrl ||
  (import.meta.env.PROD && !isLocalHost ? 'https://ai-hospital-backend.onrender.com' : '')
).replace(/\/$/, '');

const api = axios.create({
  // In production, Vercel injects VITE_API_URL with the Render backend URL.
  // Locally, an empty baseURL lets Vite proxy /api/* to http://localhost:8000.
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


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

// Response interceptor for globally handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific global status codes like 401 or 500
    if (error.response && error.response.status === 401) {
      // Handle unauthorized / logout user if necessary
      safeLocalStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;
