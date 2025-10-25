import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '../../components/useColorScheme';
import Colors from '../../constants/Colors';
import { AuthService } from '../../services/authService';
import { useAuthStore } from '../../state/auth';

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logoutFromStore = useAuthStore((s) => s.logout);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = useMemo(() => Colors[colorScheme ?? 'light'], [colorScheme]);
  const [profileName, setProfileName] = useState(undefined);
  const [profileEmail, setProfileEmail] = useState(undefined);

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

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      try {
        const name = await SecureStore.getItemAsync('profile-name');
        const email = await SecureStore.getItemAsync('profile-email');
        if (isMounted) {
          setProfileName(name || undefined);
          setProfileEmail(email || undefined);
        }
      } catch (error) {
        console.log('Error loading profile:', error);
      }
    };
    loadProfile();
    return () => { isMounted = false; };
  }, []);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>

      <View style={[styles.profileCard, { backgroundColor: theme.background, borderColor: theme.muted }]}>
        <View style={styles.avatar}>
          <Text style={[styles.avatarText, { color: theme.text }]}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>
        
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: theme.text }]}>
            {profileName || user?.name || 'Người dùng'}
          </Text>
          <Text style={[styles.userEmail, { color: theme.tabIconDefault }]}>
            {profileEmail || user?.email || 'user@example.com'}
          </Text>
          <Text style={[styles.userRole, { color: theme.primary }]}>
            {user?.role === 'admin' ? 'Quản trị viên' : 
             user?.role === 'staff' ? 'Nhân viên' : 'Khách hàng'}
          </Text>
        </View>
      </View>

      <View style={styles.menuSection}>
        <Pressable
          style={({ pressed }) => [
            styles.menuItem,
            { borderBottomColor: theme.muted },
            pressed && { opacity: 0.7 }
          ]}
        >
          <Text style={[styles.menuText, { color: theme.text }]}>Đơn hàng của tôi</Text>
        </Pressable>
      </View>

      <View style={styles.logoutSection}>
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutButton,
            { backgroundColor: theme.primary },
            pressed && { opacity: 0.8 }
          ]}
        >
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </Pressable>
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
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 12,
    fontWeight: '500',
  },
  menuSection: {
    marginBottom: 32,
  },
  menuItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  menuText: {
    fontSize: 16,
  },
  logoutSection: {
    marginTop: 'auto',
  },
  logoutButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
