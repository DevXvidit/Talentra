import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ScrollView } from 'react-native';
import { useTheme } from '../../../../../hooks/useTheme';
import { ThemeColors } from '../../../../../constants/theme';

export const CandidateProfileLoading = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const animatedValue = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 0.3,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]);

    Animated.loop(pulse).start();
  }, [animatedValue]);

  return (
    <View style={styles.container}>
      {/* Header Skeleton */}
      <View style={styles.header}>
        <Animated.View style={[styles.backSkeleton, { opacity: animatedValue }]} />
        <Animated.View style={[styles.titleSkeleton, { opacity: animatedValue }]} />
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar & Info Card Skeleton */}
        <View style={styles.profileCard}>
          <Animated.View style={[styles.avatarSkeleton, { opacity: animatedValue }]} />
          <Animated.View style={[styles.nameSkeleton, { opacity: animatedValue }]} />
          <Animated.View style={[styles.subtitleSkeleton, { opacity: animatedValue }]} />
        </View>

        {/* Stats Row Skeleton */}
        <View style={styles.statsRow}>
          {[1, 2, 3].map((i) => (
            <Animated.View key={i} style={[styles.statBoxSkeleton, { opacity: animatedValue }]} />
          ))}
        </View>

        {/* Documents Card Skeleton */}
        <View style={styles.section}>
          <Animated.View style={[styles.sectionHeadingSkeleton, { opacity: animatedValue }]} />
          <Animated.View style={[styles.docCardSkeleton, { opacity: animatedValue }]} />
        </View>

        {/* Menu Row Skeletons */}
        <View style={styles.menuSection}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.menuRow}>
              <Animated.View style={[styles.menuIconSkeleton, { opacity: animatedValue }]} />
              <View style={styles.menuInfo}>
                <Animated.View style={[styles.menuLabelSkeleton, { opacity: animatedValue }]} />
              </View>
              <Animated.View style={[styles.menuChevronSkeleton, { opacity: animatedValue }]} />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backSkeleton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.muted,
  },
  titleSkeleton: {
    width: 100,
    height: 18,
    borderRadius: 4,
    backgroundColor: colors.muted,
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: 24,
    gap: 24,
  },
  profileCard: {
    alignItems: 'center',
    gap: 10,
  },
  avatarSkeleton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.muted,
  },
  nameSkeleton: {
    width: 140,
    height: 20,
    borderRadius: 4,
    backgroundColor: colors.muted,
  },
  subtitleSkeleton: {
    width: 180,
    height: 14,
    borderRadius: 4,
    backgroundColor: colors.muted,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statBoxSkeleton: {
    flex: 1,
    height: 70,
    borderRadius: 14,
    backgroundColor: colors.muted,
  },
  section: {
    gap: 12,
  },
  sectionHeadingSkeleton: {
    width: 100,
    height: 16,
    borderRadius: 3,
    backgroundColor: colors.muted,
  },
  docCardSkeleton: {
    height: 64,
    borderRadius: 14,
    backgroundColor: colors.muted,
  },
  menuSection: {
    gap: 12,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIconSkeleton: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: colors.muted,
    marginRight: 12,
  },
  menuInfo: {
    flex: 1,
  },
  menuLabelSkeleton: {
    width: 120,
    height: 14,
    borderRadius: 3,
    backgroundColor: colors.muted,
  },
  menuChevronSkeleton: {
    width: 16,
    height: 16,
    borderRadius: 4,
    backgroundColor: colors.muted,
  },
});

export default CandidateProfileLoading;
