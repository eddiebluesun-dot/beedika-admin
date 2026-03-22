// lib/api.js
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.beedika.com';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// Injeta token automaticamente
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('beedika_admin_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redireciona para login se 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('beedika_admin_token');
      localStorage.removeItem('beedika_admin_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const login = (email, password) =>
  api.post('/api/auth/login', { email, password }).then((r) => r.data);

// ─── Admin ────────────────────────────────────────────────────────────────────
export const getDashboard = () =>
  api.get('/api/admin/dashboard').then((r) => r.data);

export const getBills = (params) =>
  api.get('/api/admin/bills', { params }).then((r) => r.data);

export const getClientes = () =>
  api.get('/api/admin/clientes').then((r) => r.data);

export const getFinanceiro = () =>
  api.get('/api/admin/financeiro').then((r) => r.data);

// ─── Leads ────────────────────────────────────────────────────────────────────
export const getLeads = (params) =>
  api.get('/api/leads', { params }).then((r) => r.data);

export const updateLead = (id, data) =>
  api.put(`/api/leads/${id}`, data).then((r) => r.data);

export const distribuirLead = (id, parceiro_id) =>
  api.post(`/api/leads/${id}/distribuir`, { parceiro_id }).then((r) => r.data);

// ─── WhatsApp ─────────────────────────────────────────────────────────────────
export const getConversations = () =>
  api.get('/api/whatsapp/conversations').then((r) => r.data);

export const getWhatsAppStatus = () =>
  api.post('/api/whatsapp/proxy', { action: 'get_status' }).then((r) => r.data);

export const sendWhatsAppMessage = (number, text) =>
  api.post('/api/whatsapp/proxy', { action: 'send_text', number, text }).then((r) => r.data);

export const setWebhook = () =>
  api.post('/api/whatsapp/proxy', { action: 'set_webhook' }).then((r) => r.data);
