import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const FCM_TOKEN_KEY = 'fcmToken';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth on mount
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setToken(token);
      setUser(user);
      
      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  };

  const signup = async (userData, photoFile = null) => {
    try {
      let response;
      if (userData.role === 'agent' || photoFile) {
        const fd = new FormData();
        Object.entries(userData).forEach(([key, value]) => {
          if (value !== undefined && value !== null && key !== 'photo') {
            fd.append(key, typeof value === 'boolean' ? String(value) : value);
          }
        });
        if (photoFile) fd.append('photo', photoFile);
        response = await api.post('/auth/signup', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        response = await api.post('/auth/signup', userData);
      }
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setToken(token);
      setUser(user);
      
      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Signup failed'
      };
    }
  };

  const logout = async () => {
    const token = localStorage.getItem(FCM_TOKEN_KEY);
    if (token) {
      try {
        await api.delete('/notifications/fcm', { data: { fcmToken: token } });
      } catch {
        // ignore
      }
      localStorage.removeItem(FCM_TOKEN_KEY);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (nextUser) => {
    localStorage.setItem('user', JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    setUser: updateUser,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
