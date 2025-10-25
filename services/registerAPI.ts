import { api } from '../lib/api';
import type { AuthResponse, RegisterInput } from '../models';

/**
 * Register API Service
 * Handles user registration with validation
 */
export class RegisterAPI {
  /**
   * Validate email format
   * @param email - Email to validate
   * @returns boolean - Is valid email
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   * @param password - Password to validate
   * @returns object - Validation result with message
   */
  private static validatePassword(password: string): { isValid: boolean; message: string } {
    if (password.length < 8) {
      return { isValid: false, message: 'Mật khẩu phải có ít nhất 8 ký tự' };
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return { isValid: false, message: 'Mật khẩu phải có ít nhất 1 chữ thường' };
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return { isValid: false, message: 'Mật khẩu phải có ít nhất 1 chữ hoa' };
    }
    if (!/(?=.*\d)/.test(password)) {
      return { isValid: false, message: 'Mật khẩu phải có ít nhất 1 số' };
    }
    return { isValid: true, message: 'Mật khẩu hợp lệ' };
  }

  /**
   * Validate phone number format (Vietnamese)
   * @param phone - Phone to validate
   * @returns boolean - Is valid phone
   */
  private static isValidPhone(phone: string): boolean {
    const phoneRegex = /^(0|\+84)[3-9][0-9]{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }
  /**
   * Register new user
   * @param input - User registration data
   * @returns Promise<AuthResponse> - User data and token
   */
  static async register(input: RegisterInput): Promise<AuthResponse> {
    // Validate inputs before making API call
    if (!input.password) {
      throw new Error('Vui lòng nhập mật khẩu');
    }

    // Validate password strength
    const passwordValidation = this.validatePassword(input.password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.message);
    }

    // Validate email if provided
    if (input.email && !this.isValidEmail(input.email.trim())) {
      throw new Error('Email không đúng định dạng');
    }

    // Validate phone if provided
    if (input.phone && !this.isValidPhone(input.phone.trim())) {
      throw new Error('Số điện thoại không đúng định dạng (VD: 0123456789 hoặc +84123456789)');
    }

    // Check if at least one contact method is provided
    if (!input.email && !input.phone) {
      throw new Error('Vui lòng nhập ít nhất email hoặc số điện thoại');
    }

    const maxRetries = 3;
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`RegisterAPI: Attempt ${attempt}/${maxRetries} - Starting registration...`);
        console.log('RegisterAPI: Input data:', { 
          phone: input.phone ? '***' + input.phone.slice(-3) : 'none',
          email: input.email ? input.email.replace(/(.{2}).*(@.*)/, '$1***$2') : 'none',
          hasName: !!input.name,
          hasPassword: !!input.password
        });
        
        console.log('RegisterAPI: Making API call to /v1/auth/register...');
        console.log('RegisterAPI: Full URL will be:', 'https://prm-ecommerce.onrender.com/api/v1/auth/register');
        
        // Use the correct API v1 endpoint
        const endpoint = '/v1/auth/register';
        console.log(`RegisterAPI: Using endpoint: ${endpoint}`);
        
        const response = await api.post(endpoint, input);
        console.log(`RegisterAPI: Success with endpoint: ${endpoint}`);
        
        console.log('RegisterAPI: API response received:', response.status);
        console.log('RegisterAPI: Response data:', response.data);
      
        const data = response.data;
        
        // Validate response format for API v1
        if (!data || !data.data || !data.data.access_token) {
          console.error('RegisterAPI: Invalid response format:', data);
          throw new Error('Phản hồi từ server không hợp lệ');
        }
        
        // Create AuthResponse format from API v1 response
        const authResponse: AuthResponse = {
          user: {
            id: 'temp-id', // API v1 doesn't return user info, we'll use email as identifier
            email: input.email || input.phone || 'unknown',
            name: input.name,
            role: 'customer' as const
          },
          token: data.data.access_token
        };
        
        console.log('RegisterAPI: Registration successful for user:', authResponse.user.email);
        return authResponse;
        
      } catch (error: any) {
        lastError = error;
        console.error(`RegisterAPI: Attempt ${attempt} failed:`, error.message);
        console.error('RegisterAPI: Error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        
        // Nếu không phải lỗi network/timeout, không retry
        if (error.response?.status === 400 || error.response?.status === 409 || error.response?.status === 404) {
          console.error('RegisterAPI: Client error, not retrying');
          break;
        }
        
        // Nếu là attempt cuối, throw error
        if (attempt === maxRetries) {
          console.error('RegisterAPI: All attempts failed');
          break;
        }
        
        // Wait before retry (exponential backoff)
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`RegisterAPI: Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // Handle final error
    if (lastError.response?.status === 400) {
      const message = lastError.response?.data?.message || 'Dữ liệu không hợp lệ';
      throw new Error(message);
    } else if (lastError.response?.status === 404) {
      throw new Error('API đăng ký không khả dụng. Vui lòng liên hệ admin để được hỗ trợ.');
    } else if (lastError.response?.status === 409) {
      throw new Error('Email hoặc số điện thoại đã được sử dụng');
    } else if (lastError.response?.status === 422) {
      // API v1 might return 422 for validation errors
      const message = lastError.response?.data?.message || 'Dữ liệu không hợp lệ';
      throw new Error(message);
    } else if (lastError.response?.status >= 500) {
      throw new Error('Lỗi server. Vui lòng thử lại sau');
    } else if (lastError.message?.includes('timeout')) {
      throw new Error('Kết nối quá chậm. Vui lòng kiểm tra internet và thử lại');
    } else if (lastError.code === 'NETWORK_ERROR' || !lastError.response) {
      throw new Error('Không có kết nối mạng. Vui lòng kiểm tra internet');
    }
    
    throw new Error('Đăng ký thất bại. Vui lòng thử lại');
  }

  /**
   * Get password validation info for UI
   * @param password - Password to validate
   * @returns object - Validation details
   */
  static getPasswordValidationInfo(password: string): {
    isValid: boolean;
    message: string;
    requirements: {
      length: boolean;
      lowercase: boolean;
      uppercase: boolean;
      number: boolean;
    };
  } {
    const validation = this.validatePassword(password);
    return {
      isValid: validation.isValid,
      message: validation.message,
      requirements: {
        length: password.length >= 8,
        lowercase: /(?=.*[a-z])/.test(password),
        uppercase: /(?=.*[A-Z])/.test(password),
        number: /(?=.*\d)/.test(password),
      }
    };
  }

  /**
   * Validate email format for UI
   * @param email - Email to validate
   * @returns object - Validation result
   */
  static validateEmail(email: string): { isValid: boolean; message: string } {
    if (!email.trim()) {
      return { isValid: false, message: 'Vui lòng nhập email' };
    }
    if (!this.isValidEmail(email.trim())) {
      return { isValid: false, message: 'Email không đúng định dạng' };
    }
    return { isValid: true, message: 'Email hợp lệ' };
  }

  /**
   * Validate phone format for UI
   * @param phone - Phone to validate
   * @returns object - Validation result
   */
  static validatePhone(phone: string): { isValid: boolean; message: string } {
    if (!phone.trim()) {
      return { isValid: false, message: 'Vui lòng nhập số điện thoại' };
    }
    if (!this.isValidPhone(phone.trim())) {
      return { isValid: false, message: 'Số điện thoại không đúng định dạng' };
    }
    return { isValid: true, message: 'Số điện thoại hợp lệ' };
  }
}
