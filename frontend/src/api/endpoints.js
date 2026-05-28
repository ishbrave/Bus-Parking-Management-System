import API from './axios';

export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
  logout: () => API.post('/auth/logout'),
  getMe: () => API.get('/auth/me'),
  forgotPassword: (data) => API.post('/auth/forgot-password', data),
  resetPassword: (data) => API.post('/auth/reset-password', data),
};

export const parkingSpaceAPI = {
  getAll: (params) => API.get('/parking-spaces', { params }),
  getById: (id) => API.get(`/parking-spaces/${id}`),
  create: (data) => API.post('/parking-spaces', data),
  update: (id, data) => API.put(`/parking-spaces/${id}`, data),
  delete: (id) => API.delete(`/parking-spaces/${id}`),
};

export const ownerAPI = {
  getAll: (params) => API.get('/owners', { params }),
  getById: (id) => API.get(`/owners/${id}`),
  create: (data) => API.post('/owners', data),
  update: (id, data) => API.put(`/owners/${id}`, data),
  delete: (id) => API.delete(`/owners/${id}`),
};

export const busAPI = {
  getAll: (params) => API.get('/buses', { params }),
  getById: (id) => API.get(`/buses/${id}`),
  create: (data) => API.post('/buses', data),
  update: (id, data) => API.put(`/buses/${id}`, data),
  delete: (id) => API.delete(`/buses/${id}`),
};

export const parkingRecordAPI = {
  getAll: (params) => API.get('/parking-records', { params }),
  getById: (id) => API.get(`/parking-records/${id}`),
  create: (data) => API.post('/parking-records', data),
  update: (id, data) => API.put(`/parking-records/${id}`, data),
  delete: (id) => API.delete(`/parking-records/${id}`),
  checkout: (id) => API.get(`/parking-records/checkout/${id}`),
};

export const paymentAPI = {
  getAll: (params) => API.get('/payments', { params }),
  create: (data) => API.post('/payments', data),
  delete: (id) => API.delete(`/payments/${id}`),
};

export const reportAPI = {
  getDashboard: () => API.get('/reports/dashboard'),
  getDailyIncome: (params) => API.get('/reports/daily-income', { params }),
  getAll: () => API.get('/reports/all'),
};