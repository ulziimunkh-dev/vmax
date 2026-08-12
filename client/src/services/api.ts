import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

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
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.patch('/auth/profile', data),
};

export const listingsAPI = {
  getAll: (params: any) => api.get('/listings', { params }),
  getOne: (id: string) => api.get(`/listings/${id}`),
  getMy: () => api.get('/listings/my'),
  create: (data: FormData) => api.post('/listings', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  close: (id: string) => api.patch(`/listings/${id}/close`),
  update: (id: string, data: any) => api.patch(`/listings/${id}`, data),
  remove: (id: string) => api.delete(`/listings/${id}`),
  renew: (id: string) => api.patch(`/listings/${id}/renew`),
  publish: (id: string) => api.patch(`/listings/${id}/publish`),
};

export default api;
