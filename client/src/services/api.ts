import axios from 'axios';

export const getBaseUrl = (): string => {
  let url = (import.meta.env.VITE_API_URL || '').trim();
  if (!url) {
    return '/api';
  }
  // Auto-prefix https:// if provided domain without protocol (e.g. api-production-e009.up.railway.app)
  if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
    url = `https://${url}`;
  }
  // Trim trailing slash
  url = url.replace(/\/+$/, '');
  // Ensure it ends with /api
  if (!url.endsWith('/api') && !url.includes('/api/')) {
    url = `${url}/api`;
  }
  return url;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vmax_token') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('vmax_token');
      localStorage.removeItem('token');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data: any) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.patch('/auth/profile', data),
  changePassword: (data: any) => api.post('/auth/change-password', data),

  // Phone Login via Verify.mn MO SMS
  createPhoneLoginSession: (phone: string) => api.post('/auth/phone-login/session', { phone }),
  checkPhoneLoginSession: (sessionId: string) => api.get(`/auth/phone-login/session/${sessionId}`),
  sandboxApprovePhoneLogin: (sessionId: string) => api.post(`/auth/phone-login/sandbox-approve/${sessionId}`),

  // Authenticated Phone Verification
  createPhoneSession: (phone?: string) => api.post('/auth/phone-session', { phone }),
  checkPhoneSession: (sessionId: string) => api.get(`/auth/phone-session/${sessionId}`),
  verifyPhone: (code?: string, phone?: string) => api.post('/auth/verify-phone', { code, phone }),
  sendPhoneOtp: (phone: string) => api.post('/auth/send-phone-otp', { phone }),
  verifyPhoneOtp: (phone: string, code: string) => api.post('/auth/verify-phone-otp', { phone, code }),

  // Email Verification & Notifications
  sendEmailOtp: () => api.post('/auth/send-email-otp'),
  verifyEmail: (code?: string) => api.post('/auth/verify-email', { code }),
  sendVerificationEmail: () => api.post('/auth/send-email-otp'),

  // Password reset
  sendPasswordResetOtp: (data: { method: 'email' | 'phone'; identifier: string }) =>
    api.post('/auth/forgot-password/send-otp', data),
  resetPassword: (data: { method: 'email' | 'phone'; identifier: string; otp: string; newPassword: string }) =>
    api.post('/auth/forgot-password/reset', data),

  // Social Logins
  googleLogin: (tokenOrCredential: string) =>
    api.post('/auth/google', {
      token: tokenOrCredential,
      credential: tokenOrCredential,
      access_token: tokenOrCredential,
    }),
  facebookLogin: (accessToken: string) => api.post('/auth/facebook', { accessToken }),
  appleLogin: (identityToken: string) => api.post('/auth/apple', { identityToken }),

  // Agent verification
  requestAgentVerification: (data: { agencyName?: string; agentLicenseNo?: string }) =>
    api.post('/auth/request-agent-verification', data),
};

export const uploadsAPI = {
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/uploads/file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/uploads/avatar', formData);
  },
  uploadFiles: (files: File[]) => {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    return api.post('/uploads', formData);
  },
  uploadListingFiles: (listingId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    return api.post(`/uploads/listings/${listingId}`, formData);
  },
  uploadListingVideo: (listingId: string, videoFile: File) => {
    const formData = new FormData();
    formData.append('video', videoFile);
    return api.post(`/uploads/listings/${listingId}/video`, formData);
  },
};

export const uploadAPI = uploadsAPI;


export const locationsAPI = {
  getDistricts: () => api.get('/locations/districts'),
  getKhoroos: (district?: string) => api.get('/locations/khoroos', { params: { district } }),
  getAll: () => api.get('/locations'),
};

export const listingsAPI = {
  getAll: (params: any) => api.get('/listings', { params }),
  getOne: (id: string) => api.get(`/listings/${id}`),
  getMy: () => api.get('/listings/my'),
  create: (data: any) => api.post('/listings', data),
  close: (id: string) => api.patch(`/listings/${id}/close`),
  update: (id: string, data: any) => api.patch(`/listings/${id}`, data),
  remove: (id: string) => api.delete(`/listings/${id}`),
  renew: (id: string) => api.patch(`/listings/${id}/renew`),
  publish: (id: string) => api.patch(`/listings/${id}/publish`),
  promote: (id: string) => api.patch(`/listings/${id}/promote`),
  share: (id: string) => api.post(`/listings/${id}/share`),
  revealPhone: (id: string, user?: any) => api.post(`/listings/${id}/reveal-contact`, { user }),
  getContactAuditLogs: (id: string) => api.get(`/listings/${id}/contact-audit-logs`),
  getMyContactAuditLogs: () => api.get('/listings/my/contact-audit-logs'),
  exportExcel: (myOnly?: boolean) =>
    api.get('/listings/export/excel', {
      params: { myOnly },
      responseType: 'blob',
    }),
  downloadTemplate: () =>
    api.get('/listings/import/template', {
      responseType: 'blob',
    }),
  importExcel: (formData: FormData) =>
    api.post('/listings/import/excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
};

export const projectsAPI = {
  getAll: (params?: any) => api.get('/projects', { params }),
  getOne: (id: string) => api.get(`/projects/${id}`),
  create: (data: any) => api.post('/projects', data),
  update: (id: string, data: any) => api.patch(`/projects/${id}`, data),
  remove: (id: string) => api.delete(`/projects/${id}`),
};

export const aiAPI = {
  chat: (data: { message: string; history?: any[] }) => api.post('/ai/chat', data),
  generateDescription: (data: {
    type: string;
    category?: string;
    district: string;
    khoroo?: string;
    location?: string;
    areaSqm: number;
    rooms?: number;
    floor?: number;
    totalFloors?: number;
    price?: number;
    highlights?: string[];
  }) => api.post('/ai/generate-description', data),
  estimatePrice: (data: {
    type: string;
    category?: string;
    district: string;
    khoroo?: string;
    areaSqm: number;
    price?: number;
  }) => api.post('/ai/estimate-price', data),
};

export const chatAPI = {
  startConversation: (listingId: string, initialMessage?: string) =>
    api.post('/chat/start', { listingId, initialMessage }),
  getConversations: () => api.get('/chat/conversations'),
  getMessages: (conversationId: string) =>
    api.get(`/chat/conversations/${conversationId}/messages`),
  sendMessage: (conversationId: string, content: string, imageUrl?: string) =>
    api.post(`/chat/conversations/${conversationId}/messages`, { content, imageUrl }),
  deleteConversation: (conversationId: string) =>
    api.delete(`/chat/conversations/${conversationId}`),
  deleteMessage: (conversationId: string, messageId: string) =>
    api.delete(`/chat/conversations/${conversationId}/messages/${messageId}`),
  getUnreadCount: () => api.get('/chat/unread-count'),
};

export default api;
