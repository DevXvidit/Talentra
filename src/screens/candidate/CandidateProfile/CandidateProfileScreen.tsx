import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Switch,
  Modal,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  FileText,
  RotateCw,
  Shield,
  Moon,
  HelpCircle,
  LogOut,
  Camera,
  ChevronRight,
  X,
  Upload,
} from 'lucide-react-native';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import { launchImageLibrary } from 'react-native-image-picker';
import { useToastStore } from '../../../store/useToastStore';
import { useTheme } from '../../../hooks/useTheme';
import { useAuthStore } from '../../../store/useAuthStore';
import { apiClient } from '../../../services/apiClient';
import { authService } from '../../../services/authService';
import { ROUTES } from '../../../constants/screens';
import { getStyles } from './CandidateProfileScreen.styles';
import { ResumeViewerModal } from '../../../components/common/ResumeViewerModal';
import { API_BASE_URL } from '../../../constants';

import CandidateProfileLoading from './components/CandidateProfileLoading';

export const CandidateProfileScreen = () => {
  const navigation = useNavigation<any>();
  const { user, logout, updateUser } = useAuthStore();

  const [stats, setStats] = useState<{ applied: number; hired: number; saved: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);

  const [privacyVisible, setPrivacyVisible] = useState(false);
  const [supportVisible, setSupportVisible] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [resumeViewerVisible, setResumeViewerVisible] = useState(false);
  const [resumeOptionsVisible, setResumeOptionsVisible] = useState(false);

  const { theme, colors, isDark, setTheme } = useTheme();
  const styles = getStyles(colors, isDark);

  const fetchProfileStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.getMe();
      if (response.success && response.user) {
        updateUser(response.user);
        if (response.user.stats) {
          setStats(response.user.stats);
        }
      }
    } catch (err: any) {
      console.warn('Failed to load profile stats:', err);
      setError(err.response?.data?.message || err.message || 'Failed to retrieve profile details.');
    } finally {
      setLoading(false);
    }
  }, [updateUser]);

  useFocusEffect(
    useCallback(() => {
      fetchProfileStats();
    }, [fetchProfileStats])
  );

  const handleUpdateAvatar = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });

      if (result.didCancel || !result.assets?.length) return;

      setLoading(true);
      const asset = result.assets[0];

      const formData = new FormData();
      formData.append('avatar', {
        uri: asset.uri!,
        name: asset.fileName || 'avatar.jpg',
        type: asset.type || 'image/jpeg',
      } as any);

      const response = await apiClient.patch('/candidate/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success && response.data.user) {
        updateUser(response.data.user);
        useToastStore.getState().show('Profile picture updated successfully!', 'success');
        fetchProfileStats();
      } else {
        useToastStore.getState().show('Failed to update profile picture.', 'error');
      }
    } catch (err: any) {
      if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
        
      } else {
        const msg = err.response?.data?.message || err.message || 'Failed to update profile picture.';
        useToastStore.getState().show(msg, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateResumeFromProfile = async () => {
    try {
      const [result] = await pick({
        type: [types.pdf, types.docx, types.doc],
        copyTo: 'cachesDirectory',
      });

      if (!result) return;

      setLoading(true);
      const formData = new FormData();
      formData.append('name', user?.name || '');
      formData.append('phone', user?.phone || '');
      formData.append('location', user?.location || '');
      formData.append('experience', String(user?.experience ?? 0));
      formData.append('resume', {
        uri: result.uri,
        name: result.name || 'resume.pdf',
        type: result.type || 'application/pdf',
      } as any);

      const response = await apiClient.patch('/candidate/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success && response.data.user) {
        updateUser(response.data.user);
        useToastStore.getState().show('Resume updated successfully!', 'success');
        fetchProfileStats();
      } else {
        useToastStore.getState().show('Failed to update resume. Please try again.', 'error');
      }
    } catch (err: any) {
      if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
        
      } else {
        const msg = err.response?.data?.message || err.message || 'Failed to update resume.';
        useToastStore.getState().show(msg, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const getAbsoluteResumeUrl = () => {
    if (!user?.resumeUrl) return null;
    let url = user.resumeUrl;

    if (url.includes('localhost:5001') || url.includes('127.0.0.1:5001')) {
      const host = API_BASE_URL.split('/api/v1')[0];
      url = url.replace(/https?:\/\/(localhost|127\.0\.0\.1):5001/, host);
    }

    if (url.startsWith('/')) {
      const host = API_BASE_URL.split('/api/v1')[0];
      return `${host}${url}`;
    }
    return url;
  };

  const handleResumePress = () => {
    setResumeOptionsVisible(true);
  };

  const handleLogout = () => {
    logout();
    useToastStore.getState().show('Logged out successfully.', 'info');
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <CandidateProfileLoading />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <View style={styles.header}>
        <Text style={styles.headerTitleText}>Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        <View style={styles.mainInfoCard}>
          <TouchableOpacity
            style={styles.avatarWrapper}
            activeOpacity={0.8}
            onPress={handleUpdateAvatar}
          >
            <View style={styles.avatarContainer}>
              {user?.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <User size={50} color={colors.primaryForeground} />
                </View>
              )}
            </View>
            <View style={{
              position: 'absolute',
              bottom: -4,
              right: -4,
              backgroundColor: colors.primary,
              borderRadius: 14,
              width: 28,
              height: 28,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 2,
              borderColor: isDark ? colors.card : '#F0F4FA',
            }}>
              <Camera size={14} color={colors.primaryForeground} />
            </View>
          </TouchableOpacity>

          <Text style={styles.userName}>{user?.name || 'Alex Johnson'}</Text>
          <Text style={styles.userTitle}>
            {user?.title || 'Product Designer'}
          </Text>

          <View style={styles.statusIndicatorRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Available for work</Text>
          </View>

          <View style={styles.statsCardContainer}>
            <View style={styles.statCol}>
              <Text style={styles.statValText}>{stats?.applied ?? 0}</Text>
              <Text style={styles.statLblText}>Applied</Text>
            </View>
            <View style={styles.statColDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statValText}>{stats?.hired ?? 0}</Text>
              <Text style={styles.statLblText}>Hired</Text>
            </View>
            <View style={styles.statColDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statValText}>{stats?.saved ?? 0}</Text>
              <Text style={styles.statLblText}>Saved</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Info</Text>

          <TouchableOpacity
            style={styles.infoRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate(ROUTES.CANDIDATE_COMPLETE_PROFILE as any)}
          >
            <View style={styles.infoIconWrapper}>
              <User size={18} color={colors.primary} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Full Name</Text>
              <Text style={styles.infoValue}>{user?.name || 'N/A'}</Text>
            </View>
            <ChevronRight size={16} color={colors.mutedForeground} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.infoRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate(ROUTES.CANDIDATE_COMPLETE_PROFILE as any)}
          >
            <View style={styles.infoIconWrapper}>
              <Mail size={18} color={colors.primary} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue} numberOfLines={1}>{user?.email || 'N/A'}</Text>
            </View>
            <ChevronRight size={16} color={colors.mutedForeground} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.infoRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate(ROUTES.CANDIDATE_COMPLETE_PROFILE as any)}
          >
            <View style={styles.infoIconWrapper}>
              <Phone size={18} color={colors.primary} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{user?.phone || 'N/A'}</Text>
            </View>
            <ChevronRight size={16} color={colors.mutedForeground} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.infoRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate(ROUTES.CANDIDATE_COMPLETE_PROFILE as any)}
          >
            <View style={styles.infoIconWrapper}>
              <MapPin size={18} color={colors.primary} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{user?.location || 'N/A'}</Text>
            </View>
            <ChevronRight size={16} color={colors.mutedForeground} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.infoRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate(ROUTES.CANDIDATE_COMPLETE_PROFILE as any)}
          >
            <View style={styles.infoIconWrapper}>
              <Briefcase size={18} color={colors.primary} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Experience</Text>
              <Text style={styles.infoValue}>{user?.experience !== undefined ? `${user.experience}+ years` : 'N/A'}</Text>
            </View>
            <ChevronRight size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        {user?.resumeUrl && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resume</Text>
            <TouchableOpacity
              style={styles.resumeCard}
              activeOpacity={0.7}
              onPress={handleResumePress}
            >
              <View style={styles.resumeIconWrapper}>
                <FileText size={20} color="#ffffff" />
              </View>
              <View style={styles.resumeInfoContainer}>
                <Text style={styles.resumeFileNameText} numberOfLines={1}>
                  {user.resumeName || 'resume.pdf'}
                </Text>
                <Text style={styles.resumeMetaText}>
                  Uploaded recently • Tap to view or update
                </Text>
              </View>
              <View style={styles.resumeSyncWrapper}>
                <RotateCw size={16} color={colors.primary} />
              </View>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <TouchableOpacity style={styles.settingsRow} activeOpacity={0.7} onPress={() => setPrivacyVisible(true)}>
            <View style={styles.settingsIconWrapper}>
              <Shield size={18} color={colors.primary} />
            </View>
            <Text style={styles.settingsLabel}>Privacy & Security</Text>
            <ChevronRight size={16} color={colors.mutedForeground} />
          </TouchableOpacity>

          <View style={styles.settingsRow}>
            <View style={styles.settingsIconWrapper}>
              <Moon size={18} color={colors.primary} />
            </View>
            <Text style={styles.settingsLabel}>Dark Mode</Text>
            <Switch
              value={theme === 'dark'}
              onValueChange={(val) => setTheme(val ? 'dark' : 'light')}
              trackColor={{ false: colors.border, true: colors.secondary }}
              thumbColor={Platform.OS === 'android' ? colors.primary : undefined}
            />
          </View>

          <TouchableOpacity style={styles.settingsRow} activeOpacity={0.7} onPress={() => setSupportVisible(true)}>
            <View style={styles.settingsIconWrapper}>
              <HelpCircle size={18} color={colors.primary} />
            </View>
            <Text style={styles.settingsLabel}>Help & Support</Text>
            <ChevronRight size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
          <LogOut size={18} color={colors.error} />
          <Text style={styles.logoutBtnText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={privacyVisible}
        onRequestClose={() => setPrivacyVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setPrivacyVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Privacy & Security</Text>
                  <TouchableOpacity style={styles.closeBtn} onPress={() => setPrivacyVisible(false)}>
                    <X size={20} color={colors.foreground} />
                  </TouchableOpacity>
                </View>
                <ScrollView contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
                  <Text style={styles.modalSubTitle}>Data Privacy & Protection</Text>
                  <Text style={styles.modalBodyText}>
                    Talentra takes your privacy very seriously. We use industry-standard encryption protocols to protect your personal details, credentials, and uploaded documents like your resume.
                  </Text>

                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.muted, padding: 16, borderRadius: 12, marginTop: 12 }}>
                    <View style={{ flex: 1, paddingRight: 12 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 4, fontFamily: 'Inter' }}>Two-Factor Authentication</Text>
                      <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter' }}>Require a verification code when signing in.</Text>
                    </View>
                    <Switch
                      value={twoFactorEnabled}
                      onValueChange={setTwoFactorEnabled}
                      trackColor={{ false: colors.border, true: colors.secondary }}
                      thumbColor={Platform.OS === 'android' ? colors.primary : undefined}
                    />
                  </View>

                  <Text style={[styles.modalSubTitle, styles.modalSubTitleDark]}>Resume Visibility</Text>
                  <Text style={[styles.modalBodyText, styles.modalBodyTextDark]}>
                    Your resume is only visible to recruiters whose job listings you explicitly apply for. General recruiters cannot browse your documents without your consent.
                  </Text>
                  <Text style={[styles.modalSubTitle, styles.modalSubTitleDark]}>Account Security</Text>
                  <Text style={[styles.modalBodyText, styles.modalBodyTextDark]}>
                    Ensure you keep your password secure. SSO integrations (like Google Sign-In) use secure OAuth tokens and do not expose your credentials to our server database.
                  </Text>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={supportVisible}
        onRequestClose={() => setSupportVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setSupportVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Help & Support</Text>
                  <TouchableOpacity style={styles.closeBtn} onPress={() => setSupportVisible(false)}>
                    <X size={20} color={colors.foreground} />
                  </TouchableOpacity>
                </View>
                <ScrollView contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
                  <Text style={styles.modalSubTitle}>Frequently Asked Questions</Text>
                  <Text style={styles.modalBodyText}>
                    Q: How do I apply for jobs?{"\n"}
                    A: Browse listings on the Feed screen, tap a job card to view details, and click "Apply" using your saved resume.
                  </Text>
                  <Text style={styles.modalBodyText}>
                    Q: How is my profile completion calculated?{"\n"}
                    A: 20% Base + 20% Name & Phone + 20% Location + 20% Experience + 20% Resume Upload.
                  </Text>
                  <Text style={styles.modalSubTitle}>Contact Support</Text>
                  <Text style={styles.modalBodyText}>
                    Need further assistance? Email us at support@talentra.com. Our support team is available 24/7 to resolve technical bugs or job listing verification issues.
                  </Text>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={supportVisible}
        onRequestClose={() => setSupportVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setSupportVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Help & Support</Text>
                  <TouchableOpacity style={styles.closeBtn} onPress={() => setSupportVisible(false)}>
                    <X size={20} color={colors.foreground} />
                  </TouchableOpacity>
                </View>
                <ScrollView contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
                  <Text style={styles.modalSubTitle}>Frequently Asked Questions</Text>

                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: colors.foreground, marginBottom: 4 }}>How do I apply for a job?</Text>
                    <Text style={{ fontSize: 13, color: colors.mutedForeground, lineHeight: 20 }}>Navigate to the Home feed, tap on any job card to see its full details, and tap the Apply button. Ensure your profile is 100% complete first.</Text>
                  </View>

                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: colors.foreground, marginBottom: 4 }}>How can I update my resume?</Text>
                    <Text style={{ fontSize: 13, color: colors.mutedForeground, lineHeight: 20 }}>You can re-upload your resume at any time by pressing "Complete Profile" at the top of the feed or going into your Account Settings.</Text>
                  </View>

                  <Text style={styles.modalSubTitle}>Contact Us</Text>
                  <Text style={styles.modalBodyText}>
                    If you require immediate assistance or have an issue with an application, please email our support team at support@talentra.com.
                  </Text>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={resumeOptionsVisible}
        onRequestClose={() => setResumeOptionsVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setResumeOptionsVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Resume Options</Text>
                  <TouchableOpacity style={styles.closeBtn} onPress={() => setResumeOptionsVisible(false)}>
                    <X size={20} color={colors.foreground} />
                  </TouchableOpacity>
                </View>
                
                <View style={{ gap: 12, marginTop: 8 }}>
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: isDark ? colors.surface : '#F1F5F9',
                      padding: 16,
                      borderRadius: 14,
                      gap: 12,
                      borderWidth: isDark ? 1 : 0,
                      borderColor: colors.border,
                    }}
                    activeOpacity={0.7}
                    onPress={() => {
                      setResumeOptionsVisible(false);
                      setResumeViewerVisible(true);
                    }}
                  >
                    <View style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: isDark ? '#1e1b4b' : '#EEF2FF',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <FileText size={18} color={colors.primary} />
                    </View>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: colors.foreground, fontFamily: 'Space Grotesk' }}>
                      View Resume
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: isDark ? colors.surface : '#F1F5F9',
                      padding: 16,
                      borderRadius: 14,
                      gap: 12,
                      borderWidth: isDark ? 1 : 0,
                      borderColor: colors.border,
                    }}
                    activeOpacity={0.7}
                    onPress={() => {
                      setResumeOptionsVisible(false);
                      handleUpdateResumeFromProfile();
                    }}
                  >
                    <View style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: isDark ? '#064e3b' : '#E6F4EA',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Upload size={18} color={isDark ? '#34d399' : '#137333'} />
                    </View>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: colors.foreground, fontFamily: 'Space Grotesk' }}>
                      Upload New Resume
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <ResumeViewerModal
        visible={resumeViewerVisible}
        url={getAbsoluteResumeUrl()}
        onClose={() => setResumeViewerVisible(false)}
        title="My Resume"
      />
    </SafeAreaView>
  );
};

export default CandidateProfileScreen;
