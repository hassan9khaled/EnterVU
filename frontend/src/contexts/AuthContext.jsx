// context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '~/api/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user exists in localStorage on app start
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse user from localStorage');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await loginUser(email, password);
    const userData = response.data.user || response.data;
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  };

  const register = async (name, email, password) => {
    const response = await registerUser(name, email, password);
    return response.data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};