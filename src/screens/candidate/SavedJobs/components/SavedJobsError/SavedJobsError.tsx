import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { ChevronLeft, RefreshCw, Home, AlertTriangle } from 'lucide-react-native';
import { useTheme } from '../../../../../hooks/useTheme';
import { ThemeColors } from '../../../../../constants/theme';

interface SavedJobsErrorProps {
  message?: string;
  onRetry: () => void;
  onBack: () => void;
}

export const SavedJobsError: React.FC<SavedJobsErrorProps> = ({
  message = "We couldn't fetch your saved jobs from the server. Check your connection or try again in a moment.",
  onRetry,
  onBack,
}) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <ChevronLeft color={colors.foreground} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Jobs</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <RefreshCw color={colors.error} size={32} />
        </View>

        <Text style={styles.title}>Bookmarks didn't load</Text>
        <Text style={styles.subtitle}>{message}</Text>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.85}>
            <RefreshCw color={colors.primaryForeground} size={16} style={styles.icon} />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={onBack} activeOpacity={0.8}>
            <Home color={colors.primary} size={16} style={styles.icon} />
            <Text style={styles.secondaryButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>

        {/* Warning Notification Block */}
        <View style={styles.warningBox}>
          <AlertTriangle size={18} color={isDark ? '#fca5a5' : '#9B1C1C'} />
          <Text style={styles.warningText}>
            Offline Mode: Some bookmarked entries may not reflect local changes until you re-establish sync.
          </Text>
        </View>

        {/* Footer Error Details */}
        <View style={styles.errorFooter}>
          <Text style={styles.supportId}>If the problem persists, try logging out and logging back in.</Text>
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
    marginBottom: 24,
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
  warningBox: {
    flexDirection: 'row',
    backgroundColor: isDark ? '#3b0707' : '#FDE8E8',
    borderColor: isDark ? '#991b1b' : '#F98080',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    gap: 8,
    maxWidth: 300,
    marginBottom: 40,
  },
  warningText: {
    flex: 1,
    fontSize: 11,
    color: isDark ? '#fca5a5' : '#9B1C1C',
    fontFamily: 'Inter',
    lineHeight: 16,
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
    textAlign: 'center',
  },
});

export default SavedJobsError;
