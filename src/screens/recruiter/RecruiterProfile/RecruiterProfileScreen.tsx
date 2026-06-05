import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Switch,
  Platform,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { User, LogOut, ChevronRight, Settings, Shield, HelpCircle, X } from 'lucide-react-native';
import { useAuthStore } from '../../../store/useAuthStore';
import { apiClient } from '../../../services/apiClient';
import { ROUTES } from '../../../constants/screens';
import { Company } from '../../../types';
import { getStyles } from './RecruiterProfileScreen.styles';
import { useTheme } from '../../../hooks/useTheme';

export const RecruiterProfileScreen = () => {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuthStore();
  const { setTheme, colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const [jobsCount, setJobsCount] = useState(0);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [privacyVisible, setPrivacyVisible] = useState(false);
  const [supportVisible, setSupportVisible] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [_loading, setLoading] = useState(true);

  const fetchRecruiterStats = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/recruiter/jobs');
      const myJobs = response.data.data || [];
      setJobsCount(myJobs.length);
      const totalApps = myJobs.reduce((total: number, job: any) => total + (job.applicantCount || 0), 0);
      setApplicationsCount(totalApps);
    } catch (err: any) {
      console.warn('Failed to load recruiter stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchRecruiterStats();
    }, [fetchRecruiterStats])
  );

  const handleLogout = () => {
    logout();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        <TouchableOpacity
          style={styles.profileCard}
          activeOpacity={0.7}
          onPress={() => navigation.navigate(ROUTES.RECRUITER_COMPLETE_PROFILE)}
        >
          <View style={styles.avatarContainer}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <User size={40} color={colors.primaryForeground} />
              </View>
            )}
          </View>
          <Text style={styles.userName}>{user?.name || 'Recruiter Partner'}</Text>
          <Text style={styles.userTitle}>
            {user?.recruiterTitle || 'Recruiter'}
            {user?.companyId && typeof user.companyId === 'object' ? ` at ${(user.companyId as Company).name}` : ''}
          </Text>
        </TouchableOpacity>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{jobsCount}</Text>
            <Text style={styles.statLabel}>Active Jobs</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{applicationsCount}</Text>
            <Text style={styles.statLabel}>Applicants</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{user?.profileCompletionPercentage ?? 0}%</Text>
            <Text style={styles.statLabel}>Complete</Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.7}
            onPress={() => navigation.navigate(ROUTES.RECRUITER_COMPLETE_PROFILE)}
          >
            <View style={styles.menuIconContainer}>
              <User size={20} color={colors.primary} />
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuLabel}>Edit Profile & Company</Text>
            </View>
            <ChevronRight size={18} color={colors.mutedForeground} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => setPrivacyVisible(true)}
          >
            <View style={styles.menuIconContainer}>
              <Shield size={20} color={colors.primary} />
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuLabel}>Privacy & Security</Text>
            </View>
            <ChevronRight size={18} color={colors.mutedForeground} />
          </TouchableOpacity>

          <View style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Settings size={20} color={colors.primary} />
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuLabel}>Dark Mode</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={(val) => setTheme(val ? 'dark' : 'light')}
              trackColor={{ false: colors.border, true: colors.secondary }}
              thumbColor={Platform.OS === 'android' ? colors.primary : undefined}
            />
          </View>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => setSupportVisible(true)}
          >
            <View style={styles.menuIconContainer}>
              <HelpCircle size={20} color={colors.primary} />
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuLabel}>Help & Support</Text>
            </View>
            <ChevronRight size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
          <LogOut size={18} color={colors.error} style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Log Out</Text>
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
                    Talentra takes your privacy very seriously. We use industry-standard encryption protocols to protect your personal details, credentials, and uploaded documents.
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

                  <Text style={styles.modalSubTitle}>Hiring Visibility</Text>
                  <Text style={styles.modalBodyText}>
                    Choose which candidate details are exposed to team members. Ensure candidate reviews remain private within your hiring portal.
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
                  <Text style={styles.modalSubTitle}>Recruiter Guide</Text>
                  <Text style={styles.modalBodyText}>
                    Q: How do I post a job listing?{"\n"}
                    A: Go to the Job Board / Recruiter Feed tab, click "Post a Job", and fill in the details.
                  </Text>
                  <Text style={styles.modalBodyText}>
                    Q: How do I review applications?{"\n"}
                    A: Tap any active job listing on your dashboard to see candidate resumes and information.
                  </Text>
                  <Text style={styles.modalSubTitle}>Contact Support</Text>
                  <Text style={styles.modalBodyText}>
                    Need assistance setting up company details? Email our partner support team at partner-support@talentra.com.
                  </Text>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

export default RecruiterProfileScreen;
