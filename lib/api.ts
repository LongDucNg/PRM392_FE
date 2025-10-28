// Module API: cấu hình Axios instance dùng chung (baseURL, headers, interceptors)
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Base URL lấy từ biến môi trường Expo, fallback về endpoint mặc định
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://prm-ecommerce.onrender.com/api';

// Tạo Axios instance với timeout và header mặc định
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Tăng timeout lên 30s
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor request: tự động gắn Authorization Bearer token nếu có
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

// Interceptor response: chỉ log các lỗi 4xx (tránh noise từ 5xx do server)
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


