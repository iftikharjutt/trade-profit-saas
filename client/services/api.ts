import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

/**
 * SaaS API Service Layer
 * Centralized communication with the production backend.
 * Now handles the standardized { success, data } response format.
 */

const getAuthHeader = () => {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  config.headers = { ...config.headers, ...getAuthHeader() } as any;
  return config;
});

// Helper to extract data from standardized response
const unwrap = (response: any) => {
  if (response.data && response.data.success) {
    return response.data.data;
  }
  return response.data;
};

export const tradeService = {
  getTrades: async () => {
    const res = await api.get('/trades');
    return unwrap(res);
  },
  
  addTrade: async (tradeData: { product_name: string, type: 'BUY' | 'SELL', price: number, quantity: number }) => {
    const res = await api.post('/trades', tradeData);
    return unwrap(res);
  },

  deleteTrade: async (id: number) => {
    const res = await api.delete(`/trades/${id}`);
    return unwrap(res);
  }
};

export const reportService = {
  getSummary: async () => {
    const res = await api.get('/reports/summary');
    return unwrap(res);
  }
};

export const authService = {
  login: async (credentials: any) => {
    const res = await api.post('/auth/login', credentials);
    return unwrap(res);
  },
  register: async (data: any) => {
    const res = await api.post('/auth/register', data);
    return unwrap(res);
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return unwrap(res);
  }
};
