import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://earnrm-preview.preview.emergentagent.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (data) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Dashboard
export const getDashboardStats = async () => {
  const response = await api.get('/dashboard/stats');
  return response.data;
};

// Leads
export const getLeads = async () => {
  const response = await api.get('/leads');
  return response.data;
};

export const getLead = async (leadId) => {
  const response = await api.get(`/leads/${leadId}`);
  return response.data;
};

export const createLead = async (data) => {
  const response = await api.post('/leads', data);
  return response.data;
};

export const updateLeadStatus = async (leadId, status) => {
  const response = await api.put(`/leads/${leadId}/status`, { status });
  return response.data;
};

export const scoreLead = async (leadId) => {
  const response = await api.post(`/leads/${leadId}/score`);
  return response.data;
};

// Deals
export const getDeals = async () => {
  const response = await api.get('/deals');
  return response.data;
};

export const createDeal = async (data) => {
  const response = await api.post('/deals', data);
  return response.data;
};

export const updateDealStage = async (dealId, stage) => {
  const response = await api.put(`/deals/${dealId}/stage`, { stage });
  return response.data;
};

// Chat
export const getChatChannels = async () => {
  const response = await api.get('/chat/channels');
  return response.data;
};

export const getChannelMessages = async (channelId) => {
  const response = await api.get(`/chat/channels/${channelId}/messages`);
  return response.data;
};

export const sendMessage = async (channelId, content) => {
  const response = await api.post(`/chat/channels/${channelId}/messages`, { content });
  return response.data;
};

// AI Features
export const getLeadSummary = async (leadId) => {
  const response = await api.post(`/ai/lead-summary/${leadId}`);
  return response.data;
};

export const draftEmail = async (leadId, purpose, tone) => {
  const response = await api.post(`/ai/draft-email?lead_id=${leadId}&purpose=${purpose}&tone=${tone}`);
  return response.data;
};

export const smartSearch = async (query) => {
  const response = await api.post(`/ai/smart-search?query=${encodeURIComponent(query)}`);
  return response.data;
};

export default api;
