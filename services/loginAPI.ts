import { api } from '../lib/api';
import type { AuthCredentials, AuthResponse } from '../models';

/**
 * Login API Service
 * Handles user authentication
 */
export class LoginAPI {
  /**
   * Authenticate user with email and password
   * @param credentials - User login credentials
   * @returns Promise<AuthResponse> - User data and token
   */
  static async login(credentials: AuthCredentials): Promise<AuthResponse> {
    try {
      console.log('Calling login API with:', { identifier: credentials.email });
      
      const response = await api.post('/v1/auth/login', {
        identifier: credentials.email, // Use email as identifier
        password: credentials.password
      });
      const data = response.data;
      
      // Validate response format for API v1
      if (!data || !data.data || !data.data.access_token) {
        console.error('LoginAPI: Invalid response format:', data);
        throw new Error('Phản hồi từ server không hợp lệ');
      }
      
      // Create AuthResponse format from API v1 response
      const authResponse: AuthResponse = {
        user: {
          id: data.data.userId || 'temp-id',
          email: credentials.email, // Use the identifier as email
          role: data.data.role || 'customer'
        },
        token: data.data.access_token
      };
      
      console.log('Login successful for user:', authResponse.user.email);
      return authResponse;
    } catch (error: any) {
      console.error('Login API error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        throw new Error('Email/số điện thoại hoặc mật khẩu không đúng');
      } else if (error.response?.status === 404) {
        throw new Error('Tài khoản không tồn tại');
      } else if (error.response?.status === 422) {
        // API v1 might return 422 for validation errors
        const message = error.response?.data?.message || 'Dữ liệu không hợp lệ';
        throw new Error(message);
      } else if (error.response?.status >= 500) {
        throw new Error('Lỗi server. Vui lòng thử lại sau');
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error('Không có kết nối mạng. Vui lòng kiểm tra internet');
      }
      
      throw new Error('Đăng nhập thất bại. Vui lòng thử lại');
    }
  }
}
