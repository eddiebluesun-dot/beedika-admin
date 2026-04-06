import { useState, useEffect, useCallback } from 'react';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.beedika.com';

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('beedika_token');
}
export function setToken(t) { localStorage.setItem('beedika_token', t); }
export function removeToken() {
  localStorage.removeItem('beedika_token');
  localStorage.removeItem('beedika_user');
}
export function getUser() {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem('beedika_user') || 'null'); }
  catch { return null; }
}
export function setUser(u) { localStorage.setItem('beedika_user', JSON.stringify(u)); }
export function isAdmin() {
  const u = getUser();
  return u?.role === 'ADMIN' || u?.role === 'ANALISTA';
}

export function useAuth() {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUserState(getUser());
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha: password }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao fazer login');
    // API retorna { success: true, data: { token, user } }
    const payload = json.data ?? json;
    const token = payload.token;
    const userData = payload.user;
    if (!token || !userData) throw new Error('Resposta inválida da API');
    setToken(token);
    setUser(userData);
    setUserState(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setUserState(null);
  }, []);

  return { user, loading, login, logout };
}
