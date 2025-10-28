// Root layout cấu hình theme, fonts và Stack navigation
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useMemo } from 'react';
import 'react-native-reanimated';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useColorScheme } from '../components/useColorScheme';
import { NotificationService } from '../services/notificationService';
import { useAuthStore } from '../state/auth';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RootLayoutNav />
    </QueryClientProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Request notification permissions when app starts
  useEffect(() => {
    const requestNotificationPermissions = async () => {
      try {
        console.log('🔔 Yêu cầu quyền gửi thông báo...');
        const hasPermission = await NotificationService.registerForPushNotificationsAsync();
        if (hasPermission) {
          console.log('✅ Đã cấp quyền gửi thông báo');
        } else {
          console.log('⚠️ Người dùng chưa cấp quyền gửi thông báo');
        }
      } catch (error) {
        console.error('❌ Lỗi khi yêu cầu quyền thông báo:', error);
      }
    };

    requestNotificationPermissions();
  }, []);

  const theme = useMemo(() => 
    colorScheme === 'dark' ? DarkTheme : DefaultTheme, 
    [colorScheme]
  );

  return (
    <ThemeProvider value={theme}>
      {isAuthenticated ? (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          {/* Standalone screens pushed from tabs */}
          <Stack.Screen 
            name="StoreMapScreen" 
            options={{ 
              headerShown: true, 
              title: 'Bản đồ cửa hàng',
              headerBackTitle: 'Cài đặt',
              headerBackTitleVisible: true,
            }} 
          />
        </Stack>
      ) : (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack>
      )}
    </ThemeProvider>
  );
}


