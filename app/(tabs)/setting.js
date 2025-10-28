// Màn hình Cài đặt: chứa mục điều hướng sang bản đồ cửa hàng
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
import { AuthService } from '../../services/authService';
import { useAuthStore } from '../../state/auth';

export default function SettingsScreen() {
  const user = useAuthStore((s) => s.user);
  const logoutFromStore = useAuthStore((s) => s.logout);
  const router = useRouter();
  // Force light mode
  const colorScheme = 'light';
  const theme = useMemo(() => Colors[colorScheme], [colorScheme]);

  const handleLogout = async () => {
    try {
      // Xóa token từ SecureStore
      await AuthService.logout();
      // Xóa state từ store
      logoutFromStore();
      console.log('Logout completed successfully');
      
      // Force navigation to auth screen
      router.replace('/(auth)');
    } catch (error) {
      console.error('Logout error:', error);
      // Vẫn xóa state ngay cả khi có lỗi
      logoutFromStore();
      // Force navigation to auth screen
      router.replace('/(auth)');
    }
  };

  const renderMenuItem = (icon, title, onPress, isDestructive = false) => (
    // Item danh sách có icon trái, text và mũi tên điều hướng
    <Pressable
      style={({ pressed }) => [
        styles.menuItem,
        { borderBottomColor: theme.muted },
        pressed && { opacity: 0.7 }
      ]}
      onPress={onPress}
    >
      <View style={styles.menuItemLeft}>
        <Ionicons 
          name={icon} 
          size={24} 
          color={isDestructive ? '#FF3B30' : theme.text} 
        />
        <Text style={[
          styles.menuText, 
          { color: isDestructive ? '#FF3B30' : theme.text }
        ]}>
          {title}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.tabIconDefault} />
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Cài đặt</Text>
        </View>

        {/* General Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Chung</Text>
          <View style={[styles.sectionContent, { backgroundColor: theme.background, borderColor: theme.muted }]}>
            {renderMenuItem('person-outline', 'Chỉnh sửa hồ sơ', () => {
              // Navigate to edit profile
              console.log('Navigate to edit profile');
            })}
            {renderMenuItem('lock-closed-outline', 'Đổi mật khẩu', () => {
              // Navigate to change password
              console.log('Navigate to change password');
            })}
            {renderMenuItem('notifications-outline', 'Thông báo', () => {
              // Navigate to notifications settings
              router.push('/(tabs)/notifications-settings');
            })}
            {renderMenuItem('map-outline', 'Bản đồ cửa hàng', () => {
              router.push('/StoreMapScreen');
            })}
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Tài khoản</Text>
          <View style={[styles.sectionContent, { backgroundColor: theme.background, borderColor: theme.muted }]}>
            {renderMenuItem('log-out-outline', 'Đăng xuất', handleLogout, true)}
          </View>
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
    padding: 16,
  },
  // Header styles
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  // Section styles
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionContent: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  // Notice bar styles
  noticeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
  },
  noticeText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  // Menu item styles
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
});

