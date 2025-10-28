import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Toast } from '../../components/Toast';
import { useColorScheme } from '../../components/useColorScheme';
import Colors from '../../constants/Colors';
import { NotificationService } from '../../services/notificationService';
import { useLoginViewModel } from '../../viewmodels/useLoginViewModel';

export default function LoginScreen() {
  const router = useRouter();
  const { state, actions } = useLoginViewModel();
  const { email, password, loading, error } = state;
  const { setEmail, setPassword, submit, clearError } = actions;
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('error');

  // Animation khi mount (fade-in form)
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  // Kiểm tra định dạng Email/SĐT theo thời gian thực
  useEffect(() => {
    if (email) {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const isPhone = /^(0|\+84)[3-9][0-9]{8}$/.test(email.replace(/\s/g, ''));
      
      if (!isEmail && !isPhone) {
        setEmailError('Email hoặc số điện thoại không đúng định dạng');
      } else {
        setEmailError('');
      }
    } else {
      setEmailError('');
    }
  }, [email]);

  // Hiển thị toast khi có lỗi từ ViewModel
  useEffect(() => {
    if (error) {
      setToastMessage(error);
      setToastType('error');
      setShowToast(true);
    }
  }, [error]);

  // Kiểm tra mật khẩu theo thời gian thực (>= 6 ký tự)
  useEffect(() => {
    if (password && password.length < 6) {
      setPasswordError('Mật khẩu phải có ít nhất 6 ký tự');
    } else {
      setPasswordError('');
    }
  }, [password]);

  const onLogin = async () => {
    const result = await submit();
    if (result?.ok) {
      setToastMessage('Đăng nhập thành công!');
      setToastType('success');
      setShowToast(true);
      
      // Gửi thông báo push notification sau đăng nhập thành công
      try {
        await NotificationService.sendLoginSuccessNotification();
      } catch (error) {
        console.error('Lỗi gửi thông báo đăng nhập:', error);
      }
      
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 1000);
    }
  };

  const handleToastHide = () => {
    setShowToast(false);
    clearError();
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Toast
        visible={showToast}
        message={toastMessage}
        type={toastType}
        onHide={handleToastHide}
      />
      <View style={styles.formContainer}>
        <Text style={styles.title}>Đăng nhập</Text>
        <Text style={styles.subtitle}>
          Chào mừng bạn quay trở lại
        </Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Email hoặc Số điện thoại"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            style={[
              styles.input,
              emailError && styles.inputError
            ]}
            editable={!loading}
          />
          {emailError ? (
            <Text style={styles.errorText}>{emailError}</Text>
          ) : null}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Mật khẩu"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={[
              styles.input,
              passwordError && styles.inputError
            ]}
            editable={!loading}
          />
          {passwordError ? (
            <Text style={styles.errorText}>{passwordError}</Text>
          ) : null}
        </View>

        <Pressable
          onPress={onLogin}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: theme.primary },
            (loading || emailError || passwordError) && styles.buttonDisabled,
            pressed && !loading && !emailError && !passwordError && styles.buttonPressed
          ]}
          disabled={loading || !!emailError || !!passwordError}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Đăng nhập</Text>
          )}
        </Pressable>
      </View>

      <View style={styles.linkContainer}>
        <Pressable onPress={() => router.push('/(auth)/forgot')}>
          <Text style={[styles.linkText, { color: theme.link }]}>
            Quên mật khẩu?
          </Text>
        </Pressable>
        <Pressable onPress={() => router.replace('/(auth)/register')}>
          <Text style={[styles.linkText, { color: theme.link }]}>
            Tạo tài khoản
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    color: '#1a1a1a',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fafbfc',
    color: '#1a1a1a',
  },
  inputError: {
    borderColor: '#e74c3c',
    backgroundColor: '#fdf2f2',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  linkContainer: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linkText: {
    fontSize: 16,
    fontWeight: '500',
  },
});


