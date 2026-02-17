import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await authAPI.login(username, password);
      
      const userData = {
        userId: response.userId,
        username: response.username,
        email: response.email,
        role: response.role,
      };

      setToken(response.token);
      setUser(userData);

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(userData));

      return { success: true, data: response };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed. Please try again.',
      };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await authAPI.register(username, email, password);
      
      const userData = {
        userId: response.userId,
        username: response.username,
        email: response.email,
        role: response.role,
      };

      setToken(response.token);
      setUser(userData);

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(userData));

      return { success: true, data: response };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.errors || 'Registration failed. Please try again.',
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
