/**
 * Authentication Context (src/context/AuthContext.jsx)
 * ---------------------------------------------------
 * What it does:
 *   Provides global user authentication state across the entire React application.
 * Why it is needed:
 *   Allows components (Navbar, ProtectedRoute, Dashboards) to know who is logged in,
 *   their user role (admin, faculty, student), and their department without prop-drilling.
 * How it works:
 *   1. On initial mount, reads 'token' from localStorage.
 *   2. If a token exists, validates it by calling GET /api/auth/me.
 *   3. Exposes login(), logout(), and user data through useAuth() hook.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Validate existing token and restore session on page reload
  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const response = await API.get('/auth/me');
          if (response.data && response.data.user) {
            setUser(response.data.user);
            setToken(storedToken);
          } else {
            logout();
          }
        } catch (error) {
          console.error('Session expired or invalid:', error.response?.data?.message || error.message);
          logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // Save credentials on login
  const login = (authToken, userData) => {
    localStorage.setItem('token', authToken);
    setToken(authToken);
    setUser(userData);
  };

  // Clear credentials on logout
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for consuming auth context cleanly
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
