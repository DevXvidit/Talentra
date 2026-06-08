import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../../../../hooks/useTheme';
import { ThemeColors } from '../../../../../constants/theme';

export const JobDetailLoading = () => {
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
        <Animated.View style={[styles.backButtonSkeleton, { opacity: animatedValue }]} />
        <Animated.View style={[styles.headerTitleSkeleton, { opacity: animatedValue }]} />
        <Animated.View style={[styles.bookmarkSkeleton, { opacity: animatedValue }]} />
      </View>

      <View style={styles.content}>

        <View style={styles.heroSection}>
          <Animated.View style={[styles.logoSkeleton, { opacity: animatedValue }]} />
          <Animated.View style={[styles.titleSkeleton, { opacity: animatedValue }]} />
          <Animated.View style={[styles.companySkeleton, { opacity: animatedValue }]} />
          <Animated.View style={[styles.locationSkeleton, { opacity: animatedValue }]} />
        </View>

        <Animated.View style={[styles.metaCardSkeleton, { opacity: animatedValue }]}>
          <View style={styles.metaRow}>
            <View style={styles.metaCol} />
            <View style={styles.metaCol} />
            <View style={styles.metaCol} />
          </View>
        </Animated.View>

        <View style={styles.descriptionSection}>
          <Animated.View style={[styles.sectionHeadingSkeleton, { opacity: animatedValue }]} />
          <Animated.View style={[styles.paragraphLineSkeleton, { width: '100%', opacity: animatedValue }]} />
          <Animated.View style={[styles.paragraphLineSkeleton, { width: '90%', opacity: animatedValue }]} />
          <Animated.View style={[styles.paragraphLineSkeleton, { width: '95%', opacity: animatedValue }]} />
          <Animated.View style={[styles.paragraphLineSkeleton, { width: '60%', opacity: animatedValue }]} />
        </View>

        <View style={styles.descriptionSection}>
          <Animated.View style={[styles.sectionHeadingSkeleton, { opacity: animatedValue }]} />
          <Animated.View style={[styles.paragraphLineSkeleton, { width: '100%', opacity: animatedValue }]} />
          <Animated.View style={[styles.paragraphLineSkeleton, { width: '85%', opacity: animatedValue }]} />
          <Animated.View style={[styles.paragraphLineSkeleton, { width: '92%', opacity: animatedValue }]} />
          <Animated.View style={[styles.paragraphLineSkeleton, { width: '70%', opacity: animatedValue }]} />
        </View>
      </View>

      <View style={styles.bottomBar}>
        <Animated.View style={[styles.buttonSkeleton, { opacity: animatedValue }]} />
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
  backButtonSkeleton: {
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
  bookmarkSkeleton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.muted,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoSkeleton: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.muted,
    marginBottom: 16,
  },
  titleSkeleton: {
    width: '70%',
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.muted,
    marginBottom: 12,
  },
  companySkeleton: {
    width: '45%',
    height: 18,
    borderRadius: 6,
    backgroundColor: colors.muted,
    marginBottom: 10,
  },
  locationSkeleton: {
    width: '30%',
    height: 14,
    borderRadius: 4,
    backgroundColor: colors.muted,
  },
  metaCardSkeleton: {
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metaCol: {
    width: 60,
    height: 34,
    borderRadius: 6,
    backgroundColor: colors.muted,
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionHeadingSkeleton: {
    width: '40%',
    height: 20,
    borderRadius: 6,
    backgroundColor: colors.muted,
    marginBottom: 12,
  },
  paragraphLineSkeleton: {
    height: 12,
    borderRadius: 4,
    backgroundColor: colors.muted,
    marginBottom: 8,
  },
  bottomBar: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  buttonSkeleton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: colors.muted,
  },
});

export default JobDetailLoading;
