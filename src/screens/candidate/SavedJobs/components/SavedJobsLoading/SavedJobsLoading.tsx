import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../../../../hooks/useTheme';
import { ThemeColors } from '../../../../../constants/theme';

export const SavedJobCardSkeleton = ({ animatedValue, colors }: { animatedValue: any, colors: ThemeColors }) => {
  const styles = getStyles(colors);
  return (
    <View style={styles.cardSkeleton}>
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
  );
};

export const SavedJobsLoading = () => {
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
        <Animated.View style={[styles.backSkeleton, { opacity: animatedValue }]} />
        <Animated.View style={[styles.headerTitleSkeleton, { opacity: animatedValue }]} />
        <View style={styles.placeholder} />
      </View>

      <Animated.View style={[styles.searchSkeleton, { opacity: animatedValue }]} />

      <View style={styles.listContainer}>
        {[1, 2, 3].map((i) => (
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
  headerTitleSkeleton: {
    width: 120,
    height: 20,
    borderRadius: 6,
    backgroundColor: colors.muted,
  },
  placeholder: {
    width: 40,
  },
  searchSkeleton: {
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.muted,
    marginHorizontal: 24,
    marginVertical: 16,
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
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.muted,
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
    gap: 6,
  },
  titleSkeleton: {
    width: '70%',
    height: 16,
    borderRadius: 4,
    backgroundColor: colors.muted,
  },
  companySkeleton: {
    width: '40%',
    height: 12,
    borderRadius: 4,
    backgroundColor: colors.muted,
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

export default SavedJobsLoading;
