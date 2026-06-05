import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { ChevronLeft, AlertCircle, RefreshCw, Briefcase } from 'lucide-react-native';
import { useTheme } from '../../../../../hooks/useTheme';
import { ThemeColors } from '../../../../../constants/theme';

interface JobDetailErrorProps {
  message?: string;
  onRetry: () => void;
  onBack: () => void;
  onBrowseSimilar?: () => void;
}

export const JobDetailError: React.FC<JobDetailErrorProps> = ({
  message = "This listing may have been archived, expired, or is temporarily unavailable. Try refreshing or browse similar jobs.",
  onRetry,
  onBack,
  onBrowseSimilar,
}) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* Navigation Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <ChevronLeft color={colors.foreground} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Details</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Error Info Center */}
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <AlertCircle color={colors.error} size={36} />
        </View>

        <Text style={styles.title}>Job not available</Text>
        <Text style={styles.subtitle}>{message}</Text>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.85}>
            <RefreshCw color={colors.primaryForeground} size={16} style={styles.icon} />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>

          {onBrowseSimilar && (
            <TouchableOpacity style={styles.secondaryButton} onPress={onBrowseSimilar} activeOpacity={0.8}>
              <Briefcase color={colors.primary} size={16} style={styles.icon} />
              <Text style={styles.secondaryButtonText}>Browse Similar Jobs</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Footer Details */}
        <View style={styles.errorFooter}>
          <Text style={styles.errorCode}>Error code: JOB_NOT_FOUND</Text>
          <Text style={styles.supportId}>Reference ID: 388172</Text>
        </View>
      </View>
    </View>
  );
};

const getStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.foreground,
    fontFamily: 'Space Grotesk',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
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
    maxWidth: 300,
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

export default JobDetailError;
