import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react-native';
import { useToastStore, ToastType } from '../../store/useToastStore';
import { SHADOWS } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

const { width } = Dimensions.get('window');

const getToastConfig = (type: ToastType, isDark: boolean) => {
  if (isDark) {
    switch (type) {
      case 'success':
        return {
          bg: '#052e16',
          border: '#14532d',
          text: '#4ade80',
          Icon: CheckCircle2,
        };
      case 'error':
        return {
          bg: '#450a0a',
          border: '#7f1d1d',
          text: '#f87171',
          Icon: AlertCircle,
        };
      case 'warning':
        return {
          bg: '#451a03',
          border: '#78350f',
          text: '#fbbf24',
          Icon: AlertTriangle,
        };
      case 'info':
      default:
        return {
          bg: '#172554',
          border: '#1e3a8a',
          text: '#60a5fa',
          Icon: Info,
        };
    }
  } else {
    switch (type) {
      case 'success':
        return {
          bg: '#F0FDF4',
          border: '#DCFCE7',
          text: '#16A34A',
          Icon: CheckCircle2,
        };
      case 'error':
        return {
          bg: '#FEF2F2',
          border: '#FEE2E2',
          text: '#EF4444',
          Icon: AlertCircle,
        };
      case 'warning':
        return {
          bg: '#FFFBEB',
          border: '#FEF3C7',
          text: '#D97706',
          Icon: AlertTriangle,
        };
      case 'info':
      default:
        return {
          bg: '#EFF6FF',
          border: '#DBEAFE',
          text: '#2563EB',
          Icon: Info,
        };
    }
  }
};

export const Toast = () => {
  const { visible, message, type, hide } = useToastStore();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const slideAnim = useRef(new Animated.Value(-150)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const styles = getStyles(isDark);

  useEffect(() => {
    if (visible) {
      // Slide in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: insets.top > 0 ? insets.top + 10 : 20,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after 3.5 seconds
      const timer = setTimeout(() => {
        dismiss();
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [visible, insets.top]);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -150,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      hide();
    });
  };

  if (!visible) return null;

  const config = getToastConfig(type, isDark);
  const IconComponent = config.Icon;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View
        style={[
          styles.toastCard,
          {
            backgroundColor: config.bg,
            borderColor: config.border,
          },
        ]}
      >
        <IconComponent size={20} color={config.text} style={styles.icon} />
        <Text style={[styles.message, { color: config.text }]}>{message}</Text>
      </View>
    </Animated.View>
  );
};

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    zIndex: 99999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    ...(isDark ? {} : SHADOWS.sm),
    maxWidth: width - 40,
  },
  icon: {
    marginRight: 12,
    flexShrink: 0,
  },
  message: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
    flex: 1,
    lineHeight: 18,
  },
});

export default Toast;
