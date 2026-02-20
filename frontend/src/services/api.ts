import axios from 'axios';
import type {
  User,
  SearchSession,
  Lead,
  PipelineStatus,
  ApiKeyStatus,
  ApiKeyTestResult,
  ModelInfo,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export async function register(
  email: string,
  password: string,
  full_name: string
): Promise<{ access_token: string; user: User }> {
  const res = await api.post('/auth/register', { email, password, full_name });
  return res.data;
}

export async function login(
  email: string,
  password: string
): Promise<{ access_token: string; user: User }> {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
}

export async function getMe(): Promise<User> {
  const res = await api.get('/auth/me');
  return res.data;
}

// Pipeline
export async function runPipeline(
  query: string,
  sender_context: string
): Promise<{ session_id: string }> {
  const res = await api.post('/pipeline/run', { query, sender_context });
  return res.data;
}

export async function getPipelineStatus(
  sessionId: string
): Promise<PipelineStatus> {
  const res = await api.get(`/pipeline/${sessionId}/status`);
  return res.data;
}

// Leads
export async function getLeads(sessionId: string): Promise<Lead[]> {
  const res = await api.get(`/leads/${sessionId}`);
  return res.data;
}

export async function toggleLead(
  leadId: string,
  isSelected: boolean
): Promise<void> {
  await api.patch(`/leads/${leadId}`, { is_selected: isSelected });
}

export async function updateLeadEmail(
  leadId: string,
  subject: string,
  body: string
): Promise<void> {
  await api.patch(`/leads/${leadId}/email`, {
    email_subject: subject,
    personalized_email: body,
  });
}

export async function generateEmails(
  sessionId: string,
  senderContext: string
): Promise<void> {
  await api.post(`/generate/${sessionId}`, {
    sender_context: senderContext,
  });
}

export async function downloadExportCsv(sessionId: string): Promise<void> {
  const res = await api.get(`/export/${sessionId}`, { responseType: 'blob' });
  const blob = new Blob([res.data], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const disposition = res.headers['content-disposition'] || '';
  const match = disposition.match(/filename="?([^"]+)"?/);
  a.download = match ? match[1] : `siyada_leads_${sessionId.slice(0, 8)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

// Sessions
export async function getSessions(): Promise<SearchSession[]> {
  const res = await api.get('/pipeline/sessions');
  return res.data;
}

// Settings
export async function getSettings(): Promise<ApiKeyStatus[]> {
  const res = await api.get('/settings/');
  return res.data;
}

export async function getKeyStatuses(): Promise<Record<string, { configured: boolean; masked_key: string }>> {
  const res = await api.get('/settings/');
  return res.data;
}

export async function updateKeys(
  keys: Record<string, string>
): Promise<void> {
  await api.put('/settings/keys', keys);
}

export async function testKey(service: string): Promise<ApiKeyTestResult> {
  const res = await api.post(`/settings/test/${service}`);
  return res.data;
}

// Models
export async function getModels(): Promise<ModelInfo[]> {
  const res = await api.get('/settings/models');
  return res.data;
}

export async function updateModel(model: string): Promise<void> {
  await api.put('/settings/model', { model });
}

export default api;
