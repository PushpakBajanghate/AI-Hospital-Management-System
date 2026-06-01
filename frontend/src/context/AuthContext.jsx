import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
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
      const token = localStorage.getItem('token');
      if (token) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await api.get('/api/v1/auth/me');
          setUser(response.data);
        } catch (err) {
          console.error('Session restoration failed:', err);
          logout();
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
      const { access_token, role, name } = response.data;
      
      localStorage.setItem('token', access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Fetch fresh profile details
      const profileResponse = await api.get('/api/v1/auth/me');
      setUser(profileResponse.data);
      addToast(`Welcome back, ${profileResponse.data.full_name || 'User'}!`, 'success');
      return profileResponse.data;
    } catch (err) {
      const errMsg = err.response?.data?.detail || 'Login failed. Please check your credentials.';
      setError(errMsg);
      addToast(errMsg, 'error');
      throw new Error(errMsg);
    }
  };

  const register = async (fullName, email, password, role) => {
    setError(null);
    try {
      const response = await api.post('/api/v1/auth/register', {
        full_name: fullName,
        email,
        password,
        role,
      });
      addToast('Profile successfully registered! Redirecting...', 'success');
      return response.data;
    } catch (err) {
      const errMsg = err.response?.data?.detail || 'Registration failed. Try again.';
      setError(errMsg);
      addToast(errMsg, 'error');
      throw new Error(errMsg);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
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
export default AuthContext;
