// Component Toast hiển thị thông báo tạm thời với animation fade + slide
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Colors from '../constants/Colors';
import { useColorScheme } from './useColorScheme';

interface ToastProps {
  visible: boolean; // Có hiển thị hay không
  message: string; // Nội dung thông báo
  type: 'success' | 'error' | 'warning' | 'info'; // Loại thông báo
  duration?: number; // Thời gian auto-hide (ms)
  onHide?: () => void; // Callback khi ẩn xong
}

export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type,
  duration = 3000,
  onHide
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current; // Opacity
  const slideAnim = useRef(new Animated.Value(-100)).current; // Vị trí trượt xuống
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    if (visible) {
      // Hiển thị: chạy song song fade-in và slide-down
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();

      // Tự động ẩn sau duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  // Ẩn Toast với animation ngược lại, sau đó gọi onHide
  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      onHide?.();
    });
  };

  // Trả về màu nền/viền/icon/text theo loại thông báo
  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#d4edda',
          borderColor: '#c3e6cb',
          iconColor: '#155724',
          textColor: '#155724'
        };
      case 'error':
        return {
          backgroundColor: '#f8d7da',
          borderColor: '#f5c6cb',
          iconColor: '#721c24',
          textColor: '#721c24'
        };
      case 'warning':
        return {
          backgroundColor: '#fff3cd',
          borderColor: '#ffeaa7',
          iconColor: '#856404',
          textColor: '#856404'
        };
      case 'info':
        return {
          backgroundColor: '#d1ecf1',
          borderColor: '#bee5eb',
          iconColor: '#0c5460',
          textColor: '#0c5460'
        };
      default:
        return {
          backgroundColor: '#f8f9fa',
          borderColor: '#dee2e6',
          iconColor: '#495057',
          textColor: '#495057'
        };
    }
  };

  // Icon kí tự đơn giản theo loại thông báo
  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '•';
    }
  };

  const toastStyle = getToastStyle();

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <View
        style={[
          styles.toast,
          {
            backgroundColor: toastStyle.backgroundColor,
            borderColor: toastStyle.borderColor,
          }
        ]}
      >
        <Text style={[styles.icon, { color: toastStyle.iconColor }]}>
          {getIcon()}
        </Text>
        <Text style={[styles.message, { color: toastStyle.textColor }]}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  icon: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
});
