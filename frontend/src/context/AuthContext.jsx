import { createContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/endpoints';
import { toast } from 'react-toastify';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await authAPI.getMe();
      if (data.success) setUser(data.data);
    } catch {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (credentials) => {
    const { data } = await authAPI.login(credentials);
    localStorage.setItem('token', data.data.token);
    setUser(data.data);
    return data;
  };

  const register = async (userData) => {
    const { data } = await authAPI.register(userData);
    localStorage.setItem('token', data.data.token);
    setUser(data.data);
    return data;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // ignore
    }
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out', { autoClose: 1000 });
  };

  const forgotPassword = async (username) => {
    const { data } = await authAPI.forgotPassword({ username });
    return data;
  };

  const resetPassword = async (payload) => {
    const { data } = await authAPI.resetPassword(payload);
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, forgotPassword, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}