import { api } from '../lib/api';

/**
 * Forgot Password API Service
 * Handles password reset functionality with OTP
 */
export class ForgotPasswordAPI {
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
   * Request password reset - send email with OTP
   * @param email - User email address
   * @returns Promise<any> - Response data
   */
  static async requestReset(email: string): Promise<any> {
    try {
      // Validate email format
      if (!email.trim()) {
        throw new Error('Vui lòng nhập email');
      }
      
      if (!this.isValidEmail(email.trim())) {
        throw new Error('Email không đúng định dạng');
      }

      console.log('ForgotPasswordAPI: Requesting password reset for:', email);
      
      const response = await api.post('/v1/auth/reset-pass', { email: email.trim() });
      const data = response.data;
      
      console.log('ForgotPasswordAPI: Reset request successful');
      return data;
    } catch (error: any) {
      console.error('ForgotPasswordAPI: Request reset error:', error);
      
      // Handle validation errors
      if (error.message.includes('Email không đúng định dạng') || 
          error.message.includes('Vui lòng nhập email')) {
        throw error;
      }
      
      // Handle API errors
      if (error.response?.status === 400) {
        const message = error.response?.data?.message || 'Email không hợp lệ';
        throw new Error(message);
      } else if (error.response?.status === 404) {
        throw new Error('Email không tồn tại trong hệ thống');
      } else if (error.response?.status >= 500) {
        throw new Error('Lỗi server. Vui lòng thử lại sau');
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error('Không có kết nối mạng. Vui lòng kiểm tra internet');
      }
      
      throw new Error('Gửi email reset thất bại. Vui lòng thử lại');
    }
  }

  /**
   * Set new password with reset token
   * @param rawToken - Reset token from email
   * @param password - New password
   * @param confirmPassword - Password confirmation
   * @returns Promise<any> - Response data
   */
  static async setNewPassword(
    rawToken: string, 
    password: string, 
    confirmPassword: string
  ): Promise<any> {
    try {
      // Validate inputs
      if (!rawToken.trim()) {
        throw new Error('Vui lòng nhập token từ email');
      }
      
      if (!password) {
        throw new Error('Vui lòng nhập mật khẩu mới');
      }
      
      if (!confirmPassword) {
        throw new Error('Vui lòng xác nhận mật khẩu');
      }
      
      if (password !== confirmPassword) {
        throw new Error('Mật khẩu xác nhận không khớp');
      }
      
      // Validate password strength
      const passwordValidation = this.validatePassword(password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.message);
      }

      console.log('ForgotPasswordAPI: Setting new password...');
      
      const response = await api.post('/v1/auth/new-pass', {
        raw_token: rawToken.trim(),
        password: password,
        confirm_password: confirmPassword
      });
      const data = response.data;
      
      console.log('ForgotPasswordAPI: Password reset successful');
      return data;
    } catch (error: any) {
      console.error('ForgotPasswordAPI: Set new password error:', error);
      
      // Handle validation errors
      if (error.message.includes('Vui lòng') || 
          error.message.includes('Mật khẩu') ||
          error.message.includes('Token')) {
        throw error;
      }
      
      // Handle API errors
      if (error.response?.status === 400) {
        const message = error.response?.data?.message || 'Dữ liệu không hợp lệ';
        throw new Error(message);
      } else if (error.response?.status === 401) {
        throw new Error('Token không hợp lệ hoặc đã hết hạn');
      } else if (error.response?.status === 422) {
        const message = error.response?.data?.message || 'Mật khẩu không khớp hoặc không đủ mạnh';
        throw new Error(message);
      } else if (error.response?.status >= 500) {
        throw new Error('Lỗi server. Vui lòng thử lại sau');
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error('Không có kết nối mạng. Vui lòng kiểm tra internet');
      }
      
      throw new Error('Đặt lại mật khẩu thất bại. Vui lòng thử lại');
    }
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
}
