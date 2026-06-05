import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../../hooks/useTheme';
import { ROUTES } from '../../../constants/screens';
import { AUTH_PROVIDERS, USER_ROLES } from '../../../constants';
import { AuthStackParamList } from '../../../types';
import { useAuthStore } from '../../../store/useAuthStore';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID, GOOGLE_IOS_CLIENT_ID } from '@env';
import { loginSchema, LoginFormData } from '../../../utils/schemas';
import { useToastStore } from '../../../store/useToastStore';
import { GoogleLogo, LinkedInLogo } from '../../../components/common/SocialIcons';
import { RoleSelectionModal } from '../../../components/common/RoleSelectionModal';
import { getStyles } from './LoginScreen.styles';

console.log('Configuring Google Sign-In:', { GOOGLE_WEB_CLIENT_ID, GOOGLE_IOS_CLIENT_ID });

if (!GOOGLE_WEB_CLIENT_ID) {
  console.warn(
    'WARNING: GOOGLE_WEB_CLIENT_ID is undefined at runtime! ' +
      'Google Sign-In will fail with Developer Error. ' +
      'Please verify your .env file and restart Metro with: yarn start --reset-cache'
  );
}

GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
  iosClientId: GOOGLE_IOS_CLIENT_ID,
});

export const LoginScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const [securePassword, setSecurePassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [pendingIdToken, setPendingIdToken] = useState<string | null>(null);

  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setApiError(null);
    setLoading(true);
    try {
      await useAuthStore.getState().login({ email: data.email, password: data.password });
      useToastStore.getState().show('Welcome back! Logged in successfully.', 'success');
    } catch (err: any) {
      console.warn('Authentication request failed:', err);
      const msg = err.response?.data?.message || err.message || 'Connection to server failed. Please try again.';
      setApiError(msg);
      useToastStore.getState().show(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelection = async (role: typeof USER_ROLES.CANDIDATE | typeof USER_ROLES.RECRUITER) => {
    if (!pendingIdToken) return;
    setRoleModalVisible(false);
    setLoading(true);
    try {
      await useAuthStore.getState().googleLogin({ idToken: pendingIdToken, role });
      useToastStore.getState().show('Account created and logged in with Google!', 'success');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      setApiError(msg);
      useToastStore.getState().show(msg, 'error');
    } finally {
      setLoading(false);
      setPendingIdToken(null);
    }
  };

  const handleSocialSignIn = async (provider: string) => {
    if (provider === AUTH_PROVIDERS.GOOGLE) {
      try {
        await GoogleSignin.hasPlayServices();
        await GoogleSignin.signOut();

        const response = await GoogleSignin.signIn();

        if (response.type === 'success' && response.data?.idToken) {
          const idToken = response.data.idToken;
          try {
            await useAuthStore.getState().googleLogin({ idToken });
            useToastStore.getState().show('Logged in successfully with Google!', 'success');
          } catch (error: any) {
            const isRoleRequired = error.response?.data?.message?.includes('selecting a role') ||
              error.message?.includes('selecting a role');
            if (isRoleRequired) {
              setPendingIdToken(idToken);
              setRoleModalVisible(true);
            } else {
              const msg = error.response?.data?.message || error.message || 'Google sign-in failed';
              useToastStore.getState().show(msg, 'error');
              throw error;
            }
          }
        } else if (response.type === 'cancelled') {
          console.log('User cancelled the login flow');
          useToastStore.getState().show('Google login cancelled', 'info');
        }
      } catch (error: any) {
        if (error.code === statusCodes.IN_PROGRESS) {
          console.log('Sign in is in progress already');
        } else {
          console.error('Google login failed', error);
          const msg = error.response?.data?.message || error.message || 'An error occurred during Google Sign-In';
          setApiError(msg);
          useToastStore.getState().show(msg, 'error');
        }
      }
    } else {
      Alert.alert(`${provider} SSO`, `${provider} SSO integration is not fully implemented yet.`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">

          <View style={styles.headingBlock}>
            <Text style={styles.title}>Welcome back 👋</Text>
            <Text style={styles.subtitle}>
              Sign in to access your dashboard, saved listings, and applications.
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={[
                  styles.inputWrapper,
                  focusedField === 'email' && styles.inputFocus,
                  errors.email && styles.inputError
                ]}>
                  <Mail size={16} color={colors.mutedForeground} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="you@example.com"
                    placeholderTextColor={colors.mutedForeground}
                    onBlur={() => {
                      onBlur();
                      setFocusedField(null);
                    }}
                    onFocus={() => setFocusedField('email')}
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
              )}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={[
                  styles.inputWrapper,
                  focusedField === 'password' && styles.inputFocus,
                  errors.password && styles.inputError
                ]}>
                  <Lock size={16} color={colors.mutedForeground} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.mutedForeground}
                    secureTextEntry={securePassword}
                    onBlur={() => {
                      onBlur();
                      setFocusedField(null);
                    }}
                    onFocus={() => setFocusedField('password')}
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setSecurePassword(!securePassword)}
                    style={styles.eyeButton}
                    activeOpacity={0.7}
                  >
                    {securePassword ? (
                      <EyeOff size={16} color={colors.mutedForeground} />
                    ) : (
                      <Eye size={16} color={colors.mutedForeground} />
                    )}
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
          </View>

          {apiError && (
            <View style={styles.globalErrorContainer}>
              <Text style={styles.globalErrorText}>{apiError}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.submitButton}
            activeOpacity={0.8}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.secondaryForeground} />
            ) : (
              <Text style={styles.submitButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.separatorContainer}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>or sign in with</Text>
            <View style={styles.separatorLine} />
          </View>

          <View style={styles.socialRow}>
            <TouchableOpacity
              style={styles.socialButton}
              activeOpacity={0.8}
              onPress={() => handleSocialSignIn(AUTH_PROVIDERS.GOOGLE)}
            >
              <GoogleLogo size={16} />
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, { opacity: 0.5 }]}
              activeOpacity={1}
              disabled={true}
              onPress={() => handleSocialSignIn(AUTH_PROVIDERS.LINKEDIN)}
            >
              <LinkedInLogo size={16} />
              <Text style={styles.socialButtonText}>LinkedIn</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.toggleFooter}>
            <Text style={styles.toggleText}>Don't have an account?</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate(ROUTES.REGISTER, { role: USER_ROLES.CANDIDATE })}
            >
              <Text style={styles.toggleLink}> Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <RoleSelectionModal
        visible={roleModalVisible}
        onClose={() => setRoleModalVisible(false)}
        onSelectRole={handleRoleSelection}
      />
    </SafeAreaView>
  );
};

export default LoginScreen;
