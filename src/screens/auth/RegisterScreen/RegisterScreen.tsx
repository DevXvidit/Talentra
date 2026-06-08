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
import { Mail, Lock, User as UserIcon, Eye, EyeOff, Check } from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../../hooks/useTheme';
import { ROUTES } from '../../../constants/screens';
import { AUTH_PROVIDERS, USER_ROLES } from '../../../constants';
import { AuthStackParamList, UserRole } from '../../../types';
import { useAuthStore } from '../../../store/useAuthStore';
import { registerSchema, RegisterFormData } from '../../../utils/schemas';
import { useToastStore } from '../../../store/useToastStore';
import { GoogleLogo, LinkedInLogo } from '../../../components/common/SocialIcons';
import { RoleSelectionModal } from '../../../components/common/RoleSelectionModal';
import { GOOGLE_WEB_CLIENT_ID, GOOGLE_IOS_CLIENT_ID } from '@env';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { getStyles } from './RegisterScreen.styles';

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

export const RegisterScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const route = useRoute<RouteProp<AuthStackParamList, 'Register'>>();

  const [securePassword, setSecurePassword] = useState(true);
  const [secureConfirmPassword, setSecureConfirmPassword] = useState(true);
  const [termsChecked, setTermsChecked] = useState(true);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [pendingIdToken, setPendingIdToken] = useState<string | null>(null);

  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const initialRole: UserRole = route.params?.role || USER_ROLES.CANDIDATE;

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: initialRole,
    },
  });

  const watchedPassword = watch('password') || '';

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: colors.border };
    if (pass.length < 6) return { score: 1, label: 'Weak', color: '#EF4444' };

    const hasLetters = /[a-zA-Z]/.test(pass);
    const hasNumbers = /[0-9]/.test(pass);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pass);

    if (pass.length >= 8 && hasLetters && hasNumbers && hasSpecial) {
      return { score: 3, label: 'Strong', color: '#10B981' };
    }

    return { score: 2, label: 'Fair', color: '#14B8A6' };
  };

  const strength = getPasswordStrength(watchedPassword);

  const onSubmit = async (data: RegisterFormData) => {
    if (!termsChecked) {
      setApiError('Please agree to the Terms of Service and Privacy Policy to create an account.');
      useToastStore.getState().show('Please agree to the Terms of Service.', 'warning');
      return;
    }

    setApiError(null);
    setLoading(true);
    try {
      await useAuthStore.getState().register({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      });
      useToastStore.getState().show('Account created successfully!', 'success');
    } catch (err: any) {
      console.warn('Registration request failed:', err);
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
      useToastStore.getState().show('Registered and logged in with Google!', 'success');
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
        try {
          
          await GoogleSignin.signOut();
        } catch (_e) {
          
        }
        const response = await GoogleSignin.signIn();

        if (response.type === 'success' && response.data?.idToken) {
          const idToken = response.data.idToken;
          const selectedRole = watch('role');
          try {
            await useAuthStore.getState().googleLogin({
              idToken,
              role: selectedRole
            });
            useAuthStore.getState().checkAuth();
            useToastStore.getState().show('Logged in successfully with Google!', 'success');
          } catch (error: any) {
            const isRoleRequired = error.response?.data?.message?.includes('selecting a role') || 
                                  error.message?.includes('selecting a role');
            if (isRoleRequired) {
              setPendingIdToken(idToken);
              setRoleModalVisible(true);
            } else {
              const msg = error.response?.data?.message || error.message || 'Google login failed';
              useToastStore.getState().show(msg, 'error');
              throw error;
            }
          }
        } else if (response.type === 'cancelled') {
          console.log('User cancelled the login flow');
          useToastStore.getState().show('Google sign-in cancelled', 'info');
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
          <View style={styles.inputGroup}>
            <Controller
              control={control}
              name="role"
              render={({ field: { onChange, value } }) => (
                <View style={styles.roleRow}>
                  <TouchableOpacity
                    style={[
                      styles.roleOption,
                      value === USER_ROLES.CANDIDATE && styles.roleOptionActiveCandidate,
                    ]}
                    activeOpacity={0.8}
                    disabled={loading}
                    onPress={() => onChange(USER_ROLES.CANDIDATE)}
                  >
                    <Text style={[
                      styles.roleText,
                      value === USER_ROLES.CANDIDATE && styles.roleTextActive,
                    ]}>
                      Candidate
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.roleOption,
                      value === USER_ROLES.RECRUITER && styles.roleOptionActiveRecruiter,
                    ]}
                    activeOpacity={0.8}
                    disabled={loading}
                    onPress={() => onChange(USER_ROLES.RECRUITER)}
                  >
                    <Text style={[
                      styles.roleText,
                      value === USER_ROLES.RECRUITER && styles.roleTextActive,
                    ]}>
                      Recruiter
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={[
                  styles.inputWrapper,
                  focusedField === 'name' && styles.inputFocus,
                  errors.name && styles.inputError
                ]}>
                  <UserIcon size={16} color={colors.mutedForeground} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Alex Johnson"
                    placeholderTextColor={colors.mutedForeground}
                    onBlur={() => {
                      onBlur();
                      setFocusedField(null);
                    }}
                    onFocus={() => setFocusedField('name')}
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="words"
                    editable={!loading}
                  />
                </View>
              )}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
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
                    editable={!loading}
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
                    placeholder="Create a strong password"
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
                    textContentType="oneTimeCode"
                    editable={!loading}
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

            {watchedPassword.length > 0 && (
              <View style={styles.strengthBarContainer}>
                <View style={[
                  styles.strengthSegment,
                  { backgroundColor: strength.score >= 1 ? strength.color : colors.border }
                ]} />
                <View style={[
                  styles.strengthSegment,
                  { backgroundColor: strength.score >= 2 ? strength.color : colors.border }
                ]} />
                <View style={[
                  styles.strengthSegment,
                  { backgroundColor: strength.score >= 3 ? strength.color : colors.border }
                ]} />
                <Text style={styles.strengthLabel}>{strength.label}</Text>
              </View>
            )}
            {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={[
                  styles.inputWrapper,
                  focusedField === 'confirmPassword' && styles.inputFocus,
                  errors.confirmPassword && styles.inputError
                ]}>
                  <Lock size={16} color={colors.mutedForeground} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Re-enter your password"
                    placeholderTextColor={colors.mutedForeground}
                    secureTextEntry={secureConfirmPassword}
                    onBlur={() => {
                      onBlur();
                      setFocusedField(null);
                    }}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="none"
                    textContentType="oneTimeCode"
                    editable={!loading}
                  />
                  <TouchableOpacity
                    onPress={() => setSecureConfirmPassword(!secureConfirmPassword)}
                    style={styles.eyeButton}
                    activeOpacity={0.7}
                  >
                    {secureConfirmPassword ? (
                      <EyeOff size={16} color={colors.mutedForeground} />
                    ) : (
                      <Eye size={16} color={colors.mutedForeground} />
                    )}
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>}
          </View>

          <TouchableOpacity
            style={styles.termsRow}
            activeOpacity={0.8}
            disabled={loading}
            onPress={() => setTermsChecked(!termsChecked)}
          >
            <View style={[styles.checkbox, termsChecked && styles.checkboxChecked]}>
              {termsChecked && <Check size={12} color="#FFFFFF" />}
            </View>
            <Text style={styles.termsText}>
              I agree to the <Text style={styles.termsLink}>Terms of Service</Text> and <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>

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
              <Text style={styles.submitButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.separatorContainer}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>or sign up with</Text>
            <View style={styles.separatorLine} />
          </View>

          <View style={styles.socialRow}>
            <TouchableOpacity
              style={[styles.socialButton, loading && { opacity: 0.5 }]}
              activeOpacity={0.8}
              disabled={loading}
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
            <Text style={styles.toggleText}>Already have an account?</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              disabled={loading}
              onPress={() => navigation.navigate(ROUTES.LOGIN, { role: USER_ROLES.CANDIDATE })}
            >
              <Text style={styles.toggleLink}> Sign in</Text>
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

export default RegisterScreen;
