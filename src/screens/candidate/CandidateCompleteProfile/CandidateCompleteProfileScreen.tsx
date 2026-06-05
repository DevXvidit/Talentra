import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UploadCloud, FileText, Trash2, ChevronLeft, AlertCircle } from 'lucide-react-native';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import { useAuthStore } from '../../../store/useAuthStore';
import { apiClient } from '../../../services/apiClient';
import { completeProfileSchema, CompleteProfileFormData } from '../../../utils/schemas';
import { getStyles } from './CandidateCompleteProfileScreen.styles';
import { useTheme } from '../../../hooks/useTheme';
import { useToastStore } from '../../../store/useToastStore';

export const CandidateCompleteProfileScreen = () => {
  const navigation = useNavigation<any>();
  const { user, updateUser } = useAuthStore();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const getInitialPhone = () => {
    if (user?.phone) {
      if (user.phone.startsWith('+91')) {
        return user.phone.substring(3);
      }
      return user.phone;
    }
    return '';
  };

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CompleteProfileFormData>({
    resolver: zodResolver(completeProfileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: getInitialPhone(),
      location: user?.location || '',
      title: user?.title || '',
      experience: user?.experience !== undefined ? String(user.experience) : '',
      resume: user?.resumeUrl
        ? {
          uri: user.resumeUrl,
          name: user.resumeName || 'resume.pdf',
          type: 'application/pdf',
        }
        : null,
    },
  });

  const resume = watch('resume');

  // Pick PDF/DOCX Resume Document
  const handlePickResume = async () => {
    try {
      const [result] = await pick({
        type: [types.pdf, types.docx, types.doc],
        copyTo: 'cachesDirectory',
      });

      if (!result) return;

      setValue('resume', {
        uri: result.uri,
        name: result.name || 'resume.pdf',
        type: result.type || 'application/pdf',
      }, { shouldValidate: true });
    } catch (err) {
      if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
        // User cancelled picker
      } else {
        useToastStore.getState().show('Failed to pick resume. Please try again.', 'error');
      }
    }
  };

  const handleRemoveResume = () => {
    setValue('resume', null, { shouldValidate: true });
  };

  // Handle Form Submission
  const onSubmit = async (data: CompleteProfileFormData) => {
    setGeneralError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', data.name.trim());
      formData.append('phone', `+91${data.phone.trim()}`);
      formData.append('location', data.location.trim());
      formData.append('title', data.title.trim());
      formData.append('experience', data.experience.trim());

      if (data.resume && !data.resume.uri.startsWith('http')) {
        formData.append('resume', {
          uri: data.resume.uri,
          name: data.resume.name,
          type: data.resume.type,
        } as any);
      }

      const response = await apiClient.patch('/candidate/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success && response.data.user) {
        updateUser(response.data.user);
        useToastStore.getState().show('Profile completed successfully! Welcome to Talentra.', 'success');
        // Close the Complete Profile screen and navigate back
        navigation.goBack();
      } else {
        setGeneralError('Failed to save profile. Please check inputs and try again.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'An error occurred during submission.';
      setGeneralError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complete Profile</Text>
        <View style={styles.backButtonPlaceholder} />
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeTitle}>One last step!</Text>
            <Text style={styles.welcomeText}>
              Complete your candidate profile to start browsing jobs and applying instantly.
            </Text>
          </View>

          {generalError && (
            <View style={styles.errorBanner}>
              <AlertCircle size={20} color={isDark ? '#fca5a5' : '#9B1C1C'} />
              <Text style={styles.errorBannerText}>{generalError}</Text>
            </View>
          )}

          <View style={styles.formContainer}>
            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, errors.name ? styles.labelError : null]}>
                Full Name
              </Text>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.name ? styles.inputError : null]}
                    placeholder="Enter your full name"
                    placeholderTextColor={colors.mutedForeground}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.name && <Text style={styles.helperErrorText}>{errors.name.message}</Text>}
            </View>

            {/* Phone Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, errors.phone ? styles.labelError : null]}>
                Phone Number
              </Text>
              <View style={[styles.phoneInputContainer, errors.phone ? styles.inputError : null]}>
                <View style={styles.phonePrefixContainer}>
                  <Text style={styles.phonePrefixText}>+91</Text>
                </View>
                <Controller
                  control={control}
                  name="phone"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.phoneTextInput}
                      placeholder="Enter 10-digit mobile number"
                      placeholderTextColor={colors.mutedForeground}
                      keyboardType="phone-pad"
                      maxLength={10}
                      onBlur={onBlur}
                      value={value}
                      onChangeText={(val) => {
                        const cleaned = val.replace(/[^0-9]/g, '');
                        onChange(cleaned);
                      }}
                    />
                  )}
                />
              </View>
              {errors.phone && <Text style={styles.helperErrorText}>{errors.phone.message}</Text>}
            </View>

            {/* Location Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, errors.location ? styles.labelError : null]}>
                Location
              </Text>
              <Controller
                control={control}
                name="location"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.location ? styles.inputError : null]}
                    placeholder="e.g. San Francisco, CA"
                    placeholderTextColor={colors.mutedForeground}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.location && <Text style={styles.helperErrorText}>{errors.location.message}</Text>}
            </View>

            {/* Title Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, errors.title ? styles.labelError : null]}>
                Professional Title
              </Text>
              <Controller
                control={control}
                name="title"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.title ? styles.inputError : null]}
                    placeholder="e.g. Product Designer"
                    placeholderTextColor={colors.mutedForeground}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.title && <Text style={styles.helperErrorText}>{errors.title.message}</Text>}
            </View>

            {/* Experience Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, errors.experience ? styles.labelError : null]}>
                Years of Experience
              </Text>
              <Controller
                control={control}
                name="experience"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.experience ? styles.inputError : null]}
                    placeholder="e.g. 3"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="number-pad"
                    onBlur={onBlur}
                    onChangeText={(val) => {
                      const cleaned = val.replace(/[^0-9]/g, '');
                      onChange(cleaned);
                    }}
                    value={value}
                  />
                )}
              />
              {errors.experience && <Text style={styles.helperErrorText}>{errors.experience.message}</Text>}
            </View>

            {/* Resume Upload */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, errors.resume ? styles.labelError : null]}>
                Resume Document
              </Text>

              {!resume ? (
                <TouchableOpacity
                  style={[styles.resumePickerCard, errors.resume ? styles.resumePickerCardError : null]}
                  onPress={handlePickResume}
                >
                  <UploadCloud size={32} color={errors.resume ? colors.error : colors.mutedForeground} />
                  <Text style={styles.resumePickerTitle}>Upload your resume</Text>
                  <Text style={styles.resumePickerSubtitle}>PDF, DOCX formats accepted (Max 5MB)</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.resumeAttachedCard}
                  activeOpacity={0.8}
                  onPress={handlePickResume}
                >
                  <View style={styles.resumeInfo}>
                    <FileText size={24} color={colors.primary} />
                    <View style={styles.resumeTextContainer}>
                      <Text style={styles.resumeName} numberOfLines={1}>
                        {resume.name}
                      </Text>
                      <Text style={styles.resumeSize}>Selected Resume • Click to update</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.removeResumeButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleRemoveResume();
                    }}
                  >
                    <Trash2 size={20} color={colors.error} />
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
              {errors.resume?.message ? <Text style={styles.helperErrorText}>{String(errors.resume.message)}</Text> : null}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.primaryButton, isSubmitting ? styles.primaryButtonDisabled : null]}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <Text style={styles.primaryButtonText}>Submit and Complete</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CandidateCompleteProfileScreen;
