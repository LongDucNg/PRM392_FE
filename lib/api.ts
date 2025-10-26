import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://prm-ecommerce.onrender.com/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Tăng timeout lên 30s
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth-token');
  
  if (token) {
    if (!config.headers) {
      config.headers = {} as any;
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

api.interceptors.response.use(
  (res) => {
    return res;
  },
  (err) => {
    // Only log non-server errors
    if (err.response?.status < 500 && err.response?.status >= 400) {
      console.error('API Error:', err.message, err.config?.url, err.response?.data);
    }
    return Promise.reject(err);
  }
);


