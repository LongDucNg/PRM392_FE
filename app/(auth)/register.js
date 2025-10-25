import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useColorScheme } from '../../components/useColorScheme';
import Colors from '../../constants/Colors';
import { AuthService } from '../../services/authService';
import { RegisterAPI } from '../../services/registerAPI';

export default function RegisterChooserScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
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
      Alert.alert('Lỗi', 'Vui lòng nhập ít nhất email hoặc số điện thoại');
      return;
    }

    if (!password) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu');
      return;
    }

    // Check for validation errors
    if (phoneError || emailError || passwordError) {
      Alert.alert('Lỗi', 'Vui lòng sửa các lỗi validation trước khi tiếp tục');
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
      
      Alert.alert('Thành công', 'Tạo tài khoản thành công, hãy đăng nhập.');
      router.replace('/(auth)/login');
    } catch (e) {
      console.error('Registration error details:', e);
      console.error('Error message:', e.message);
      console.error('Error stack:', e.stack);
      
      const errorMessage = e.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      
      // Show different alert based on error type
      if (errorMessage.includes('API đăng ký không khả dụng')) {
        Alert.alert(
          'Lỗi hệ thống', 
          'API đăng ký hiện không khả dụng. Vui lòng thử lại sau hoặc liên hệ admin để được hỗ trợ.',
          [
            { text: 'Thử lại', onPress: () => submit() },
            { text: 'Hủy', style: 'cancel' }
          ]
        );
      } else {
        Alert.alert('Đăng ký thất bại', errorMessage);
      }
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Đăng ký tài khoản</Text>
        <Text style={styles.subtitle}>
          Tạo tài khoản mới để sử dụng dịch vụ
        </Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Số điện thoại"
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


