import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ChevronLeft, Check, X, FileText, MapPin, Briefcase, Mail, Phone } from 'lucide-react-native';
import { API_BASE_URL } from '../../../constants';
import { apiClient } from '../../../services/apiClient';
import { useToastStore } from '../../../store/useToastStore';
import { ResumeViewerModal } from '../../../components/common/ResumeViewerModal';
import { getStyles } from './ApplicantReviewScreen.styles';
import { useTheme } from '../../../hooks/useTheme';

export const ApplicantReviewScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { applicationId, applicant } = route.params;
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(applicant?.status || 'applied');
  const [resumeViewerVisible, setResumeViewerVisible] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    try {
      await apiClient.patch(`/recruiter/applications/${applicationId}`, { status: newStatus });
      setStatus(newStatus);
      const displayStatus = newStatus === 'reviewing' ? 'Under Review' : newStatus === 'accepted' ? 'Approved & Hired' : newStatus;
      useToastStore.getState().show(`Applicant status updated to: ${displayStatus}`, 'success');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update applicant status.';
      useToastStore.getState().show(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getAbsoluteResumeUrl = () => {
    let url = applicant?.resumeUrl || applicant?.candidate?.resumeUrl;
    if (!url) return null;
    
    // Replace localhost or 127.0.0.1 with the actual backend host for mobile device compatibility
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

  const handleOpenResume = () => {
    const resumeUrl = getAbsoluteResumeUrl();
    if (resumeUrl) {
      setResumeViewerVisible(true);
    } else {
      useToastStore.getState().show('No resume URL available for this applicant.', 'error');
    }
  };

  if (!applicant) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Applicant details not found.</Text>
      </SafeAreaView>
    );
  }

  const { candidate } = applicant;

  const getStatusStyles = (statusVal: string) => {
    switch (statusVal) {
      case 'accepted':
        return {
          bg: isDark ? '#064e3b' : '#DCFCE7',
          color: isDark ? '#34d399' : '#16A34A',
          label: 'Approved'
        };
      case 'rejected':
        return {
          bg: isDark ? '#4c0519' : '#FEE2E2',
          color: isDark ? '#fda4af' : '#DC2626',
          label: 'Rejected'
        };
      case 'interviewing':
        return {
          bg: isDark ? '#422006' : '#FEF9C3',
          color: isDark ? '#fef08a' : '#CA8A04',
          label: 'Interviewing'
        };
      case 'reviewing':
        return {
          bg: isDark ? '#082f49' : '#E0F2FE',
          color: isDark ? '#7dd3fc' : '#0369A1',
          label: 'Under Review'
        };
      default:
        return {
          bg: isDark ? '#1e1b4b' : '#EEF2FF',
          color: isDark ? '#a5b4fc' : '#4338CA',
          label: 'Applied'
        };
    }
  };

  const renderFooterActions = () => {
    if (loading) {
      return <ActivityIndicator color={colors.primary} />;
    }

    if (status === 'accepted') {
      return (
        <View style={[styles.statusBanner, styles.acceptedBanner]}>
          <Check size={20} color={isDark ? '#34d399' : '#16A34A'} />
          <Text style={styles.statusBannerText}>Applicant Hired & Approved</Text>
        </View>
      );
    }

    if (status === 'rejected') {
      return (
        <View style={[styles.statusBanner, styles.rejectedBanner]}>
          <X size={20} color={isDark ? '#fda4af' : '#DC2626'} />
          <Text style={styles.statusBannerText}>Applicant Rejected</Text>
        </View>
      );
    }

    let secondaryButtonLabel = 'Reject';
    let secondaryStatus = 'rejected';
    
    let primaryButtonLabel = '';
    let primaryStatus = '';
    let primaryColor: string = colors.primary;
    let primaryBg = isDark ? '#172554' : '#EFF6FF';

    if (status === 'applied') {
      primaryButtonLabel = 'Move to Review';
      primaryStatus = 'reviewing';
      primaryColor = isDark ? '#60a5fa' : '#2563EB';
      primaryBg = isDark ? '#172554' : '#EFF6FF';
    } else if (status === 'reviewing') {
      primaryButtonLabel = 'Invite to Interview';
      primaryStatus = 'interviewing';
      primaryColor = isDark ? '#fbbf24' : '#D97706';
      primaryBg = isDark ? '#451a03' : '#FFFBEB';
    } else if (status === 'interviewing') {
      primaryButtonLabel = 'Approve & Hire';
      primaryStatus = 'accepted';
      primaryColor = isDark ? '#34d399' : '#16A34A';
      primaryBg = isDark ? '#064e3b' : '#F0FDF4';
    }

    return (
      <View style={styles.footerButtonsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleStatusChange(secondaryStatus)}
        >
          <X size={18} color={colors.error} />
          <Text style={[styles.actionButtonText, styles.rejectText]}>
            {secondaryButtonLabel}
          </Text>
        </TouchableOpacity>

        {primaryButtonLabel ? (
          <TouchableOpacity 
            style={[
              styles.actionButton, 
              { borderColor: primaryColor, backgroundColor: primaryBg }
            ]}
            onPress={() => handleStatusChange(primaryStatus)}
          >
            <Check size={18} color={primaryColor} />
            <Text style={[styles.actionButtonText, { color: primaryColor }]}>
              {primaryButtonLabel}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Applicant</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileHeader}>
          <View style={styles.profileInfoLeft}>
            <Text style={styles.candidateName}>{candidate?.name}</Text>
            {candidate?.title ? (
              <Text style={{ fontSize: 14, color: colors.primary, fontWeight: '600', marginTop: 2, marginBottom: 2 }}>{candidate.title}</Text>
            ) : null}
            <Text style={styles.candidateEmail}>{candidate?.email}</Text>
            
            <View style={[styles.statusBadge, { backgroundColor: getStatusStyles(status).bg }]}>
              <Text style={[styles.statusText, { color: getStatusStyles(status).color }]}>
                {getStatusStyles(status).label}
              </Text>
            </View>
          </View>

          <View style={styles.avatarContainer}>
            {candidate?.avatarUrl ? (
              <Image source={{ uri: candidate.avatarUrl }} style={{ width: '100%', height: '100%' }} />
            ) : (
              <Text style={styles.avatarText}>{candidate?.name?.charAt(0).toUpperCase() || 'U'}</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Details</Text>
          <View style={styles.infoRow}>
            <Mail size={18} color={colors.mutedForeground} />
            <Text style={styles.infoText}>{candidate?.email || 'Email not specified'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Phone size={18} color={colors.mutedForeground} />
            <Text style={styles.infoText}>{candidate?.phone || 'Phone not specified'}</Text>
          </View>
          <View style={styles.infoRow}>
            <MapPin size={18} color={colors.mutedForeground} />
            <Text style={styles.infoText}>{candidate?.location || 'Location not specified'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Briefcase size={18} color={colors.mutedForeground} />
            <Text style={styles.infoText}>
              {candidate?.experience !== undefined ? `${candidate.experience} years experience` : 'Experience not specified'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resume & Documents</Text>
          <TouchableOpacity style={styles.resumeCard} onPress={handleOpenResume}>
            <View style={styles.resumeIcon}>
              <FileText size={24} color={colors.primary} />
            </View>
            <View style={styles.resumeDetails}>
              <Text style={styles.resumeTitle}>{candidate?.resumeName || 'Resume Document'}</Text>
              <Text style={styles.resumeSubtitle}>Tap to view document</Text>
            </View>
          </TouchableOpacity>
        </View>

        {applicant.coverLetter && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cover Letter</Text>
            <Text style={styles.coverLetterText}>{applicant.coverLetter}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {renderFooterActions()}
      </View>
      <ResumeViewerModal
        visible={resumeViewerVisible}
        url={getAbsoluteResumeUrl()}
        onClose={() => setResumeViewerVisible(false)}
        title={`${candidate?.name || 'Applicant'}'s Resume`}
      />
    </SafeAreaView>
  );
};

export default ApplicantReviewScreen;
