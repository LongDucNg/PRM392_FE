import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import type { AuthCredentials } from '../models';
import { AuthService } from '../services/authService';
import { useAuthStore } from '../state/auth';

export function useLoginViewModel() {
  const loginToStore = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangeEmail = useCallback((value: string) => setEmail(value), []);
  const handleChangePassword = useCallback((value: string) => setPassword(value), []);

  const submit = useCallback(async () => {
    try {
      setLoading(true);
      if (!email || !password) {
        Alert.alert('Thông báo', 'Vui lòng nhập email và mật khẩu');
        return { ok: false as const };
      }
      const credentials: AuthCredentials = { email, password };
      const { user, token } = await AuthService.login(credentials);
      loginToStore({ user, token });
      return { ok: true as const };
    } catch (e) {
      Alert.alert('Đăng nhập thất bại', 'Vui lòng thử lại');
      return { ok: false as const, error: e };
    } finally {
      setLoading(false);
    }
  }, [email, password, loginToStore]);

  return {
    state: { email, password, loading },
    actions: { setEmail: handleChangeEmail, setPassword: handleChangePassword, submit },
  };
}


