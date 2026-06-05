import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WifiOff, RefreshCw, Bookmark } from 'lucide-react-native';
import { useTheme } from '../../../../../hooks/useTheme';
import { ThemeColors } from '../../../../../constants/theme';

interface JobFeedErrorProps {
  message?: string;
  onRetry: () => void;
  onViewSaved?: () => void;
}

export const JobFeedError: React.FC<JobFeedErrorProps> = ({
  message = "Couldn't load job listings. Please check your internet connection.",
  onRetry,
  onViewSaved,
}) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <WifiOff color={colors.error} size={32} />
        </View>

        <Text style={styles.title}>Couldn't load job listings</Text>
        <Text style={styles.subtitle}>
          Please check your internet connection and try again. Your saved jobs are still available offline.
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.85}>
            <RefreshCw color={colors.primaryForeground} size={16} style={styles.icon} />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>

          {onViewSaved && (
            <TouchableOpacity style={styles.secondaryButton} onPress={onViewSaved} activeOpacity={0.8}>
              <Bookmark color={colors.primary} size={16} style={styles.icon} />
              <Text style={styles.secondaryButtonText}>View Saved Jobs</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.errorFooter}>
          <Text style={styles.errorCode}>Error code: NET_ERR_001</Text>
          <Text style={styles.supportId}>Support ID: 998273</Text>
        </View>
      </View>
    </View>
  );
};

const getStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  content: {
    width: '100%',
    maxWidth: 340,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: isDark ? '#2a0808' : '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: isDark ? '#991b1b' : '#FEE2E2',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.foreground,
    fontFamily: 'Space Grotesk',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.mutedForeground,
    fontFamily: 'Inter',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 40,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  retryButtonText: {
    color: colors.primaryForeground,
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Space Grotesk',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderWidth: 1.5,
    height: 48,
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Space Grotesk',
  },
  icon: {
    marginRight: 8,
  },
  errorFooter: {
    alignItems: 'center',
    gap: 4,
  },
  errorCode: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.error,
    fontFamily: 'Space Grotesk',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  supportId: {
    fontSize: 11,
    color: colors.mutedForeground,
    fontFamily: 'Inter',
  },
});

export default JobFeedError;
