/**
 * Notification Service
 * Quản lý tất cả thông báo push notification trong ứng dụng
 * Sử dụng Expo Notifications API để gửi local notifications
 */

import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useNotificationStore } from '../state/notifications';

/**
 * Cấu hình cho Notifications handler
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Notification Service Class
 */
export class NotificationService {
  /**
   * Yêu cầu quyền gửi thông báo từ người dùng
   * @returns Promise<boolean> - Trả về true nếu có quyền, false nếu không
   */
  static async registerForPushNotificationsAsync(): Promise<boolean> {
    try {
      // Chỉ chạy trên thiết bị thật
      if (!Device.isDevice) {
        console.warn('⚠️ Notifications chỉ hoạt động trên thiết bị thật, không hoạt động trên emulator');
        return false;
      }

      // Lấy trạng thái quyền hiện tại
      const { status: existingStatus } = await Notifications.getPermissionsAsync();

      let finalStatus = existingStatus;

      // Nếu chưa có quyền, yêu cầu quyền
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      // Nếu người dùng từ chối, return false
      if (finalStatus !== 'granted') {
        console.warn('⚠️ Người dùng từ chối quyền gửi thông báo');
        return false;
      }

      console.log('✅ Đã cấp quyền gửi thông báo');
      return true;
    } catch (error) {
      console.error('❌ Lỗi yêu cầu quyền thông báo:', error);
      return false;
    }
  }

  /**
   * Gửi thông báo đăng nhập thành công
   */
  static async sendLoginSuccessNotification(): Promise<void> {
    try {
      // Kiểm tra trạng thái bật/tắt thông báo
      const isEnabled = useNotificationStore.getState().enabled;
      if (!isEnabled) {
        console.log('ℹ️ Thông báo đã tắt, không gửi thông báo đăng nhập');
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Chào mừng bạn quay lại!',
          body: 'Bạn đã đăng nhập thành công.',
          sound: true,
          data: { type: 'login_success' },
        },
        trigger: null, // Gửi ngay lập tức
      });
      console.log('✅ Đã gửi thông báo đăng nhập thành công');
    } catch (error) {
      console.error('❌ Lỗi gửi thông báo đăng nhập:', error);
    }
  }

  /**
   * Gửi thông báo đặt hàng thành công
   * @param orderId - ID của đơn hàng
   */
  static async sendOrderCreatedNotification(orderId: string): Promise<void> {
    try {
      // Kiểm tra trạng thái bật/tắt thông báo
      const isEnabled = useNotificationStore.getState().enabled;
      if (!isEnabled) {
        console.log('ℹ️ Thông báo đã tắt, không gửi thông báo đặt hàng');
        return;
      }

      // Lấy 8 ký tự cuối của orderId để hiển thị ngắn gọn
      const orderNumber = orderId.slice(-8).toUpperCase();

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Đặt hàng thành công! 🎉',
          body: `Đơn hàng #${orderNumber} đã được tạo.`,
          sound: true,
          data: { type: 'order_created', orderId },
        },
        trigger: null, // Gửi ngay lập tức
      });
      console.log('✅ Đã gửi thông báo đặt hàng thành công:', orderNumber);
    } catch (error) {
      console.error('❌ Lỗi gửi thông báo đặt hàng:', error);
    }
  }

  /**
   * Gửi thông báo thanh toán thành công
   * @param orderId - ID của đơn hàng
   * @param amount - Số tiền thanh toán
   */
  static async sendPaymentSuccessNotification(orderId: string, amount?: number): Promise<void> {
    try {
      // Kiểm tra trạng thái bật/tắt thông báo
      const isEnabled = useNotificationStore.getState().enabled;
      if (!isEnabled) {
        console.log('ℹ️ Thông báo đã tắt, không gửi thông báo thanh toán');
        return;
      }

      // Lấy 8 ký tự cuối của orderId
      const orderNumber = orderId.slice(-8).toUpperCase();

      // Tạo nội dung thông báo
      const body = amount
        ? `Thanh toán hoàn tất cho đơn hàng #${orderNumber}.\nSố tiền: ${amount.toLocaleString('vi-VN')} VNĐ`
        : `Thanh toán hoàn tất, cảm ơn bạn đã mua hàng!`;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Thanh toán thành công! 💰',
          body,
          sound: true,
          data: { type: 'payment_success', orderId },
        },
        trigger: null, // Gửi ngay lập tức
      });
      console.log('✅ Đã gửi thông báo thanh toán thành công:', orderNumber);
    } catch (error) {
      console.error('❌ Lỗi gửi thông báo thanh toán:', error);
    }
  }

  /**
   * Gửi thông báo tùy chỉnh
   * @param title - Tiêu đề thông báo
   * @param body - Nội dung thông báo
   * @param data - Dữ liệu kèm theo
   */
  static async sendCustomNotification(
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<void> {
    try {
      // Kiểm tra trạng thái bật/tắt thông báo
      const isEnabled = useNotificationStore.getState().enabled;
      if (!isEnabled) {
        console.log('ℹ️ Thông báo đã tắt, không gửi thông báo tùy chỉnh');
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          data: data || {},
        },
        trigger: null, // Gửi ngay lập tức
      });
      console.log('✅ Đã gửi thông báo tùy chỉnh:', title);
    } catch (error) {
      console.error('❌ Lỗi gửi thông báo tùy chỉnh:', error);
    }
  }

  /**
   * Hủy tất cả thông báo đã lên lịch
   */
  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('✅ Đã hủy tất cả thông báo');
    } catch (error) {
      console.error('❌ Lỗi hủy thông báo:', error);
    }
  }
}

