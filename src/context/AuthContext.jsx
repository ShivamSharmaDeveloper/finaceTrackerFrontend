import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import api from '../services/api';
import LoadingScreen from '../components/LoadingScreen';

// Authentication context for managing user session and access control
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const validateToken = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      await api.auth.validateToken({ token });
      const userResponse = await api.auth.getCurrentUser();
      if (userResponse.data) {
        setUser(userResponse.data);
        return true;
      }
      return false;
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      return false;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token && mounted) {
        const isValid = await validateToken();
        if (mounted) {
          setIsAuthenticated(isValid);
        }
      }
      if (mounted) {
        setLoading(false);
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, [validateToken]);

  const login = async (credentials) => {
    try {
      const response = await api.auth.login(credentials);
      const { token, refreshToken, user } = response.data;
      
      if (!token || !refreshToken || !user) {
        throw new Error('Invalid response from server');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      setUser(user);
      setIsAuthenticated(true);
      enqueueSnackbar(`Welcome back, ${user.username || 'user'}!`, { variant: 'success' });
      navigate('/');
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      const errorMessage = error.response?.data?.detail || error.userMessage || 'Login failed';
      enqueueSnackbar(errorMessage, { variant: 'error' });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (error) {
      // Proceed with cleanup even if logout API fails
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setIsAuthenticated(false);
      enqueueSnackbar('Logged out successfully', { variant: 'success' });
      navigate('/login');
    }
  };

  const updateUser = async (userData) => {
    try {
      const response = await api.auth.getCurrentUser();
      if (!response.data) {
        throw new Error('Failed to fetch user data');
      }
      const updatedUser = { ...response.data, ...userData };
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      enqueueSnackbar('Failed to update user data', { variant: 'error' });
      throw error;
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      login, 
      logout,
      user,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 