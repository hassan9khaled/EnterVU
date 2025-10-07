import { useState, useEffect } from 'react';
import { registerUser } from '~/api/apiClient';
import { loginUser } from '~/api/apiClient';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // for initial load

  // Load user from localStorage on startup
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await loginUser(email, password);
    const userData = response.data.user || response.data; // adjust based on your API response
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

  return { user, login, register, logout, loading };
};