import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ScrollView } from 'react-native';
import { useTheme } from '../../../../../hooks/useTheme';
import { ThemeColors } from '../../../../../constants/theme';

export const JobCardSkeleton = ({ animatedValue, colors, style }: { animatedValue: any; colors: ThemeColors; style?: any }) => {
  const styles = getStyles(colors);
  return (
    <View style={[styles.cardSkeleton, style]}>
      <View style={styles.cardHeader}>
        <Animated.View style={[styles.logoSkeleton, { opacity: animatedValue }]} />
        <View style={styles.titleContainer}>
          <Animated.View style={[styles.titleSkeleton, { opacity: animatedValue }]} />
          <Animated.View style={[styles.companySkeleton, { opacity: animatedValue }]} />
        </View>
      </View>
      <Animated.View style={[styles.descSkeleton, { opacity: animatedValue }]} />
      <Animated.View style={[styles.descShortSkeleton, { opacity: animatedValue }]} />
      <View style={styles.cardFooter}>
        <Animated.View style={[styles.badgeSkeleton, { opacity: animatedValue }]} />
        <Animated.View style={[styles.badgeSkeleton, { opacity: animatedValue }]} />
      </View>
    </View>
  );
};

export const JobFeedLoading = () => {
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

      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Animated.View style={[styles.greetingSkeleton, { opacity: animatedValue }]} />
          <Animated.View style={[styles.subtitleSkeleton, { opacity: animatedValue }]} />
        </View>
        <Animated.View style={[styles.avatarSkeleton, { opacity: animatedValue }]} />
      </View>

      <Animated.View style={[styles.searchSkeleton, { opacity: animatedValue }]} />

      <View style={styles.chipRow}>
        {[1, 2, 3, 4].map((i) => (
          <Animated.View key={i} style={[styles.chipSkeleton, { opacity: animatedValue }]} />
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        <View style={styles.sectionHeader}>
          <Animated.View style={[styles.sectionTitleSkeleton, { opacity: animatedValue }]} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredRow}>
          {[1, 2].map((i) => (
            <View key={i} style={styles.featuredCardSkeleton}>
              <View style={styles.cardHeader}>
                <Animated.View style={[styles.logoSkeleton, { opacity: animatedValue }]} />
                <View style={styles.titleContainer}>
                  <Animated.View style={[styles.titleSkeleton, { opacity: animatedValue }]} />
                  <Animated.View style={[styles.companySkeleton, { opacity: animatedValue }]} />
                </View>
              </View>
              <Animated.View style={[styles.descSkeleton, { opacity: animatedValue }]} />
              <Animated.View style={[styles.descShortSkeleton, { opacity: animatedValue }]} />
              <View style={styles.cardFooter}>
                <Animated.View style={[styles.badgeSkeleton, { opacity: animatedValue }]} />
                <Animated.View style={[styles.badgeSkeleton, { opacity: animatedValue }]} />
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Animated.View style={[styles.sectionTitleSkeleton, { opacity: animatedValue }]} />
        </View>
        <View style={styles.listContainer}>
          {[1, 2].map((i) => (
            <View key={i} style={styles.cardSkeleton}>
              <View style={styles.cardHeader}>
                <Animated.View style={[styles.logoSkeleton, { opacity: animatedValue }]} />
                <View style={styles.titleContainer}>
                  <Animated.View style={[styles.titleSkeleton, { opacity: animatedValue }]} />
                  <Animated.View style={[styles.companySkeleton, { opacity: animatedValue }]} />
                </View>
              </View>
              <View style={styles.cardFooter}>
                <Animated.View style={[styles.badgeSkeleton, { opacity: animatedValue }]} />
                <Animated.View style={[styles.badgeSkeleton, { opacity: animatedValue }]} />
              </View>
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
    paddingBottom: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  greetingSkeleton: {
    width: 160,
    height: 24,
    borderRadius: 6,
    backgroundColor: colors.muted,
    marginBottom: 6,
  },
  subtitleSkeleton: {
    width: 190,
    height: 14,
    borderRadius: 4,
    backgroundColor: colors.muted,
  },
  avatarSkeleton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.muted,
  },
  searchSkeleton: {
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.muted,
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 16,
  },
  chipRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 8,
    marginBottom: 16,
  },
  chipSkeleton: {
    width: 80,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.muted,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  sectionHeader: {
    paddingHorizontal: 24,
    marginVertical: 12,
  },
  sectionTitleSkeleton: {
    width: 120,
    height: 18,
    borderRadius: 4,
    backgroundColor: colors.muted,
  },
  featuredRow: {
    paddingLeft: 24,
    paddingRight: 8,
    gap: 16,
    marginBottom: 16,
  },
  featuredCardSkeleton: {
    width: 260,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
  },
  listContainer: {
    paddingHorizontal: 24,
    gap: 12,
  },
  cardSkeleton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoSkeleton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.muted,
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
    gap: 6,
  },
  titleSkeleton: {
    width: '75%',
    height: 16,
    borderRadius: 4,
    backgroundColor: colors.muted,
  },
  companySkeleton: {
    width: '45%',
    height: 12,
    borderRadius: 4,
    backgroundColor: colors.muted,
  },
  descSkeleton: {
    width: '100%',
    height: 12,
    borderRadius: 3,
    backgroundColor: colors.muted,
    marginBottom: 6,
  },
  descShortSkeleton: {
    width: '80%',
    height: 12,
    borderRadius: 3,
    backgroundColor: colors.muted,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 8,
  },
  badgeSkeleton: {
    width: 65,
    height: 24,
    borderRadius: 8,
    backgroundColor: colors.muted,
  },
});

export default JobFeedLoading;
