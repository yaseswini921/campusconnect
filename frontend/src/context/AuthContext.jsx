import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleUnauthorized = () => setUser(null);
    window.addEventListener('campusconnect:unauthorized', handleUnauthorized);
    const token = localStorage.getItem('campusconnect_token');
    if (!token) {
      setLoading(false);
      return () => window.removeEventListener('campusconnect:unauthorized', handleUnauthorized);
    }
    api.get('/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => localStorage.removeItem('campusconnect_token'))
      .finally(() => setLoading(false));

    return () => window.removeEventListener('campusconnect:unauthorized', handleUnauthorized);
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    async login(credentials) {
      const { data } = await api.post('/auth/login', credentials);
      localStorage.setItem('campusconnect_token', data.token);
      setUser(data.user);
      return data.user;
    },
    async register(values) {
      const { data } = await api.post('/auth/register', values);
      localStorage.setItem('campusconnect_token', data.token);
      setUser(data.user);
      return data.user;
    },
    logout() {
      localStorage.removeItem('campusconnect_token');
      setUser(null);
    },
    setUser
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider.');
  return context;
}
