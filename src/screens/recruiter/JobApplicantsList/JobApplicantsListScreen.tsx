import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StatusBar, ActivityIndicator, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { ChevronLeft, ChevronRight, UserCircle2 } from 'lucide-react-native';
import { ROUTES } from '../../../constants/screens';
import { apiClient } from '../../../services/apiClient';
import { getStyles } from './JobApplicantsListScreen.styles';
import { useTheme } from '../../../hooks/useTheme';

export const JobApplicantsListScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { jobId } = route.params;
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [jobMeta, setJobMeta] = useState<any>(null);

  const fetchApplicants = useCallback(async (pageNum = 1) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const response = await apiClient.get(`/recruiter/jobs/${jobId}/applicants`, { params: { page: pageNum, limit: 15 } });
      const newApplicants = response.data.data || [];
      const pagination = response.data.pagination || { totalPages: 1 };
      if (response.data.job) {
        setJobMeta(response.data.job);
      }

      if (pageNum === 1) {
        setApplicants(newApplicants);
      } else {
        setApplicants(prev => [...prev, ...newApplicants]);
      }
      setPage(pageNum);
      setTotalPages(pagination.totalPages);
    } catch (err) {
      console.warn('Failed to load applicants:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [jobId]);

  useFocusEffect(
    useCallback(() => {
      fetchApplicants(1);
    }, [fetchApplicants])
  );

  const handleLoadMore = () => {
    if (!loadingMore && !loading && !refreshing && page < totalPages) {
      fetchApplicants(page + 1);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchApplicants(1);
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: any }) => {
    const candidate = item.candidate || {};
    let badgeColor = isDark ? '#1e293b' : '#F1F5F9';
    let textColor = isDark ? '#94a3b8' : '#64748B';
    let statusLabel = item.status || 'applied';

    if (item.status === 'accepted') {
      badgeColor = isDark ? '#064e3b' : '#DCFCE7';
      textColor = isDark ? '#34d399' : '#16A34A';
      statusLabel = 'Approved';
    } else if (item.status === 'rejected') {
      badgeColor = isDark ? '#4c0519' : '#FEE2E2';
      textColor = isDark ? '#fda4af' : '#DC2626';
      statusLabel = 'Rejected';
    } else if (item.status === 'interviewing') {
      badgeColor = isDark ? '#422006' : '#FEF9C3';
      textColor = isDark ? '#fef08a' : '#CA8A04';
      statusLabel = 'Interviewing';
    } else if (item.status === 'reviewing') {
      badgeColor = isDark ? '#082f49' : '#E0F2FE';
      textColor = isDark ? '#7dd3fc' : '#0369A1';
      statusLabel = 'Under Review';
    } else if (item.status === 'applied') {
      badgeColor = isDark ? '#1e1b4b' : '#EEF2FF';
      textColor = isDark ? '#a5b4fc' : '#4338CA';
      statusLabel = 'Applied';
    }

    return (
      <TouchableOpacity 
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => navigation.navigate(ROUTES.APPLICANT_REVIEW, { applicationId: item.applicationId, applicant: item })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.avatarContainer}>
            {candidate.avatarUrl ? (
              <Image source={{ uri: candidate.avatarUrl }} style={styles.avatar} />
            ) : (
              <Text style={styles.avatarText}>{candidate.name?.charAt(0).toUpperCase() || 'U'}</Text>
            )}
          </View>
          <View style={styles.applicantInfo}>
            <Text style={styles.applicantName}>{candidate.name || 'Unknown Candidate'}</Text>
            <Text style={styles.applicantEmail}>{candidate.email}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={[styles.statusBadge, { backgroundColor: badgeColor }]}>
            <Text style={[styles.statusText, { color: textColor }]}>
              {statusLabel}
            </Text>
          </View>
          <View style={styles.viewProfileButton}>
            <Text style={styles.viewProfileText}>View Application</Text>
            <ChevronRight size={16} color={colors.primary} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <UserCircle2 size={48} color={colors.mutedForeground} />
        <Text style={styles.emptyTitle}>No Applicants Yet</Text>
        <Text style={styles.emptySub}>When candidates apply for this job, they will appear here.</Text>
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
        <Text style={styles.headerTitle}>All Applicants</Text>
        <View style={styles.placeholder} />
      </View>

      {jobMeta && (
        <View style={styles.jobMetaBanner}>
          <View style={styles.jobMetaInfo}>
            <Text style={styles.jobMetaTitle} numberOfLines={1}>{jobMeta.title}</Text>
            <Text style={styles.jobMetaPositions}>
              Positions: <Text style={{ fontWeight: '700', color: colors.foreground }}>{jobMeta.filledPositions}</Text> / {jobMeta.totalPositions} filled
            </Text>
          </View>
          
          <View style={[
            styles.jobStatusBadge,
            { backgroundColor: jobMeta.status === 'closed' ? (isDark ? '#4c0519' : '#FEE2E2') : (isDark ? '#064e3b' : '#DCFCE7') }
          ]}>
            <Text style={[
              styles.jobStatusText,
              { color: jobMeta.status === 'closed' ? (isDark ? '#fda4af' : '#DC2626') : (isDark ? '#34d399' : '#16A34A') }
            ]}>
              {jobMeta.status === 'closed' ? 'Inactive' : 'Active'}
            </Text>
          </View>
        </View>
      )}

      {loading && page === 1 ? (
        <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={applicants}
          keyExtractor={(item, index) => item.applicationId || String(index)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListFooterComponent={loadingMore ? <ActivityIndicator color={colors.primary} style={{ padding: 20 }} /> : null}
        />
      )}
    </SafeAreaView>
  );
};

export default JobApplicantsListScreen;
