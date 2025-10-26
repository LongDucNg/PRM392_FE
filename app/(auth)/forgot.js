import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Toast } from '../../components/Toast';
import Colors from '../../constants/Colors';
import { ForgotPasswordAPI } from '../../services/forgotPasswordAPI';

export default function ForgotScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [rawToken, setRawToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1: nhập email, 2: nhập token + mật khẩu mới
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordValidation, setPasswordValidation] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('error');
  // Force light mode
  const colorScheme = 'light';
  const theme = Colors[colorScheme];

  // Animation on mount
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  // Validate email in real-time
  useEffect(() => {
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Email không đúng định dạng');
    } else {
      setEmailError('');
    }
  }, [email]);

  // Validate password in real-time
  useEffect(() => {
    if (newPassword) {
      const validation = ForgotPasswordAPI.getPasswordValidationInfo(newPassword);
      setPasswordValidation(validation);
      setPasswordError(validation.isValid ? '' : validation.message);
    } else {
      setPasswordValidation(null);
      setPasswordError('');
    }
  }, [newPassword]);

  const requestReset = async () => {
    if (!email.trim()) {
      setEmailError('Vui lòng nhập email');
      setToastMessage('Vui lòng nhập email');
      setToastType('error');
      setShowToast(true);
      return;
    }
    
    if (emailError) {
      return;
    }
    
    setLoading(true);
    try {
      await ForgotPasswordAPI.requestReset(email.trim());
      setToastMessage('Email reset mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư.');
      setToastType('success');
      setShowToast(true);
      setTimeout(() => {
        setStep(2);
      }, 1500);
    } catch (error) {
      const errorMessage = error.message || 'Gửi email thất bại. Vui lòng thử lại.';
      setToastMessage(errorMessage);
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!rawToken.trim() || !newPassword || !confirmPassword) {
      setToastMessage('Vui lòng nhập đầy đủ thông tin.');
      setToastType('error');
      setShowToast(true);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setToastMessage('Mật khẩu xác nhận không khớp.');
      setToastType('error');
      setShowToast(true);
      return;
    }
    
    if (passwordError) {
      return;
    }
    
    setLoading(true);
    try {
      await ForgotPasswordAPI.setNewPassword(rawToken.trim(), newPassword, confirmPassword);
      setToastMessage('Mật khẩu đã được đặt lại thành công! Hãy đăng nhập.');
      setToastType('success');
      setShowToast(true);
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 1500);
    } catch (error) {
      const errorMessage = error.message || 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.';
      setToastMessage(errorMessage);
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleToastHide = () => {
    setShowToast(false);
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Toast
        visible={showToast}
        message={toastMessage}
        type={toastType}
        onHide={handleToastHide}
      />
      {step === 1 ? (
        <View style={styles.formContainer}>
          <Text style={styles.title}>Quên mật khẩu</Text>
          <Text style={styles.subtitle}>
            Nhập email của bạn để nhận OTP reset mật khẩu
          </Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Email"
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
          
          <Pressable
            onPress={requestReset}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: theme.primary },
              (loading || emailError) && styles.buttonDisabled,
              pressed && !loading && !emailError && styles.buttonPressed
            ]}
            disabled={loading || !!emailError}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Gửi OTP</Text>
            )}
          </Pressable>
        </View>
      ) : (
        <View style={styles.formContainer}>
          <Text style={styles.title}>Đặt lại mật khẩu</Text>
          <Text style={styles.subtitle}>
            Nhập OTP từ email và mật khẩu mới
          </Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Mã OTP"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              value={rawToken}
              onChangeText={setRawToken}
              style={styles.input}
              editable={!loading}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Mật khẩu mới"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              style={[
                styles.input,
                passwordError && styles.inputError
              ]}
              editable={!loading}
            />
            {passwordError ? (
              <Text style={styles.errorText}>{passwordError}</Text>
            ) : null}
            
            {passwordValidation && (
              <View style={styles.passwordRequirements}>
                <Text style={styles.requirementsTitle}>Yêu cầu mật khẩu:</Text>
                <View style={styles.requirementItem}>
                  <Text style={[
                    styles.requirementText,
                    passwordValidation.requirements.length && styles.requirementMet
                  ]}>
                    ✓ Ít nhất 8 ký tự
                  </Text>
                </View>
                <View style={styles.requirementItem}>
                  <Text style={[
                    styles.requirementText,
                    passwordValidation.requirements.lowercase && styles.requirementMet
                  ]}>
                    ✓ Có chữ thường
                  </Text>
                </View>
                <View style={styles.requirementItem}>
                  <Text style={[
                    styles.requirementText,
                    passwordValidation.requirements.uppercase && styles.requirementMet
                  ]}>
                    ✓ Có chữ hoa
                  </Text>
                </View>
                <View style={styles.requirementItem}>
                  <Text style={[
                    styles.requirementText,
                    passwordValidation.requirements.number && styles.requirementMet
                  ]}>
                    ✓ Có số
                  </Text>
                </View>
              </View>
            )}
          </View>
          
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Xác nhận mật khẩu mới"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={[
                styles.input,
                confirmPassword && newPassword !== confirmPassword && styles.inputError
              ]}
              editable={!loading}
            />
            {confirmPassword && newPassword !== confirmPassword && (
              <Text style={styles.errorText}>Mật khẩu xác nhận không khớp</Text>
            )}
          </View>
          
          <Pressable
            onPress={resetPassword}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: theme.primary },
              (loading || passwordError) && styles.buttonDisabled,
              pressed && !loading && !passwordError && styles.buttonPressed
            ]}
            disabled={loading || !!passwordError}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Đặt lại mật khẩu</Text>
            )}
          </Pressable>
        </View>
      )}

      <View style={styles.backButtonContainer}>
        <Pressable onPress={() => router.replace('/(auth)/login')}>
          <Text style={[styles.backButtonText, { color: theme.link }]}>
            Quay lại đăng nhập
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
  passwordRequirements: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  requirementItem: {
    marginBottom: 4,
  },
  requirementText: {
    fontSize: 13,
    color: '#6c757d',
  },
  requirementMet: {
    color: '#28a745',
    fontWeight: '500',
  },
  backButtonContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});


