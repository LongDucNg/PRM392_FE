import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { NotificationService } from '../../services/notificationService';
import { useNotificationStore } from '../../state/notifications';

/**
 * Màn hình Cài đặt thông báo: bật/tắt thông báo và xin quyền hệ thống
 */
export default function NotificationsSettingsScreen() {
  const router = useRouter();
  const colorScheme = 'light';
  const theme = Colors[colorScheme];

  // Lấy trạng thái bật/tắt thông báo từ store
  const { enabled, setEnabled } = useNotificationStore();

  // Kiểm tra quyền thông báo khi vào màn hình
  useEffect(() => {
    checkNotificationPermission();
  }, []);

  const checkNotificationPermission = async () => {
    try {
      const hasPermission = await NotificationService.registerForPushNotificationsAsync();
      // Nếu không có quyền thì tắt công tắc trong store
      if (!hasPermission && enabled) {
        setEnabled(false);
      }
    } catch (error) {
      console.error('Lỗi kiểm tra quyền thông báo:', error);
      setEnabled(false);
    }
  };

  const handleToggleNotifications = async (value) => {
    setEnabled(value);
    
    if (value) {
      // Khi bật: yêu cầu quyền thông báo từ hệ thống
      try {
        const hasPermission = await NotificationService.registerForPushNotificationsAsync();
        if (!hasPermission) {
          // Nếu người dùng từ chối, đặt lại về false
          setEnabled(false);
        }
      } catch (error) {
        console.error('Lỗi yêu cầu quyền thông báo:', error);
        setEnabled(false);
      }
    } else {
      // Khi tắt: chỉ cập nhật flag, app sẽ không gửi thông báo
      console.log('Đã tắt thông báo');
    }
  };

  const handleBack = () => {
    // Điều hướng về màn hình Cài đặt (không back về Tabs)
    router.replace('/(tabs)/setting');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={handleBack}
          >
            <Ionicons name="chevron-back" size={24} color={theme.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Thông báo</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Main Toggle */}
          <View style={styles.toggleContainer}>
            <View style={styles.toggleInfo}>
              <Ionicons name="notifications" size={24} color={theme.primary} />
              <View style={styles.toggleTextContainer}>
                <Text style={[styles.toggleTitle, { color: theme.text }]}>
                  Bật thông báo
                </Text>
                <Text style={[styles.toggleDescription, { color: theme.tabIconDefault }]}>
                  Nhận thông báo về các hoạt động trong ứng dụng
                </Text>
              </View>
            </View>
            <Switch
              value={enabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: '#D1D5DB', true: theme.primary }}
              thumbColor={enabled ? '#FFFFFF' : '#F3F4F6'}
              ios_backgroundColor="#D1D5DB"
            />
          </View>

          {/* Info Text when disabled */}
          {!enabled && (
            <View style={styles.infoCard}>
              <Ionicons name="alert-circle" size={24} color="#F59E0B" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>
                  Thông báo đã tắt
                </Text>
                <Text style={styles.infoDescription}>
                  Bật thông báo để không bỏ lỡ các thông tin quan trọng
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  // Content styles
  content: {
    flex: 1,
    padding: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  toggleTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B30',
    marginTop: 16,
  },
  infoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#F59E0B',
  },
  infoDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: '#6B7280',
  },
});

