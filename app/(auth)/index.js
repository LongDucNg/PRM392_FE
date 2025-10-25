import { useRouter } from 'expo-router';
import { Image, Pressable, Text, View } from 'react-native';
import { useColorScheme } from '../../components/useColorScheme';
import Colors from '../../constants/Colors';

export default function AuthLandingScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center', gap: 24 }}>
      <Image
        source={require('../../assets/images/icon.png')}
        style={{ width: 180, height: 180, marginBottom: 8 }}
        resizeMode="contain"
      />
      <Text style={{ fontSize: 24, fontWeight: '700', textAlign: 'center' }}>ElectroStore</Text>
      <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>Chào mừng bạn đến với ElectroStore</Text>

      <View style={{ width: '100%', gap: 12, marginTop: 12 }}>
        <Pressable
          onPress={() => router.push('/(auth)/register')}
          style={({ pressed }) => ({
            backgroundColor: theme.primary,
            paddingVertical: 14,
            borderRadius: 10,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '700' }}>Đăng ký</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/(auth)/login')}
          style={({ pressed }) => ({
            backgroundColor: theme.muted,
            paddingVertical: 14,
            borderRadius: 10,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text style={{ color: '#111827', textAlign: 'center', fontWeight: '700' }}>Đăng nhập</Text>
        </Pressable>
      </View>
    </View>
  );
}


