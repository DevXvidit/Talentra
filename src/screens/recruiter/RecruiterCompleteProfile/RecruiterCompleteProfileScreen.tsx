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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera, ChevronLeft, User as UserIcon, UploadCloud, AlertCircle } from 'lucide-react-native';
import { isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAuthStore } from '../../../store/useAuthStore';
import { recruiterService } from '../../../services/recruiterService';
import { authService } from '../../../services/authService';
import { getStyles } from './RecruiterCompleteProfileScreen.styles';
import { useTheme } from '../../../hooks/useTheme';
import { useToastStore } from '../../../store/useToastStore';

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '500+'] as const;

const recruiterCompleteSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().length(10, 'Phone number must be exactly 10 digits'),
  location: z.string().min(2, 'Location is required'),
  recruiterTitle: z.string().min(2, 'Title must be at least 2 characters'),
  about: z.string().min(10, 'Bio description must be at least 10 characters'),
  companyName: z.string().min(2, 'Company name is required'),
  companyWebsite: z.string().url('Must be a valid website URL (e.g. https://google.com)').or(z.literal('')),
  companyHeadquarters: z.string().min(2, 'Company location is required'),
  companyIndustry: z.string().min(2, 'Company industry is required'),
  companySize: z.enum(COMPANY_SIZES, { message: 'Please select a company size' }),
});

type RecruiterCompleteFormData = z.infer<typeof recruiterCompleteSchema>;

export const RecruiterCompleteProfileScreen = () => {
  const navigation = useNavigation<any>();
  const { user, updateUser } = useAuthStore();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [companyLogo, setCompanyLogo] = useState<{ uri: string; name: string; type: string } | null>(null);

  const getInitialPhone = () => {
    if (user?.phone) {
      if (user.phone.startsWith('+91')) {
        return user.phone.substring(3);
      }
      return user.phone;
    }
    return '';
  };

  const getCompanyDetails = () => {
    if (user?.companyId && typeof user.companyId === 'object') {
      return user.companyId;
    }
    return null;
  };

  const company = getCompanyDetails();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RecruiterCompleteFormData>({
    resolver: zodResolver(recruiterCompleteSchema),
    defaultValues: {
      name: user?.name || '',
      phone: getInitialPhone(),
      location: user?.location || '',
      recruiterTitle: user?.recruiterTitle || '',
      about: user?.about || '',
      companyName: company?.name || '',
      companyWebsite: company?.website || '',
      companyHeadquarters: company?.headquarters || '',
      companyIndustry: company?.industry || '',
      companySize: company?.size as any || '',
    },
  });

  const handlePickAvatar = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });

      if (result.didCancel || !result.assets?.length) return;
      const asset = result.assets[0];

      setAvatar({
        uri: asset.uri!,
        name: asset.fileName || 'avatar.jpg',
        type: asset.type || 'image/jpeg',
      });
    } catch (err) {
      if (!isErrorWithCode(err) || err.code !== errorCodes.OPERATION_CANCELED) {
        useToastStore.getState().show('Failed to pick profile picture.', 'error');
      }
    }
  };

  const handlePickLogo = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });

      if (result.didCancel || !result.assets?.length) return;
      const asset = result.assets[0];

      setCompanyLogo({
        uri: asset.uri!,
        name: asset.fileName || 'logo.jpg',
        type: asset.type || 'image/jpeg',
      });
    } catch (err) {
      if (!isErrorWithCode(err) || err.code !== errorCodes.OPERATION_CANCELED) {
        useToastStore.getState().show('Failed to pick company logo.', 'error');
      }
    }
  };

  const onSubmit = async (data: RecruiterCompleteFormData) => {
    setGeneralError(null);
    setIsSubmitting(true);

    try {
      
      await recruiterService.updateProfile({
        name: data.name.trim(),
        phone: data.phone.trim(),
        location: data.location.trim(),
        recruiterTitle: data.recruiterTitle.trim(),
        about: data.about.trim(),
        avatar: avatar || undefined,
      });

      const companyParams = {
        name: data.companyName.trim(),
        website: data.companyWebsite.trim(),
        headquarters: data.companyHeadquarters.trim(),
        industry: data.companyIndustry.trim(),
        size: data.companySize,
        phone: data.phone.trim(),
        logo: companyLogo || undefined,
      };

      if (!user?.companyId) {
        await recruiterService.createCompany(companyParams);
      } else {
        const companyId = typeof user.companyId === 'string' ? user.companyId : user.companyId._id;
        await recruiterService.updateCompany(companyId, companyParams);
      }

      const meResponse = await authService.getMe();
      if (meResponse.success && meResponse.user) {
        updateUser(meResponse.user);
        useToastStore.getState().show('Recruiter and company profiles saved successfully!', 'success');
        navigation.goBack();
      } else {
        setGeneralError('Successfully saved profiles, but failed to fetch fresh session details.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'An error occurred during profile setup.';
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
        <Text style={styles.headerTitle}>Recruiter Onboarding</Text>
        <View style={styles.backButtonPlaceholder} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeTitle}>Setup Hiring Profile</Text>
            <Text style={styles.welcomeText}>
              Complete your recruiter and company profiles to start posting job openings and accepting applicants.
            </Text>
          </View>

          {generalError && (
            <View style={styles.errorBanner}>
              <AlertCircle size={20} color={isDark ? '#fca5a5' : '#9B1C1C'} />
              <Text style={styles.errorBannerText}>{generalError}</Text>
            </View>
          )}

          <View style={styles.formContainer}>

            <Text style={styles.sectionHeader}>1. Recruiter Details</Text>

            <View style={styles.imagePickerSection}>
              <TouchableOpacity style={styles.avatarWrapper} activeOpacity={0.8} onPress={handlePickAvatar}>
                <View style={styles.avatarContainer}>
                  {avatar?.uri ? (
                    <Image source={{ uri: avatar.uri }} style={styles.avatar} />
                  ) : user?.avatarUrl ? (
                    <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <UserIcon size={36} color={colors.primaryForeground} />
                    </View>
                  )}
                </View>
                <View style={styles.cameraBadge}>
                  <Camera size={12} color="#ffffff" />
                </View>
              </TouchableOpacity>
              <Text style={styles.imagePickerHelp}>Tap to change profile picture</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, errors.name ? styles.labelError : null]}>Full Name</Text>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.name ? styles.inputError : null]}
                    placeholder="Hiring Manager Name"
                    placeholderTextColor={colors.mutedForeground}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.name && <Text style={styles.helperErrorText}>{errors.name.message}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, errors.recruiterTitle ? styles.labelError : null]}>Hiring Title</Text>
              <Controller
                control={control}
                name="recruiterTitle"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.recruiterTitle ? styles.inputError : null]}
                    placeholder="e.g. HR Manager / Senior Recruiter"
                    placeholderTextColor={colors.mutedForeground}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.recruiterTitle && <Text style={styles.helperErrorText}>{errors.recruiterTitle.message}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, errors.phone ? styles.labelError : null]}>Contact Phone</Text>
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
                      placeholder="10-digit mobile number"
                      placeholderTextColor={colors.mutedForeground}
                      keyboardType="phone-pad"
                      maxLength={10}
                      onBlur={onBlur}
                      value={value}
                      onChangeText={(val) => onChange(val.replace(/[^0-9]/g, ''))}
                    />
                  )}
                />
              </View>
              {errors.phone && <Text style={styles.helperErrorText}>{errors.phone.message}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, errors.location ? styles.labelError : null]}>Your Location</Text>
              <Controller
                control={control}
                name="location"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.location ? styles.inputError : null]}
                    placeholder="e.g. Bangalore, India"
                    placeholderTextColor={colors.mutedForeground}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.location && <Text style={styles.helperErrorText}>{errors.location.message}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, errors.about ? styles.labelError : null]}>Bio Description</Text>
              <Controller
                control={control}
                name="about"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, styles.textArea, errors.about ? styles.inputError : null]}
                    placeholder="Write a brief professional summary about yourself..."
                    placeholderTextColor={colors.mutedForeground}
                    multiline
                    numberOfLines={4}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.about && <Text style={styles.helperErrorText}>{errors.about.message}</Text>}
            </View>

            <Text style={[styles.sectionHeader, { marginTop: 24 }]}>2. Company Details</Text>

            <View style={styles.logoPickerContainer}>
              <Text style={styles.label}>Company Logo</Text>
              {companyLogo?.uri || company?.logoUrl ? (
                <View style={styles.logoCard}>
                  <Image source={{ uri: companyLogo?.uri || company?.logoUrl }} style={styles.logoImage} />
                  <View style={styles.logoInfo}>
                    <Text style={styles.logoTitle} numberOfLines={1}>{companyLogo?.name || 'Current Logo'}</Text>
                    <Text style={styles.logoSubtitle}>Tap logo to change file</Text>
                  </View>
                  <TouchableOpacity style={styles.logoPickBtn} onPress={handlePickLogo}>
                    <Camera size={18} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.logoUploadPlaceholder} onPress={handlePickLogo}>
                  <UploadCloud size={24} color={colors.mutedForeground} />
                  <Text style={styles.logoUploadText}>Upload Company Logo</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, errors.companyName ? styles.labelError : null]}>Company Name</Text>
              <Controller
                control={control}
                name="companyName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.companyName ? styles.inputError : null]}
                    placeholder="e.g. Google Inc"
                    placeholderTextColor={colors.mutedForeground}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.companyName && <Text style={styles.helperErrorText}>{errors.companyName.message}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, errors.companyWebsite ? styles.labelError : null]}>Website URL</Text>
              <Controller
                control={control}
                name="companyWebsite"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.companyWebsite ? styles.inputError : null]}
                    placeholder="e.g. https://mycompany.com"
                    placeholderTextColor={colors.mutedForeground}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                )}
              />
              {errors.companyWebsite && <Text style={styles.helperErrorText}>{errors.companyWebsite.message}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, errors.companyIndustry ? styles.labelError : null]}>Industry</Text>
              <Controller
                control={control}
                name="companyIndustry"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.companyIndustry ? styles.inputError : null]}
                    placeholder="e.g. Technology / Retail / Finance"
                    placeholderTextColor={colors.mutedForeground}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.companyIndustry && <Text style={styles.helperErrorText}>{errors.companyIndustry.message}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, errors.companyHeadquarters ? styles.labelError : null]}>Company Headquarters</Text>
              <Controller
                control={control}
                name="companyHeadquarters"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.companyHeadquarters ? styles.inputError : null]}
                    placeholder="e.g. San Francisco, CA"
                    placeholderTextColor={colors.mutedForeground}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.companyHeadquarters && <Text style={styles.helperErrorText}>{errors.companyHeadquarters.message}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, errors.companySize ? styles.labelError : null]}>Company Size</Text>
              <Controller
                control={control}
                name="companySize"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.sizeOptionsRow}>
                    {COMPANY_SIZES.map((sizeOption) => {
                      const isSelected = value === sizeOption;
                      return (
                        <TouchableOpacity
                          key={sizeOption}
                          style={[styles.sizeOptionChip, isSelected && styles.sizeOptionChipActive]}
                          activeOpacity={0.7}
                          onPress={() => onChange(sizeOption)}
                        >
                          <Text style={[styles.sizeOptionText, isSelected && styles.sizeOptionTextActive]}>
                            {sizeOption}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              />
              {errors.companySize && <Text style={styles.helperErrorText}>{errors.companySize.message}</Text>}
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
            <Text style={styles.primaryButtonText}>Save Profile & Company</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default RecruiterCompleteProfileScreen;
