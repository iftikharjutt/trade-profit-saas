import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

const unwrap = (response: any) => {
  if (response.data && response.data.success) {
    return response.data.data;
  }
  return response.data;
};

export const tradeService = {
  getTrades: async (params = {}) => {
    const res = await api.get('/trades', { params });
    return unwrap(res);
  },
  addTrade: async (data: any) => {
    const res = await api.post('/trades', data);
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
  },
  getRiskAssessment: async () => {
    const res = await api.get('/reports/risk-assessment');
    return unwrap(res);
  }
};

export const portfolioService = {
  getPortfolios: async () => {
    const res = await api.get('/portfolios');
    return unwrap(res);
  },
  createPortfolio: async (data: any) => {
    const res = await api.post('/portfolios', data);
    return unwrap(res);
  },
  deletePortfolio: async (id: number) => {
    const res = await api.delete(`/portfolios/${id}`);
    return unwrap(res);
  }
};

export const paymentService = {
  createCheckoutSession: async (priceId: string) => {
    const res = await api.post('/payments/create-checkout-session', { priceId });
    return unwrap(res);
  }
};

export const authService = {
  login: async (credentials: any) => {
    const res = await api.post('/auth/login', credentials);
    const data = unwrap(res);
    if (data.token) localStorage.setItem('token', data.token);
    return data;
  },
  logout: () => {
    localStorage.removeItem('token');
  }
};
