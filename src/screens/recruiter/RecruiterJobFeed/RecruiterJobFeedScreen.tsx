import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Briefcase, MapPin, ChevronRight, IndianRupee, User } from 'lucide-react-native';
import { ROUTES } from '../../../constants/screens';
import { apiClient } from '../../../services/apiClient';
import { useAuthStore } from '../../../store/useAuthStore';
import { Company } from '../../../types';
import { getStyles } from './RecruiterJobFeedScreen.styles';
import { useTheme } from '../../../hooks/useTheme';

const timeAgo = (dateStr: string) => {
  try {
    const created = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    return `${diffDays} days ago`;
  } catch (e) {
    return 'Recently';
  }
};

export const RecruiterJobFeedScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const completionPercentage = user?.profileCompletionPercentage ?? 0;
  const showCompletionBanner = !user?.isProfileComplete && completionPercentage < 100;

  const [jobs, setJobs] = useState<any[]>([]);
  const [stats, setStats] = useState({
    activeJobsCount: 0,
    totalJobsCount: 0,
    totalFilledPositions: 0,
    totalPositions: 0,
    totalApplicants: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchJobs = useCallback(async (pageNum = 1, isRefresh = false, isSilent = false) => {
    if (isRefresh) setRefreshing(true);
    else if (pageNum === 1 && !isSilent) {
      setLoading(true);
      setError(null);
    } else if (pageNum > 1) {
      setLoadingMore(true);
    }

    try {
      const response = await apiClient.get('/recruiter/jobs', { params: { page: pageNum, limit: 10 } });
      const fetchedJobs = response.data.data || [];
      const fetchedPagination = response.data.pagination || { totalPages: 1 };
      const fetchedStats = response.data.stats || {
        activeJobsCount: 0,
        totalJobsCount: 0,
        totalFilledPositions: 0,
        totalPositions: 0,
        totalApplicants: 0,
      };

      if (pageNum === 1) {
        setJobs(fetchedJobs);
      } else {
        setJobs(prev => [...prev, ...fetchedJobs]);
      }
      setStats(fetchedStats);
      setPage(pageNum);
      setTotalPages(fetchedPagination.totalPages);
    } catch (err: any) {
      console.warn('Failed to fetch recruiter jobs:', err);
      if (pageNum === 1) {
        setError(err.response?.data?.message || err.message || 'Failed to load your job posts.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchJobs(1, false, true); 
    }, [fetchJobs])
  );

  const handleRefresh = () => fetchJobs(1, true);

  const handleLoadMore = () => {
    if (!loadingMore && !loading && page < totalPages) {
      fetchJobs(page + 1);
    }
  };

  const renderJobCard = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.jobCard}
      activeOpacity={0.7}
      onPress={() => navigation.navigate(ROUTES.JOB_DETAIL, { jobId: item.id })}
    >
      <View style={styles.jobCardHeader}>
        <View style={styles.logoContainer}>
          {item.company?.logoUrl ? (
            <Image source={{ uri: item.company.logoUrl }} style={styles.logoImage} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoPlaceholderText}>
                {item.company?.name ? item.company.name.charAt(0).toUpperCase() : item.title?.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.jobHeaderInfo}>
          <Text style={styles.jobTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.companyName} numberOfLines={1}>
            {item.company?.name || 
              (user?.companyId && typeof user.companyId === 'object' ? (user.companyId as Company).name : null) || 
              'Your Company'}
          </Text>
        </View>
        <View style={{
          backgroundColor: isDark 
            ? (item.status === 'active' ? '#064e3b' : '#1e293b') 
            : (item.status === 'active' ? '#F0FDF4' : '#F3F4F6'), 
          paddingHorizontal: 8, 
          paddingVertical: 4, 
          borderRadius: 6 
        }}>
           <Text style={{ 
             color: isDark 
               ? (item.status === 'active' ? '#34d399' : '#94a3b8') 
               : (item.status === 'active' ? '#16A34A' : '#6B7280'), 
             fontSize: 10, 
             fontWeight: '700', 
             textTransform: 'uppercase' 
           }}>{item.status || 'ACTIVE'}</Text>
        </View>
      </View>

      <Text style={styles.jobDescription} numberOfLines={2}>{item.description}</Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            backgroundColor: isDark ? '#0c4a6e' : '#F0F9FF', 
            paddingHorizontal: 8, 
            paddingVertical: 4, 
            borderRadius: 6 
          }}>
            <IndianRupee size={12} color={colors.primary} style={{ marginRight: 2 }} />
            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>{item.salary}</Text>
          </View>
          <View style={{ backgroundColor: colors.secondary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
            <Text style={{ color: colors.secondaryForeground, fontSize: 12, fontWeight: '500' }}>{item.category || 'Engineering'}</Text>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MapPin size={12} color={colors.mutedForeground} style={{ marginRight: 4 }} />
            <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>{item.location}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Briefcase size={12} color={colors.mutedForeground} style={{ marginRight: 4 }} />
            <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>{item.type}</Text>
          </View>
          {item.totalPositions ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <User size={12} color={colors.mutedForeground} style={{ marginRight: 4 }} />
              <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>
                {item.filledPositions || 0}/{item.totalPositions} hired
              </Text>
            </View>
          ) : null}
        </View>
        <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>{timeAgo(item.createdAt)}</Text>
      </View>

      <View style={styles.applicantBadgeRow}>
        <View style={[
          styles.applicantBadge,
          item.applicantCount > 0 ? styles.applicantBadgeActive : styles.applicantBadgeEmpty
        ]}>
          <Text style={[
            styles.applicantBadgeText,
            item.applicantCount > 0 ? styles.applicantBadgeTextActive : null
          ]}>
            {item.applicantCount === 0
              ? 'No applicants yet'
              : `${item.applicantCount} Candidate Application${item.applicantCount > 1 ? 's' : ''}`
            }
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View>

      {showCompletionBanner && (
        <TouchableOpacity
          style={styles.completionBanner}
          activeOpacity={0.8}
          onPress={() => navigation.navigate(ROUTES.RECRUITER_COMPLETE_PROFILE)}
        >
          <View style={styles.completionBannerHeader}>
            <Text style={styles.completionBannerTitle}>Complete Onboarding ({completionPercentage}%)</Text>
            <ChevronRight size={16} color={colors.primary} />
          </View>
          <Text style={styles.completionBannerText}>
            Please fill in your recruiter title, bio, and register your company details to enable job posting.
          </Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${completionPercentage}%` }]} />
          </View>
        </TouchableOpacity>
      )}

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Hiring Overview</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{stats.activeJobsCount}</Text>
            <Text style={styles.summaryLabel}>Active Jobs</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{stats.totalApplicants}</Text>
            <Text style={styles.summaryLabel}>Applicants</Text>
          </View>
        </View>
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>Your Job Postings</Text>
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Briefcase size={48} color={colors.mutedForeground} style={{ marginBottom: 12 }} />
        <Text style={styles.emptyTitle}>No jobs posted yet</Text>
        <Text style={styles.emptySubtitle}>
          Create your first job listing to start receiving candidate applications.
        </Text>
        <TouchableOpacity
          style={styles.postJobButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate(ROUTES.RECRUITER_POST_JOB)}
        >
          <Text style={styles.postJobButtonText}>Post a Job</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'there'}</Text>
          <Text style={styles.headerSubtitle}>Manage postings and hire candidates</Text>
        </View>
        <TouchableOpacity
          style={styles.headerActions}
          activeOpacity={0.7}
          onPress={() => navigation.navigate(ROUTES.RECRUITER_PROFILE)}
        >
          <View style={styles.avatarContainer}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchJobs()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
        data={jobs}
        keyExtractor={(item, index) => item.id || String(index)}
        renderItem={renderJobCard}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loadingMore ? <ActivityIndicator color={colors.primary} style={{ padding: 20 }} /> : <View style={{ height: 20 }} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default RecruiterJobFeedScreen;
