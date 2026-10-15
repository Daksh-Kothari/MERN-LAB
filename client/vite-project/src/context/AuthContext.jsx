import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { axiosInstance } from '../axiosCalls/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch current user profile on mount
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/me');
      if (res.data && (res.data.fullName || res.data.email || res.data._id)) {
        setUser(res.data);
      } else {
        setUser(null);
      }
      setError(null);
    } catch (err) {
      setUser(null);
      // Not logging error here as unauthenticated user is a valid initial state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.post('/login', credentials);
      if (res.data && res.data.success) {
        // Fetch or set user profile after successful login
        if (res.data.customer) {
          setUser(res.data.customer);
        } else {
          await fetchProfile();
        }
        return { success: true, message: res.data.message || 'Login successful' };
      } else {
        const msg = res.data?.message || 'Login failed';
        setError(msg);
        return { success: false, message: msg };
      }
    } catch (err) {
      const msg = err.response?.data?.message || (!err.response ? 'Unable to connect to server. Please make sure the backend is running.' : 'Invalid email or password');
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.post('/register', formData);
      if (res.data && res.data.success) {
        return { success: true, message: res.data.message || 'Account created successfully!' };
      } else {
        const msg = res.data?.message || 'Registration failed';
        setError(msg);
        return { success: false, message: msg };
      }
    } catch (err) {
      const msg = err.response?.data?.message || (!err.response ? 'Unable to connect to server. Please make sure the backend is running.' : 'Failed to create account. Please try again.');
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await axiosInstance.post('/logout');
      setUser(null);
      setError(null);
      return { success: true };
    } catch (err) {
      console.error('Logout request failed:', err);
      setUser(null);
      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    fetchProfile,
    setError,
    clearError: () => setError(null)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
