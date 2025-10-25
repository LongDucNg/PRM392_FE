import { useCallback, useState } from 'react';
import type { AuthCredentials } from '../models';
import { AuthService } from '../services/authService';
import { useAuthStore } from '../state/auth';

export function useLoginViewModel() {
  const loginToStore = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChangeEmail = useCallback((value: string) => {
    setEmail(value);
    setError(null); // Clear error when user starts typing
  }, []);
  
  const handleChangePassword = useCallback((value: string) => {
    setPassword(value);
    setError(null); // Clear error when user starts typing
  }, []);

  const submit = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!email || !password) {
        const errorMsg = 'Vui lòng nhập email và mật khẩu';
        setError(errorMsg);
        return { ok: false as const, error: errorMsg };
      }
      
      const credentials: AuthCredentials = { email, password };
      const { user, token } = await AuthService.login(credentials);
      loginToStore({ user, token });
      return { ok: true as const };
    } catch (e: any) {
      console.error('Login error:', e);
      
      // Extract meaningful error message
      let errorMessage = 'Đăng nhập thất bại. Vui lòng thử lại';
      
      if (e?.message) {
        if (e.message.includes('Email/số điện thoại hoặc mật khẩu không đúng')) {
          errorMessage = 'Email/số điện thoại hoặc mật khẩu không đúng';
        } else if (e.message.includes('Tài khoản không tồn tại')) {
          errorMessage = 'Tài khoản không tồn tại';
        } else if (e.message.includes('Không có kết nối mạng')) {
          errorMessage = 'Không có kết nối mạng. Vui lòng kiểm tra internet';
        } else if (e.message.includes('Lỗi server')) {
          errorMessage = 'Lỗi server. Vui lòng thử lại sau';
        } else {
          errorMessage = e.message;
        }
      }
      
      setError(errorMessage);
      return { ok: false as const, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [email, password, loginToStore]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    state: { email, password, loading, error },
    actions: { 
      setEmail: handleChangeEmail, 
      setPassword: handleChangePassword, 
      submit,
      clearError
    },
  };
}


