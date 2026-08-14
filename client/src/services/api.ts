import axios from 'axios';

let raw = (import.meta.env.VITE_API_URL || '/api').trim();
if (raw.endsWith('/')) {
  raw = raw.slice(0, -1);
}

// Auto-prefix https:// if user provided domain without protocol (e.g. api-production-e009.up.railway.app)
if (raw && !raw.startsWith('http://') && !raw.startsWith('https://') && !raw.startsWith('/')) {
  raw = `https://${raw}`;
}

const baseURL =
  raw.startsWith('http') && !raw.endsWith('/api')
    ? `${raw}/api`
    : raw;

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vmax_token');
  if (token && config.headers) { config.headers.Authorization = `Bearer ${token}`; }
  return config;
});

export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  googleLogin: (token: string) => api.post('/auth/google', { token }),
  facebookLogin: (accessToken: string) => api.post('/auth/facebook', { accessToken }),
  appleLogin: (idToken: string, user?: any) => api.post('/auth/apple', { idToken, user }),
  getProfile: () => api.get('/auth/profile'),

  updateProfile: (data: any) => api.patch('/auth/profile', data),
  createPhoneSession: (phone?: string) => api.post('/auth/phone-session', { phone }),
  checkPhoneSession: (sessionId: string) => api.get(`/auth/phone-session/${sessionId}`),
  verifyPhone: (code?: string, phone?: string) => api.post('/auth/verify-phone', { code, phone }),
  verifyEmail: () => api.post('/auth/verify-email'),
  requestAgentVerification: (data: { agencyName?: string; agentLicenseNo?: string }) =>
    api.post('/auth/request-agent-verification', data),
};

export const uploadAPI = {
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
};


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

export default api;
