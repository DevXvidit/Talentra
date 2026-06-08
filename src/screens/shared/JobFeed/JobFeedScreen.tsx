import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Image,
  Modal,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, SlidersHorizontal, MapPin, Briefcase, ChevronRight, Bookmark, BookmarkPlus, X, IndianRupee, User } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { JOB_CATEGORIES } from '../../../constants/jobs';
import { ROUTES } from '../../../constants/screens';
import { jobService } from '../../../services/jobService';
import { useAuthStore } from '../../../store/useAuthStore';
import { Job, RootStackParamList } from '../../../types';
import { getStyles } from './JobFeedScreen.styles';
import { useTheme } from '../../../hooks/useTheme';
import JobFeedLoading, { JobCardSkeleton } from './components/JobFeedLoading';
import JobFeedError from './components/JobFeedError';

const JOB_TYPE_FILTERS = ['All', 'Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'];

const timeAgo = (dateStr: string) => {
  try {
    const created = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    return `${diffDays} days ago`;
  } catch {
    return 'Recently';
  }
};

export const JobFeedScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuthStore();
  const isRecruiter = user?.role === 'recruiter';
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const completionPercentage = useMemo(() => {
    if (!user) return 0;
    let filled = 0;
    const total = 5;
    if (user.name) filled++;
    if (user.phone) filled++;
    if (user.location) filled++;
    if (user.experience !== undefined && user.experience !== null) filled++;
    if (user.resumeUrl) filled++;
    return Math.round((filled / total) * 100);
  }, [user]);

  const showCompletionBanner = !user?.isProfileComplete && completionPercentage < 100;

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [tempCategory, setTempCategory] = useState<string | null>(null);
  const [tempType, setTempType] = useState('All');

  const skeletonAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    let animationLoop: Animated.CompositeAnimation | null = null;

    if (searching) {
      animationLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(skeletonAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(skeletonAnim, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      animationLoop.start();
    } else {
      skeletonAnim.setValue(0.3);
    }

    return () => {
      if (animationLoop) {
        animationLoop.stop();
      }
    };
  }, [searching, skeletonAnim]);

  const filtersRef = useRef({
    search: '',
    selectedCategory: null as string | null,
    selectedType: 'All',
  });

  useEffect(() => {
    filtersRef.current = { search, selectedCategory, selectedType };
  }, [search, selectedCategory, selectedType]);

  const openFilterModal = () => {
    setTempCategory(selectedCategory);
    setTempType(selectedType);
    setFilterModalVisible(true);
  };

  const handleApplyFilters = () => {
    setSelectedCategory(tempCategory);
    setSelectedType(tempType);
    setFilterModalVisible(false);
  };

  const handleResetFilters = () => {
    setTempCategory(null);
    setTempType('All');
    setSelectedCategory(null);
    setSelectedType('All');
    setFilterModalVisible(false);
  };

  const clearSearch = () => {
    setSearch('');
  };

  const fetchJobs = useCallback(async (pageNum = 1, isRefresh = false, isFullLoad = false, isSearching = false) => {
    if (isRefresh) setRefreshing(true);
    else if (pageNum === 1 && isFullLoad) {
      setLoading(true);
      setError(null);
    } else if (pageNum === 1 && isSearching) {
      setSearching(true);
    } else if (pageNum > 1) {
      setLoadingMore(true);
    }

    const { search: s, selectedCategory: selCat, selectedType: selType } = filtersRef.current;

    const combined = s.trim();

    try {
      const limit = isRecruiter ? 50 : 10;
      const params: Record<string, any> = { page: pageNum, limit };

      if (combined) params.search = combined;
      if (selCat) params.category = selCat;
      if (selType !== 'All') params.type = selType;

      const response = await jobService.fetchJobs(params);

      if (pageNum === 1) {
        setJobs(response.jobs);
      } else {
        setJobs(prev => [...prev, ...response.jobs]);
      }
      setPage(pageNum);
      setTotalPages(response.pagination.totalPages);
    } catch (err: any) {
      console.warn('Failed to fetch jobs:', err);
      if (pageNum === 1) {
        setError(err.response?.data?.message || err.message || 'Failed to load jobs.');
      }
    } finally {
      setLoading(false);
      setSearching(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [isRecruiter]);

  const isFirstLoad = useRef(true);

  useFocusEffect(
    useCallback(() => {
      if (isFirstLoad.current) {
        isFirstLoad.current = false;
        fetchJobs(1, false, true, false);
      } else {
        const { search: s, selectedCategory: cat, selectedType: type } = filtersRef.current;
        const hasActiveFilters = !!(s.trim() || cat || type !== 'All');
        if (!hasActiveFilters) fetchJobs(1, false, false, false);
      }
    }, [fetchJobs])
  );

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      filtersRef.current = { ...filtersRef.current, search };
      fetchJobs(1, false, false, true);
    }, 600);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };

  }, [search]);

  useEffect(() => {
    filtersRef.current = { ...filtersRef.current, selectedCategory, selectedType };
    fetchJobs(1, false, false, true);

  }, [selectedCategory, selectedType]);

  const handleRefresh = () => fetchJobs(1, true);

  const handleLoadMore = () => {
    if (!isRecruiter && !loadingMore && !loading && page < totalPages) {
      fetchJobs(page + 1);
    }
  };

  const handleJobPress = (jobId: string) => {
    navigation.navigate(ROUTES.JOB_DETAIL, { jobId });
  };

  const handleToggleBookmark = async (jobId: string) => {
    try {
      const result = await jobService.toggleBookmark(jobId);
      setJobs(prev => prev.map(job => job.id === jobId ? { ...job, isBookmarked: result.isBookmarked } : job));
    } catch (err) {
      console.warn('Failed to toggle bookmark:', err);
    }
  };

  const displayedJobs = useMemo(() => {
    if (!isRecruiter) return jobs;
    return jobs.filter((job) => job.company?.id === user?.companyId);
  }, [jobs, isRecruiter, user?.companyId]);

  const hasActiveSearch = search.trim().length > 0;

  const renderJobCard = ({ item }: { item: Job }) => (
    <TouchableOpacity
      style={styles.jobCard}
      activeOpacity={0.75}
      onPress={() => handleJobPress(item.id)}
    >
      <View style={styles.jobCardInner}>

        <View style={styles.jobLogo}>
          {item.company?.logoUrl ? (
            <Image source={{ uri: item.company.logoUrl }} style={{ width: 48, height: 48, borderRadius: 12 }} />
          ) : (
            <Text style={styles.jobLogoText}>
              {item.company?.name ? item.company.name.charAt(0).toUpperCase() : item.title.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>

        <View style={styles.jobHeaderInfo}>
          <Text style={styles.jobTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.jobCompany} numberOfLines={1}>{item.company?.name || 'Talentra Partner'}</Text>
        </View>

        {!isRecruiter && (
          <TouchableOpacity style={{ padding: 4, marginRight: 8 }} onPress={() => handleToggleBookmark(item.id)}>
            {item.isBookmarked ? (
              <Bookmark color={colors.primary} fill={colors.primary} size={20} />
            ) : (
              <BookmarkPlus color={colors.mutedForeground} size={20} />
            )}
          </TouchableOpacity>
        )}

        {isRecruiter ? (
          <View style={styles.viewButton}>
            <Text style={styles.viewButtonText}>View</Text>
          </View>
        ) : item.hasApplied ? (
          (() => {
            let label = 'Applied';
            let bg = isDark ? '#1e1b4b' : '#EEF2FF';
            let color = isDark ? '#a5b4fc' : '#4338CA';
            if (item.applicationStatus === 'reviewing') {
              label = 'In Review'; bg = isDark ? '#082f49' : '#E0F2FE'; color = isDark ? '#7dd3fc' : '#0369A1';
            } else if (item.applicationStatus === 'interviewing') {
              label = 'Interview'; bg = isDark ? '#422006' : '#FEF9C3'; color = isDark ? '#fef08a' : '#CA8A04';
            } else if (item.applicationStatus === 'accepted') {
              label = 'Selected'; bg = isDark ? '#064e3b' : '#DCFCE7'; color = isDark ? '#34d399' : '#16A34A';
            } else if (item.applicationStatus === 'rejected') {
              label = 'Closed'; bg = isDark ? '#2a0808' : '#FEF2F2'; color = isDark ? '#fda4af' : '#DC2626';
            }
            return (
              <View style={[styles.applyButton, { backgroundColor: bg, paddingHorizontal: 12 }]}>
                <Text style={[styles.applyButtonText, { color }]}>{label}</Text>
              </View>
            );
          })()
        ) : (
          <TouchableOpacity style={styles.applyButton} activeOpacity={0.8} onPress={() => handleJobPress(item.id)}>
            <Text style={styles.applyButtonText}>Apply</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={{ fontSize: 13, color: colors.mutedForeground, fontFamily: 'Inter', marginTop: 8, marginBottom: 8, lineHeight: 18 }} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#0c4a6e' : '#F0F9FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
            <IndianRupee size={12} color={colors.primary} style={{ marginRight: 2 }} />
            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>{item.salary}</Text>
          </View>
          <View style={{ backgroundColor: colors.secondary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '500' }}>{item.category}</Text>
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
                {item.totalPositions} {item.totalPositions > 1 ? 'positions' : 'position'}
              </Text>
            </View>
          ) : null}
        </View>
        <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>{timeAgo(item.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Briefcase size={48} color={colors.mutedForeground} />
        <Text style={styles.emptyTitle}>No jobs found</Text>
        <Text style={styles.emptySubtitle}>
          {hasActiveSearch ? 'Try different keywords or clear your search' : isRecruiter
            ? "You haven't posted any jobs matching these criteria."
            : 'Try adjusting your search or filters'}
        </Text>
        {hasActiveSearch && (
          <TouchableOpacity onPress={clearSearch} style={{ marginTop: 12, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: colors.primary, borderRadius: 10 }}>
            <Text style={{ color: colors.primaryForeground, fontWeight: '600', fontSize: 14 }}>Clear Search</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const onViewSaved = !isRecruiter ? () => {
    navigation.navigate(ROUTES.CANDIDATE_ROOT as any, { screen: ROUTES.CANDIDATE_SAVED_JOBS } as any);
  } : undefined;

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <JobFeedLoading />
      </SafeAreaView>
    );
  }

  if (error) {
    return <JobFeedError message={error} onRetry={() => fetchJobs(1)} onViewSaved={onViewSaved} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'there'} 👋</Text>
          <Text style={styles.headerSubtitle}>
            {isRecruiter ? 'Manage your job postings' : 'Find your dream job today'}
          </Text>
        </View>
        <View style={styles.headerActions}>
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
        </View>
      </View>

      <View>

        {!isRecruiter && showCompletionBanner && (
          <TouchableOpacity
            style={styles.completionBanner}
            activeOpacity={0.8}
            onPress={() => navigation.navigate(ROUTES.CANDIDATE_COMPLETE_PROFILE as any)}
          >
            <View style={styles.completionBannerHeader}>
              <Text style={styles.completionBannerTitle}>Complete Your Profile ({completionPercentage}%)</Text>
              <ChevronRight size={16} color={colors.primary} />
            </View>
            <Text style={styles.completionBannerText}>
              You must complete your profile (upload resume, phone, location) to apply for jobs.
            </Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${completionPercentage}%` }]} />
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Search size={18} color={colors.mutedForeground} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Job Roles"
              placeholderTextColor={colors.mutedForeground}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
              onSubmitEditing={() => {

                filtersRef.current = { ...filtersRef.current, search };
                fetchJobs(1);
              }}
            />
            {hasActiveSearch && (
              <TouchableOpacity onPress={clearSearch} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <X size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[styles.filterButton, (selectedCategory || selectedType !== 'All') && styles.filterButtonActive]}
            onPress={openFilterModal}
            activeOpacity={0.7}
          >
            <SlidersHorizontal size={20} color={(selectedCategory || selectedType !== 'All') ? colors.primaryForeground : colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {isRecruiter ? 'My Posted Jobs' : hasActiveSearch ? 'Search Results' : 'Recent Jobs'}
          </Text>
        </View>
      </View>

      <FlatList
        data={searching ? ([1, 2, 3] as any[]) : (displayedJobs as any[])}
        keyExtractor={(item, index) => (searching ? `skeleton_${index}` : (item as Job).id || String(index))}
        renderItem={searching
          ? () => <JobCardSkeleton animatedValue={skeletonAnim} colors={colors} style={styles.jobCard} />
          : (renderJobCard as any)
        }
        ListEmptyComponent={searching ? null : renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loadingMore ? <ActivityIndicator color={colors.primary} style={{ padding: 20 }} /> : null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => setFilterModalVisible(false)}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Jobs</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setFilterModalVisible(false)}>
                <X size={20} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Category</Text>
              <View style={styles.modalChipsRow}>
                <TouchableOpacity
                  style={[styles.modalChip, tempCategory === null && styles.modalChipActive]}
                  onPress={() => setTempCategory(null)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.modalChipText, tempCategory === null && styles.modalChipTextActive]}>All Categories</Text>
                </TouchableOpacity>
                {JOB_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.modalChip, tempCategory === cat && styles.modalChipActive]}
                    onPress={() => setTempCategory(cat)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.modalChipText, tempCategory === cat && styles.modalChipTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Job Type</Text>
              <View style={styles.modalChipsRow}>
                {JOB_TYPE_FILTERS.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.modalChip, tempType === type && styles.modalChipActive]}
                    onPress={() => setTempType(type)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.modalChipText, tempType === type && styles.modalChipTextActive]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.resetButton} onPress={handleResetFilters} activeOpacity={0.7}>
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterApplyButton} onPress={handleApplyFilters} activeOpacity={0.7}>
                <Text style={styles.filterApplyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default JobFeedScreen;
