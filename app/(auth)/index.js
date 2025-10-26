import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';

export default function AuthLandingScreen() {
  const router = useRouter();
  // Force light mode
  const colorScheme = 'light';
  const theme = Colors[colorScheme];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.appName}>ElectroStore</Text>
          <Text style={styles.welcomeText}>
            Chào mừng bạn đến với ElectroStore
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonSection}>
          <Pressable
            onPress={() => router.push('/(auth)/register')}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: theme.primary },
              pressed && styles.buttonPressed
            ]}
          >
            <Text style={styles.primaryButtonText}>Đăng ký</Text>
          </Pressable>
          
          <Pressable
            onPress={() => router.push('/(auth)/login')}
            style={({ pressed }) => [
              styles.secondaryButton,
              { borderColor: theme.primary },
              pressed && styles.buttonPressed
            ]}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.primary }]}>
              Đăng nhập
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  // Logo Section
  logoSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  logoContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  logo: {
    width: 120,
    height: 120,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Button Section
  buttonSection: {
    paddingBottom: 40,
    gap: 16,
  },
  primaryButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});

