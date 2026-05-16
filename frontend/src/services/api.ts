import axios from 'axios';
// Use a type-only import to satisfy verbatimModuleSyntax
import type { InternalAxiosRequestConfig } from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// The parameter is now safely typed using the strict type-only import
API.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
export const API_BASE_URL = 'http://localhost:5000/api';