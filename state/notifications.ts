import { create } from 'zustand';

interface NotificationState {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

/**
 * Notification Store - Quản lý trạng thái bật/tắt thông báo
 */
export const useNotificationStore = create<NotificationState>((set) => ({
  enabled: true, // Mặc định bật
  setEnabled: (enabled: boolean) => set({ enabled }),
}));

