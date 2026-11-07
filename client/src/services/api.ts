import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
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
  requestPasswordReset: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data: any) => api.post('/auth/reset-password', data),

  // Social Logins
  googleLogin: (credential: string) => api.post('/auth/google', { credential }),
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
    return api.post('/uploads/file', formData);
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

export default api;
