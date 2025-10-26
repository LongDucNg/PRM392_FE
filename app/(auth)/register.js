import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Toast } from '../../components/Toast';
import Colors from '../../constants/Colors';
import { AuthService } from '../../services/authService';
import { RegisterAPI } from '../../services/registerAPI';

export default function RegisterChooserScreen() {
  const router = useRouter();
  // Force light mode
  const colorScheme = 'light';
  const theme = Colors[colorScheme];
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordValidation, setPasswordValidation] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('error');

  // Animation on mount
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  // Validate phone in real-time
  useEffect(() => {
    if (phone) {
      const validation = RegisterAPI.validatePhone(phone);
      setPhoneError(validation.isValid ? '' : validation.message);
    } else {
      setPhoneError('');
    }
  }, [phone]);

  // Validate email in real-time
  useEffect(() => {
    if (email) {
      const validation = RegisterAPI.validateEmail(email);
      setEmailError(validation.isValid ? '' : validation.message);
    } else {
      setEmailError('');
    }
  }, [email]);

  // Validate password in real-time
  useEffect(() => {
    if (password) {
      const validation = RegisterAPI.getPasswordValidationInfo(password);
      setPasswordValidation(validation);
      setPasswordError(validation.isValid ? '' : validation.message);
    } else {
      setPasswordValidation(null);
      setPasswordError('');
    }
  }, [password]);

  const submit = async () => {
    // Check if at least one contact method is provided
    if (!phone.trim() && !email.trim()) {
      setToastMessage('Vui lòng nhập ít nhất email hoặc số điện thoại');
      setToastType('error');
      setShowToast(true);
      return;
    }

    if (!password) {
      setToastMessage('Vui lòng nhập mật khẩu');
      setToastType('error');
      setShowToast(true);
      return;
    }

    // Check for validation errors
    if (phoneError || emailError || passwordError) {
      setToastMessage('Vui lòng sửa các lỗi validation trước khi tiếp tục');
      setToastType('error');
      setShowToast(true);
      return;
    }
    
    console.log('Starting registration process...');
    setLoading(true);
    
    try {
      const registerData = {
        password,
        name: name.trim() || undefined,
        ...(phone.trim() && { phone: phone.trim() }),
        ...(email.trim() && { email: email.trim() })
      };
      
      console.log('Register data prepared:', {
        hasPhone: !!registerData.phone,
        hasEmail: !!registerData.email,
        hasName: !!registerData.name,
        hasPassword: !!registerData.password
      });
      
      console.log('Calling AuthService.register...');
      const result = await AuthService.register(registerData);
      console.log('AuthService.register completed:', result);
      
      setToastMessage('Tạo tài khoản thành công! Hãy đăng nhập.');
      setToastType('success');
      setShowToast(true);
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 1500);
    } catch (e) {
      console.error('Registration error details:', e);
      console.error('Error message:', e.message);
      console.error('Error stack:', e.stack);
      
      const errorMessage = e.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      
      // Show different toast based on error type
      if (errorMessage.includes('API đăng ký không khả dụng')) {
        setToastMessage('API đăng ký hiện không khả dụng. Vui lòng thử lại sau.');
        setToastType('error');
        setShowToast(true);
      } else if (errorMessage.includes('Email hoặc số điện thoại đã được sử dụng')) {
        setToastMessage('Email hoặc số điện thoại đã được sử dụng');
        setToastType('error');
        setShowToast(true);
      } else if (errorMessage.includes('Không có kết nối mạng')) {
        setToastMessage('Không có kết nối mạng. Vui lòng kiểm tra internet');
        setToastType('error');
        setShowToast(true);
      } else {
        setToastMessage(errorMessage);
        setToastType('error');
        setShowToast(true);
      }
    } finally {
      console.log('Setting loading to false');
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
      <View style={styles.formContainer}>
        <Text style={styles.title}>Đăng ký tài khoản</Text>
        <Text style={styles.subtitle}>
          Tạo tài khoản mới để sử dụng dịch vụ
        </Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Số điện thoại"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            style={[
              styles.input,
              phoneError && styles.inputError
            ]}
            editable={!loading}
          />
          {phoneError ? (
            <Text style={styles.errorText}>{phoneError}</Text>
          ) : null}
        </View>

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
            placeholder="Họ tên (không bắt buộc)"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="words"
            value={name}
            onChangeText={setName}
            style={styles.input}
            editable={!loading}
          />
        </View>

        <Pressable
          onPress={submit}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: theme.primary },
            (loading || phoneError || emailError || passwordError) && styles.buttonDisabled,
            pressed && !loading && !phoneError && !emailError && !passwordError && styles.buttonPressed
          ]}
          disabled={loading || !!phoneError || !!emailError || !!passwordError}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Tạo tài khoản</Text>
          )}
        </Pressable>
      </View>

      <View style={styles.backButtonContainer}>
        <Pressable onPress={() => router.back()}>
          <Text style={[styles.backButtonText, { color: theme.link }]}>
            Quay lại
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
    backgroundColor: '#FFFFFF',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    color: '#1F2937',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 28,
    textAlign: 'center',
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 18,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#1F2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
    shadowColor: '#EF4444',
    shadowOpacity: 0.1,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 6,
    marginLeft: 4,
    fontWeight: '500',
  },
  button: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  passwordRequirements: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  requirementItem: {
    marginBottom: 4,
  },
  requirementText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  requirementMet: {
    color: '#10B981',
    fontWeight: '600',
  },
  backButtonContainer: {
    marginTop: 28,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
  },
});


