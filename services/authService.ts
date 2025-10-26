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
      // Call login API service
      const data = await LoginAPI.login(credentials);
      
      // Store token securely
      await SecureStore.setItemAsync('auth-token', data.token);
      
      // Log full token for Postman testing
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
      // Call register API service
      const data = await RegisterAPI.register(input);
      
      // Store token securely
      await SecureStore.setItemAsync('auth-token', data.token);
      
      // Log full token for Postman testing
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
      await SecureStore.deleteItemAsync('auth-token');
      console.log('Token cleared successfully');
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('Đăng xuất thất bại');
    }
  }
}


