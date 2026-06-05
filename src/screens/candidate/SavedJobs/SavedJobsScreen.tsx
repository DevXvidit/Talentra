import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  StatusBar,
  Image,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bookmark, MapPin, Briefcase, BookmarkX, Search, ChevronLeft, IndianRupee } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ROUTES } from '../../../constants/screens';
import { apiClient } from '../../../services/apiClient';
import { Job, RootStackParamList } from '../../../types';
import { getStyles } from './SavedJobsScreen.styles';
import { useTheme } from '../../../hooks/useTheme';
import SavedJobsLoading from './components/SavedJobsLoading';
import SavedJobsError from './components/SavedJobsError';
import { JobCardSkeleton } from '../../shared/JobFeed/components/JobFeedLoading';

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

export const SavedJobsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);      // first load
  const [searching, setSearching] = useState(false);  // search/filter re-fetch
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const isFirstLoad = React.useRef(true);

  // Pulse animation value for searching skeleton list
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

  const fetchSavedJobs = useCallback(async (pageNum = 1, isRefresh = false, isFullLoad = false, isSearching = false) => {
    if (isRefresh) setRefreshing(true);
    else if (pageNum === 1 && isFullLoad) {
      setLoading(true);
      setError(null);
    } else if (pageNum === 1 && isSearching) {
      setSearching(true);
    } else if (pageNum > 1) {
      setLoadingMore(true);
    }

    try {
      const params: any = { page: pageNum, limit: 10 };
      if (search.trim()) params.search = search.trim();

      const response = await apiClient.get('/jobs/bookmarks', { params });
      const jobs = response.data.data || [];
      const pagination = response.data.pagination || { totalPages: 1 };
      
      if (pageNum === 1) {
        setSavedJobs(jobs);
      } else {
        setSavedJobs(prev => [...prev, ...jobs]);
      }
      setPage(pageNum);
      setTotalPages(pagination.totalPages);
    } catch (err: any) {
      if (err.response?.status === 401) return;
      console.warn('Failed to fetch saved jobs:', err);
      if (pageNum === 1) {
        setError(err.response?.data?.message || err.message || 'Failed to sync saved jobs.');
      }
    } finally {
      setLoading(false);
      setSearching(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [search]);

  // Sync bookmarks on first focus only; subsequent focuses are silent
  useFocusEffect(
    useCallback(() => {
      if (isFirstLoad.current) {
        isFirstLoad.current = false;
        fetchSavedJobs(1, false, true, false); // full skeleton on first load
      } else {
        if (!search.trim()) fetchSavedJobs(1, false, false, false); // silent refresh
      }
    }, [fetchSavedJobs, search])
  );

  // Re-fetch when search changes — show skeleton
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSavedJobs(1, false, false, true); // show skeleton
    }, 500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleRefresh = () => fetchSavedJobs(1, true);

  const handleLoadMore = () => {
    if (!loadingMore && !loading && page < totalPages) {
      fetchSavedJobs(page + 1);
    }
  };

  const handleJobPress = (jobId: string) => {
    navigation.navigate(ROUTES.JOB_DETAIL, { jobId });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleRemoveBookmark = async (jobId: string) => {
    try {
      await apiClient.post(`/jobs/${jobId}/bookmark`);
      setSavedJobs(prev => prev.filter(job => job.id !== jobId));
    } catch (err) {
      console.warn('Failed to remove bookmark:', err);
    }
  };

  // Filter handled by backend now
  const filteredJobs = savedJobs;

  const renderJobCard = ({ item }: { item: Job }) => (
    <TouchableOpacity
      style={styles.jobCard}
      activeOpacity={0.75}
      onPress={() => handleJobPress(item.id)}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <View style={styles.jobLogo}>
            {item.company?.logoUrl ? (
              <Image source={{ uri: item.company.logoUrl }} style={{ width: 48, height: 48, borderRadius: 12 }} />
            ) : (
              <Text style={styles.jobLogoText}>
                {item.company?.name ? item.company.name.charAt(0).toUpperCase() : item.title.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <View style={[styles.jobHeaderInfo, { flex: 1, marginLeft: 12, marginRight: 8 }]}>
            <Text style={styles.jobTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.jobCompany} numberOfLines={1}>{item.company?.name || 'Talentra Partner'}</Text>
          </View>
        </View>

        <TouchableOpacity style={{ padding: 4 }} onPress={() => handleRemoveBookmark(item.id)}>
          <Bookmark color={colors.primary} fill={colors.primary} size={20} />
        </TouchableOpacity>
      </View>

      <Text style={{ fontSize: 13, color: colors.mutedForeground, fontFamily: 'Inter', marginTop: 12, marginBottom: 12, lineHeight: 18 }} numberOfLines={2}>
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
        
        {item.hasApplied ? (
          <View style={{ backgroundColor: isDark ? '#064e3b' : '#DCFCE7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
            <Text style={{ color: isDark ? '#4ade80' : '#16A34A', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' }}>Applied</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={{ backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}
            activeOpacity={0.8}
            onPress={() => handleJobPress(item.id)}
          >
            <Text style={{ color: colors.primaryForeground, fontSize: 12, fontWeight: '600' }}>Apply</Text>
          </TouchableOpacity>
        )}
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
        </View>
        <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>{timeAgo(item.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.searchContainer}>
      <Search size={18} color={colors.mutedForeground} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search saved jobs..."
        placeholderTextColor={colors.mutedForeground}
        value={search}
        onChangeText={setSearch}
        returnKeyType="search"
      />
      {search.trim().length > 0 && (
        <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <BookmarkX size={16} color={colors.mutedForeground} />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <BookmarkX size={48} color={colors.mutedForeground} />
        <Text style={styles.emptyTitle}>
          {search ? 'No search results' : 'No saved jobs yet'}
        </Text>
        <Text style={styles.emptySubtitle}>
          {search
            ? 'Try adjusting your keywords to find saved postings'
            : 'Bookmark jobs you are interested in to view them here'}
        </Text>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <SavedJobsLoading />
      </SafeAreaView>
    );
  }

  if (error) {
    return <SavedJobsError message={error} onRetry={() => fetchSavedJobs()} onBack={handleBack} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* Render search header outside FlatList so keyboard focus is stable during list skeleton swap */}
      {renderHeader()}

      <FlatList
        data={searching ? ([1, 2, 3] as any[]) : (filteredJobs as any[])}
        keyExtractor={(item, index) => (searching ? `skeleton_${index}` : (item as Job).id || String(index))}
        renderItem={searching 
          ? () => <JobCardSkeleton animatedValue={skeletonAnim} colors={colors} style={styles.jobCard} /> 
          : (renderJobCard as any)
        }
        ListEmptyComponent={searching ? null : renderEmpty}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loadingMore ? <ActivityIndicator color={colors.primary} style={{ padding: 20 }} /> : <View style={{ height: 20 }} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />
    </SafeAreaView>
  );
};

export default SavedJobsScreen;
