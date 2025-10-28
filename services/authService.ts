// AuthService: điều phối đăng nhập/đăng ký và quản lý token an toàn
import * as SecureStore from 'expo-secure-store';
import type { AuthCredentials, AuthResponse, RegisterInput } from '../models';
import { LoginAPI } from './loginAPI';
import { RegisterAPI } from './registerAPI';

/**
 * Auth Service - Main authentication orchestrator
 * Handles token management and coordinates with specific API services
 */
export class AuthService {
  /**
   * Login user with credentials
   * @param credentials - User login credentials
   * @returns Promise<AuthResponse> - User data and token
   */
  static async login(credentials: AuthCredentials): Promise<AuthResponse> {
    try {
      // Gọi API đăng nhập
      const data = await LoginAPI.login(credentials);
      
      // Lưu token vào SecureStore (mã hoá bởi hệ điều hành)
      await SecureStore.setItemAsync('auth-token', data.token);
      
      // In ra token dạng Bearer để hỗ trợ test bằng Postman
      console.log('═══════════════════════════════════════');
      console.log('🔑 LOGIN SUCCESS - TOKEN FOR POSTMAN:');
      console.log('═══════════════════════════════════════');
      console.log('Bearer ' + data.token);
      console.log('═══════════════════════════════════════');
      
      return data;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  }

  /**
   * Register new user
   * @param input - User registration data
   * @returns Promise<AuthResponse> - User data and token
   */
  static async register(input: RegisterInput): Promise<AuthResponse> {
    try {
      // Gọi API đăng ký
      const data = await RegisterAPI.register(input);
      
      // Lưu token vào SecureStore
      await SecureStore.setItemAsync('auth-token', data.token);
      
      // In ra token dạng Bearer để hỗ trợ test bằng Postman
      console.log('═══════════════════════════════════════');
      console.log('🔑 REGISTER SUCCESS - TOKEN FOR POSTMAN:');
      console.log('═══════════════════════════════════════');
      console.log('Bearer ' + data.token);
      console.log('═══════════════════════════════════════');
      
      return data;
    } catch (error) {
      console.error('❌ Register failed:', error);
      throw error;
    }
  }

  /**
   * Logout user and clear stored token
   */
  static async logout(): Promise<void> {
    try {
      // Xoá token khỏi SecureStore
      await SecureStore.deleteItemAsync('auth-token');
      console.log('Token cleared successfully');
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('Đăng xuất thất bại');
    }
  }
}


