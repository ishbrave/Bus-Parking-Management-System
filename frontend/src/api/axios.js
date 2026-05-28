import axios from 'axios';
import { toast } from 'react-toastify';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const isAuthMe = url.includes('/auth/me') || url.includes('/auth/logout');
    if (!isAuthMe || error.response?.status !== 401) {
      const message = error.response?.data?.message || 'Something went wrong';
      toast.error(message, { autoClose: 1000 });
    }
    return Promise.reject(error);
  }
);

export default API;
