import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { clearSession } from '../services/api';

const AuthContext = createContext(null);

import safeLocalStorage from '../services/storage';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [theme, setTheme] = useState(() => {
    const saved = safeLocalStorage.getItem('theme');
    return saved || 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    safeLocalStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };


  const addToast = (message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Re-authenticate user session on mount
  useEffect(() => {
    const bootstrapAuth = async () => {
      const token = safeLocalStorage.getItem('token');
      if (token) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await api.get('/api/v1/auth/me');
          setUser(response.data);
        } catch (err) {
          console.error('Session restoration failed:', err);
          clearSession();
          setUser(null);
        }
      }
      setLoading(false);
    };
    bootstrapAuth();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await api.post('/api/v1/auth/login/json', { email, password });
      const { access_token, refresh_token } = response.data;
      
      safeLocalStorage.setItem('token', access_token);
      safeLocalStorage.setItem('refreshToken', refresh_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Fetch fresh profile details
      const profileResponse = await api.get('/api/v1/auth/me');
      setUser(profileResponse.data);
      addToast(`Welcome back, ${profileResponse.data.full_name || 'User'}!`, 'success');
      return profileResponse.data;
    } catch (err) {
      let errMsg = 'Login failed. Please check your credentials.';
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          errMsg = err.response.data.detail.map(e => e.msg).join(', ');
        } else {
          errMsg = err.response.data.detail;
        }
      }
      setError(errMsg);
      addToast(errMsg, 'error');
      throw new Error(errMsg);
    }
  };

  const register = async (fullName, email, password) => {
    setError(null);
    try {
      const response = await api.post('/api/v1/auth/register', {
        full_name: fullName,
        email,
        password,
      });
      addToast('Patient account successfully registered! Redirecting...', 'success');
      return response.data;
    } catch (err) {
      let errMsg = 'Registration failed. Try again.';
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          errMsg = err.response.data.detail.map(e => e.msg).join(', ');
        } else {
          errMsg = err.response.data.detail;
        }
      }
      setError(errMsg);
      addToast(errMsg, 'error');
      throw new Error(errMsg);
    }
  };

  const logout = async () => {
    try {
      if (safeLocalStorage.getItem('token')) {
        await api.post('/api/v1/auth/logout');
      }
    } catch (err) {
      console.warn('Logout request failed:', err);
    }
    clearSession();
    setUser(null);
    addToast('Signed out of MedOS secure console.', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        toasts,
        theme,
        toggleTheme,
        login,
        register,
        logout,
        setError,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be wrapped in an AuthProvider');
  }
  return context;
};
