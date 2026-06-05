import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ScrollView } from 'react-native';
import { useTheme } from '../../../../../hooks/useTheme';
import { ThemeColors } from '../../../../../constants/theme';

export const PostJobLoading = () => {
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
        <Animated.View style={[styles.draftSkeleton, { opacity: animatedValue }]} />
      </View>

      {/* Steps Indicator Skeleton */}
      <View style={styles.stepsRow}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.stepSkeletonContainer}>
            <Animated.View style={[styles.stepCircleSkeleton, { opacity: animatedValue }]} />
            <Animated.View style={[styles.stepLabelSkeleton, { opacity: animatedValue }]} />
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Form Group Skeletons */}
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.inputGroup}>
            <Animated.View style={[styles.labelSkeleton, { opacity: animatedValue }]} />
            <Animated.View style={[styles.inputSkeleton, { height: i === 2 ? 100 : 48, opacity: animatedValue }]} />
          </View>
        ))}
      </ScrollView>

      {/* Bottom Button Skeleton */}
      <View style={styles.footer}>
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
  draftSkeleton: {
    width: 80,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.muted,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.input,
  },
  stepSkeletonContainer: {
    alignItems: 'center',
    gap: 6,
  },
  stepCircleSkeleton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.muted,
  },
  stepLabelSkeleton: {
    width: 60,
    height: 12,
    borderRadius: 3,
    backgroundColor: colors.muted,
  },
  content: {
    padding: 24,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  labelSkeleton: {
    width: 80,
    height: 14,
    borderRadius: 3,
    backgroundColor: colors.muted,
  },
  inputSkeleton: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: colors.muted,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  buttonSkeleton: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.muted,
  },
});

export default PostJobLoading;
