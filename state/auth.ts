// Auth Store: quản lý thông tin người dùng và token, persist bằng AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type User = {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'staff' | 'customer';
};

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (payload: { user: User; token: string }) => void;
  logout: () => void;
};

// Persist store để giữ đăng nhập sau khi mở lại app
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      // Khi login thành công: lưu user/token và bật cờ authenticated
      login: ({ user, token }) =>
        set({ user, token, isAuthenticated: true }),
      // Logout: xoá user/token và tắt cờ authenticated
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => AsyncStorage),
      // Chỉ persist các field cần thiết
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);


