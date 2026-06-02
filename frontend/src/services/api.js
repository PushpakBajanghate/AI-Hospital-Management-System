import axios from 'axios';
import safeLocalStorage from './storage';

const api = axios.create({
  // Use empty baseURL so requests go through the Vite proxy (same origin).
  // This eliminates all CORS issues in standard/normal browser windows.
  // The Vite dev server proxies /api/* → http://localhost:8000
  baseURL: import.meta.env.VITE_API_URL || '',
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
