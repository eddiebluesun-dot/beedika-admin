// lib/auth.js
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { login as apiLogin } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('beedika_admin_user');
    const token = localStorage.getItem('beedika_admin_token');
    if (stored && token) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await apiLogin(email, password);
    if (!['ADMIN', 'ANALISTA'].includes(data.user.role)) {
      throw new Error('Acesso restrito ao painel administrativo.');
    }
    localStorage.setItem('beedika_admin_token', data.token);
    localStorage.setItem('beedika_admin_user', JSON.stringify(data.user));
    setUser(data.user);
    router.push('/');
  };

  const logout = () => {
    localStorage.removeItem('beedika_admin_token');
    localStorage.removeItem('beedika_admin_user');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
