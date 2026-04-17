import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../utils/axiosConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
      return response.data;
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = () => {
    window.location.href = 'http://localhost:8081/oauth2/authorization/google';
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // The backend endpoint is best-effort; local cleanup still happens.
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({ user, loading, login, logout, refreshUser: fetchCurrentUser }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
