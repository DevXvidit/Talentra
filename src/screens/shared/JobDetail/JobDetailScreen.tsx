import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback,
  Image,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { ChevronLeft, Bookmark, MapPin, CheckCircle2, X, AlertCircle, ChevronRight, Upload, Briefcase, Clock, User, Edit3 } from 'lucide-react-native';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import { useToastStore } from '../../../store/useToastStore';
import { ROUTES } from '../../../constants/screens';
import { useAuthStore } from '../../../store/useAuthStore';
import { apiClient } from '../../../services/apiClient';
import { getStyles } from './JobDetailScreen.styles';
import { useTheme } from '../../../hooks/useTheme';
import JobDetailLoading from './components/JobDetailLoading';
import JobDetailError from './components/JobDetailError';

const timeAgo = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths}mo ago`;
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears}y ago`;
};

export const JobDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { user, updateUser } = useAuthStore();
  const { jobId } = route.params || {};
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const [jobData, setJobData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAppliedLocal, setHasAppliedLocal] = useState(false);
  const [appStatusLocal, setAppStatusLocal] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [applicantsPage, setApplicantsPage] = useState(1);
  const [applicantsTotalPages, setApplicantsTotalPages] = useState(1);
  const [loadingMoreApplicants, setLoadingMoreApplicants] = useState(false);

  const [completeProfileVisible, setCompleteProfileVisible] = useState(false);
  const [applyResumeVisible, setApplyResumeVisible] = useState(false);

  // States for cover letter and resume selections
  const [coverLetter, setCoverLetter] = useState('');
  const [selectedResumeType, setSelectedResumeType] = useState<'saved' | 'new' | null>(null);
  const [pickedResumeFile, setPickedResumeFile] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      const syncUser = async () => {
        try {
          const response = await apiClient.get('/auth/me');
          if (response.data.success && response.data.data) {
            updateUser(response.data.data);
          }
        } catch (err) {
          console.warn('Failed to sync user on JobDetail screen focus:', err);
        }
      };
      syncUser();
    }, [updateUser])
  );

  const fetchJob = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/jobs/${jobId}`);
      const data = response.data.data;
      setJobData(data);
      if (data?.hasApplied) {
        setHasAppliedLocal(true);
        setAppStatusLocal(data?.applicationStatus || 'applied');
      }
    } catch (err: any) {
      console.warn('Failed to load job details:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to load job details.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  const fetchApplicants = useCallback(async (pageNum = 1) => {
    if (user?.role !== 'recruiter') return;
    if (pageNum === 1) setLoadingApplicants(true);
    else setLoadingMoreApplicants(true);
    
    try {
      const response = await apiClient.get(`/recruiter/jobs/${jobId}/applicants`, { params: { page: pageNum, limit: 10 } });
      const newApplicants = response.data.data || [];
      const pagination = response.data.pagination || { totalPages: 1 };
      
      if (pageNum === 1) {
        setApplicants(newApplicants || []);
      } else {
        setApplicants(prev => [...prev, ...(newApplicants || [])]);
      }
      setApplicantsPage(pageNum);
      setApplicantsTotalPages(pagination.totalPages);
    } catch (err) {
      console.warn('Failed to load applicants:', err);
    } finally {
      setLoadingApplicants(false);
      setLoadingMoreApplicants(false);
    }
  }, [jobId, user?.role]);

  useEffect(() => {
    if (jobId) {
      fetchJob();
      fetchApplicants();
    }
  }, [jobId, fetchJob, fetchApplicants]);

  // Toggle Bookmark
  const handleBookmark = async () => {
    if (!jobData) return;

    // Optimistic update
    const previousBookmarked = jobData.isBookmarked;
    setJobData((prev: any) => ({ ...prev, isBookmarked: !prev.isBookmarked }));

    try {
      const response = await apiClient.post(`/jobs/${jobId}/bookmark`);
      setJobData((prev: any) => ({ ...prev, isBookmarked: response.data.isBookmarked }));
      useToastStore.getState().show(
        response.data.isBookmarked ? 'Job added to bookmarks!' : 'Job removed from bookmarks.',
        'success'
      );
    } catch (err: any) {
      // Rollback
      setJobData((prev: any) => ({ ...prev, isBookmarked: previousBookmarked }));
      useToastStore.getState().show('Failed to update bookmark status.', 'error');
    }
  };

  const getWordCount = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).filter(w => w.length > 0).length;
  };

  const handlePickResume = async () => {
    try {
      const [result] = await pick({
        type: [types.pdf, types.docx, types.allFiles],
      });
      if (!result) return;
      
      setPickedResumeFile({
        uri: result.uri,
        name: result.name || 'resume.pdf',
        type: result.type || 'application/pdf',
      });
      setSelectedResumeType('new');
    } catch (err) {
      if (!isErrorWithCode(err) || err.code !== errorCodes.OPERATION_CANCELED) {
        useToastStore.getState().show('Failed to pick resume file.', 'error');
      }
    }
  };

  const submitApplication = async () => {
    const wordCount = getWordCount(coverLetter);
    if (wordCount < 10) {
      useToastStore.getState().show('Cover letter must be at least 10 words.', 'error');
      return;
    }

    let fileObj = null;
    if (selectedResumeType === 'new') {
      if (!pickedResumeFile) {
        useToastStore.getState().show('Please select a resume file.', 'error');
        return;
      }
      fileObj = pickedResumeFile;
    } else if (selectedResumeType !== 'saved') {
      useToastStore.getState().show('Please select a resume option.', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      if (fileObj) {
        formData.append('resume', fileObj as any);
      } else {
        formData.append('useSavedResume', 'true');
      }
      formData.append('coverLetter', coverLetter.trim());

      await apiClient.post(`/jobs/${jobId}/apply`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setHasAppliedLocal(true);
      setAppStatusLocal('applied');
      setApplyResumeVisible(false);
      useToastStore.getState().show('Your application has been submitted successfully!', 'success');
    } catch (err) {
      const errMsg = (err as any).response?.data?.message || 'Failed to submit application. Please try again.';
      useToastStore.getState().show(errMsg, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Resume Upload and Apply
  const handleApply = () => {
    if (jobData?.status === 'closed' || (jobData?.filledPositions >= jobData?.totalPositions)) {
      useToastStore.getState().show('This position is closed and not accepting applications.', 'error');
      return;
    }

    if (user?.role === 'candidate' && !user?.isProfileComplete) {
      setCompleteProfileVisible(true);
      return;
    }

    // Initialize/reset apply states and open the bottom sheet modal
    setCoverLetter('');
    setPickedResumeFile(null);
    setSelectedResumeType(user?.resumeUrl ? 'saved' : null);
    setApplyResumeVisible(true);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <JobDetailLoading />
      </SafeAreaView>
    );
  }

  if (error || !jobData) {
    return <JobDetailError message={error || 'Job not found'} onRetry={fetchJob} onBack={handleBack} />;
  }

  const isCandidate = user?.role === 'candidate';
  const displayLetter = jobData.title ? jobData.title.charAt(0).toUpperCase() : 'T';
  const companyLetter = jobData.company?.name ? jobData.company.name.charAt(0).toUpperCase() : 'C';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
          <ChevronLeft color={colors.foreground} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Details</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {user?.role === 'recruiter' && jobData?.recruiter?.id === user?._id && (
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.navigate(ROUTES.RECRUITER_ROOT, {
                screen: ROUTES.RECRUITER_POST_JOB,
                params: { jobId: jobData.id }
              })}
              activeOpacity={0.7}
            >
              <Edit3 color={colors.primary} size={20} />
            </TouchableOpacity>
          )}
          <View style={styles.headerAvatar}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.headerAvatarPlaceholder} />
            ) : (
              <View style={[styles.headerAvatarPlaceholder, { backgroundColor: colors.muted }]}>
                <Text style={[styles.headerAvatarText, { color: colors.foreground }]}>{user?.name?.charAt(0).toUpperCase() || 'U'}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={[styles.logoCircle, { borderRadius: 16, overflow: 'hidden' }]}>
              {jobData.company?.logoUrl ? (
                <Image source={{ uri: jobData.company.logoUrl }} style={{ width: '100%', height: '100%', borderRadius: 16 }} />
              ) : (
                <Text style={styles.logoLetter}>{displayLetter}</Text>
              )}
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{jobData.title}</Text>
              <Text style={styles.companyName}>{jobData.company?.name || 'Talentra Partner'}</Text>
            </View>
          </View>

          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <MapPin size={16} color={colors.mutedForeground} />
              <Text style={styles.metaText}>{jobData.location}</Text>
            </View>
            <View style={styles.metaItem}>
              <Briefcase size={16} color={colors.mutedForeground} />
              <Text style={styles.metaText}>
                {jobData.experience ? `${jobData.experience}+ years exp.` : 'Experience required'}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Clock size={16} color={colors.mutedForeground} />
              <Text style={styles.metaText}>{jobData.type || 'Fulltime'}</Text>
            </View>
            {jobData.totalPositions ? (
              <View style={styles.metaItem}>
                <User size={16} color={colors.mutedForeground} />
                <Text style={styles.metaText}>
                  {jobData.totalPositions} {jobData.totalPositions > 1 ? 'positions required' : 'position required'}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.heroDivider} />

          <View style={styles.heroFooter}>
            <View style={styles.metaItem}>
              <Clock size={16} color={colors.mutedForeground} />
              <Text style={styles.postedText}>Posted {timeAgo(jobData.createdAt)}</Text>
            </View>
            <Text style={styles.salaryText}>{jobData.salary || 'Competitive'}</Text>
          </View>
        </View>

        {/* Applicants Banner */}
        <View style={styles.applicantsBanner}>
          <View style={styles.avatarGroup}>
            {jobData.firstApplicants && jobData.firstApplicants.length > 0 ? (
              jobData.firstApplicants.map((applicant: any, idx: number) => (
                <View key={idx} style={[styles.overlappingAvatar, { zIndex: 3 - idx, marginLeft: idx === 0 ? 12 : -12 }]}>
                  {applicant.avatarUrl ? (
                    <Image source={{ uri: applicant.avatarUrl }} style={{ width: '100%', height: '100%', borderRadius: 16 }} />
                  ) : (
                    <User size={16} color={colors.mutedForeground} />
                  )}
                </View>
              ))
            ) : (
              <View style={[styles.overlappingAvatar, { marginLeft: 12 }]}>
                <User size={16} color={colors.mutedForeground} />
              </View>
            )}
            <Text style={styles.applicantsText}>{jobData.applicantsCount || 0} people applied</Text>
          </View>
          <View style={styles.activeBadge}>
            <View style={styles.activeDot} />
            <Text style={styles.activeText}>Active</Text>
          </View>
        </View>

        {/* Job Description */}
        <View style={styles.listContainer}>
          <Text style={styles.sectionTitle}>Job Description</Text>
          <Text style={styles.descriptionText}>{jobData.description}</Text>
        </View>
        
        {/* Must-Have */}
        {jobData.mustHaveSkills && jobData.mustHaveSkills.length > 0 && (
          <View style={styles.listContainer}>
            <Text style={styles.sectionTitle}>Must-Have</Text>
            {jobData.mustHaveSkills.map((skill: string, index: number) => (
              <View key={index} style={styles.listItem}>
                <View style={styles.listBullet} />
                <Text style={styles.listText}>{skill}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Good to Have / Responsibilities */}
        {jobData.responsibilities && jobData.responsibilities.length > 0 && (
          <View style={styles.listContainer}>
            <Text style={styles.sectionTitle}>Good to Have</Text>
            <Text style={styles.descriptionText}>
              {jobData.responsibilities.join(', ')}
            </Text>
          </View>
        )}

        {/* Company Details Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About the Company</Text>
          <View style={styles.recruiterCard}>
            <View style={styles.avatarContainer}>
              {jobData.company?.logoUrl ? (
                <Image source={{ uri: jobData.company.logoUrl }} style={{ width: 48, height: 48, borderRadius: 24 }} />
              ) : (
                <Text style={[styles.avatarLetter, { color: colors.foreground }]}>{companyLetter}</Text>
              )}
            </View>
            <View style={styles.recruiterInfo}>
              <Text style={styles.recruiterName}>{jobData.company?.name || 'Talentra Partner'}</Text>
              <Text style={styles.recruiterRole}>{jobData.company?.headquarters || 'Global Headquarters'}</Text>
            </View>
          </View>
        </View>

        {/* Applicants List Link for Recruiters */}
        {!isCandidate && (
          <View style={[styles.section, { paddingBottom: 40 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text style={styles.sectionTitle}>Applicants ({jobData.applicantsCount || 0})</Text>
            </View>
            <TouchableOpacity 
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: colors.card,
                padding: 16,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border
              }}
              activeOpacity={0.7}
              onPress={() => navigation.navigate(ROUTES.JOB_APPLICANTS_LIST, { jobId })}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: isDark ? '#1e1b4b' : '#EEF2FF', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: colors.foreground, fontFamily: 'Space Grotesk' }}>Review Candidates</Text>
                  <Text style={{ fontSize: 13, color: colors.mutedForeground, fontFamily: 'Inter', marginTop: 2 }}>Check profiles and resumes</Text>
                </View>
              </View>
              <ChevronRight size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Action Footer for Candidates */}
      {isCandidate && (
        <View style={styles.bottomBar}>
          {hasAppliedLocal ? (
            (() => {
              let label = 'Applied Successfully';
              let bg = isDark ? '#064e3b' : '#F0FDF4';
              let color = isDark ? '#34d399' : '#16A34A';
              if (appStatusLocal === 'reviewing') {
                label = 'Application In Review';
                bg = isDark ? '#082f49' : '#E0F2FE';
                color = isDark ? '#7dd3fc' : '#0369A1';
              } else if (appStatusLocal === 'interviewing') {
                label = 'Invited to Interview';
                bg = isDark ? '#422006' : '#FEF9C3';
                color = isDark ? '#fef08a' : '#CA8A04';
              } else if (appStatusLocal === 'accepted') {
                label = 'Selected / Hired!';
                bg = isDark ? '#064e3b' : '#DCFCE7';
                color = isDark ? '#34d399' : '#16A34A';
              } else if (appStatusLocal === 'rejected') {
                label = 'Application Closed';
                bg = isDark ? '#2a0808' : '#FEE2E2';
                color = isDark ? '#fda4af' : '#DC2626';
              }
              return (
                <View style={[styles.applyButton, { backgroundColor: bg, flexDirection: 'row', gap: 8, borderColor: color, borderWidth: 0.5 }]}>
                  <CheckCircle2 color={color} size={20} />
                  <Text style={[styles.applyButtonText, { color: color }]}>{label}</Text>
                </View>
              );
            })()
          ) : isUploading ? (
            <View style={[styles.applyButton, { flexDirection: 'row', gap: 8 }]}>
              <ActivityIndicator color={colors.primaryForeground} />
              <Text style={styles.applyButtonText}>Uploading Resume...</Text>
            </View>
          ) : (jobData?.status === 'closed' || (jobData?.filledPositions >= jobData?.totalPositions)) ? (
            <View style={[styles.applyButton, { backgroundColor: isDark ? colors.border : '#F3F4F6', borderWidth: 1, borderColor: isDark ? colors.border : '#E5E7EB' }]}>
              <Text style={[styles.applyButtonText, { color: isDark ? colors.mutedForeground : '#9CA3AF' }]}>Position Closed</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.applyButton} onPress={handleApply} activeOpacity={0.8}>
              <Text style={styles.applyButtonText}>Apply Now</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.bookmarkButtonOutline, jobData.isBookmarked && { borderColor: '#F59E0B' }]}
            onPress={handleBookmark}
            activeOpacity={0.7}
          >
            <Bookmark
              color={jobData.isBookmarked ? '#F59E0B' : colors.mutedForeground}
              fill={jobData.isBookmarked ? '#F59E0B' : 'transparent'}
              size={24}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Custom Complete Profile Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={completeProfileVisible}
        onRequestClose={() => setCompleteProfileVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => setCompleteProfileVisible(false)}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
          <View style={styles.modalCenterContainer}>
            <View style={styles.alertIconContainer}>
              <AlertCircle size={40} color={colors.error} />
            </View>
            <Text style={styles.modalTitleText}>Profile Incomplete</Text>
            <Text style={styles.modalBodyText}>
              You need to complete your profile before you can apply for jobs.
            </Text>
            <TouchableOpacity
              style={[styles.modalButton, styles.primaryModalButton]}
              onPress={() => {
                setCompleteProfileVisible(false);
                navigation.navigate(ROUTES.CANDIDATE_COMPLETE_PROFILE as any);
              }}
            >
              <Text style={styles.primaryModalButtonText}>Complete Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.secondaryModalButton]}
              onPress={() => setCompleteProfileVisible(false)}
            >
              <Text style={styles.secondaryModalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Custom Apply Resume Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={applyResumeVisible}
        onRequestClose={() => setApplyResumeVisible(false)}
      >
        <View style={styles.bottomSheetOverlay}>
          <TouchableWithoutFeedback onPress={() => setApplyResumeVisible(false)}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
          <View style={styles.bottomSheetContainer}>
            <View style={{ width: 40, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: 16 }} />
            <View style={styles.bottomSheetHeader}>
              <Text style={styles.bottomSheetTitle}>Apply for Job</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setApplyResumeVisible(false)}>
                <X size={20} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 450 }}>
              <Text style={styles.bottomSheetDesc}>
                You're applying for <Text style={{ fontWeight: '700', color: colors.foreground }}>{jobData?.title}</Text> at <Text style={{ fontWeight: '700', color: colors.foreground }}>{jobData?.company?.name}</Text>.
              </Text>

              {/* Cover Letter Input */}
              <View style={{ marginBottom: 18 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.foreground, marginBottom: 8, fontFamily: 'Space Grotesk' }}>Cover Letter</Text>
                <TextInput
                  style={styles.coverLetterInput}
                  placeholder="Explain why you are a good fit for this role... (minimum 10 words)"
                  placeholderTextColor={colors.mutedForeground}
                  value={coverLetter}
                  onChangeText={setCoverLetter}
                  multiline={true}
                  numberOfLines={4}
                  textAlignVertical="top"
                />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                  <Text style={{ fontSize: 12, color: getWordCount(coverLetter) >= 10 ? '#10B981' : colors.error, fontWeight: '600', fontFamily: 'Inter' }}>
                    {getWordCount(coverLetter) >= 10 ? 'Cover letter ready' : 'Minimum 10 words required'}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter' }}>
                    {getWordCount(coverLetter)} words
                  </Text>
                </View>
              </View>

              {/* Resume Selection */}
              <Text style={{ fontSize: 14, fontWeight: '700', color: colors.foreground, marginBottom: 8, fontFamily: 'Space Grotesk' }}>Resume Document</Text>
              
              {user?.resumeUrl ? (
                <View style={{ gap: 8, marginBottom: 24 }}>
                  <TouchableOpacity
                    style={[styles.resumeSelectRow, selectedResumeType === 'saved' && styles.resumeSelectRowActive]}
                    onPress={() => setSelectedResumeType('saved')}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.radioButton, selectedResumeType === 'saved' && styles.radioButtonActive]}>
                      {selectedResumeType === 'saved' && <View style={styles.radioButtonInner} />}
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.resumeSelectTitle, selectedResumeType === 'saved' && styles.resumeSelectTitleActive]}>Use Saved Resume</Text>
                      <Text style={styles.resumeSelectSubtitle}>{user?.resumeName || 'resume.pdf'}</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.resumeSelectRow, selectedResumeType === 'new' && styles.resumeSelectRowActive]}
                    onPress={handlePickResume}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.radioButton, selectedResumeType === 'new' && styles.radioButtonActive]}>
                      {selectedResumeType === 'new' && <View style={styles.radioButtonInner} />}
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.resumeSelectTitle, selectedResumeType === 'new' && styles.resumeSelectTitleActive]}>
                        {pickedResumeFile ? 'New Resume Selected' : 'Upload New Resume'}
                      </Text>
                      <Text style={styles.resumeSelectSubtitle}>
                        {pickedResumeFile ? pickedResumeFile.name : 'PDF, DOCX formats accepted'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ marginBottom: 24 }}>
                  <TouchableOpacity
                    style={[styles.resumeSelectRow, selectedResumeType === 'new' && styles.resumeSelectRowActive]}
                    onPress={handlePickResume}
                    activeOpacity={0.7}
                  >
                    <View style={styles.actionIconWrapper}>
                      <Upload size={20} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.resumeSelectTitle, selectedResumeType === 'new' && styles.resumeSelectTitleActive]}>
                        {pickedResumeFile ? 'Resume Uploaded' : 'Upload Resume File'}
                      </Text>
                      <Text style={styles.resumeSelectSubtitle}>
                        {pickedResumeFile ? pickedResumeFile.name : 'PDF, DOCX formats accepted'}
                      </Text>
                    </View>
                    <ChevronRight size={16} color={colors.mutedForeground} />
                  </TouchableOpacity>
                </View>
              )}

              {/* Action Buttons */}
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.primaryModalButton,
                  (getWordCount(coverLetter) < 10 || !selectedResumeType || (selectedResumeType === 'new' && !pickedResumeFile)) && { opacity: 0.5 }
                ]}
                onPress={submitApplication}
                disabled={getWordCount(coverLetter) < 10 || !selectedResumeType || (selectedResumeType === 'new' && !pickedResumeFile)}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryModalButtonText}>Submit Application</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.secondaryModalButton, { marginBottom: 12 }]}
                onPress={() => setApplyResumeVisible(false)}
              >
                <Text style={styles.secondaryModalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default JobDetailScreen;
