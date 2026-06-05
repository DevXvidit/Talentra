import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { ChevronLeft, RefreshCw, AlertCircle, LogIn, PhoneCall } from 'lucide-react-native';
import { useTheme } from '../../../../../hooks/useTheme';
import { ThemeColors } from '../../../../../constants/theme';

interface CandidateProfileErrorProps {
  message?: string;
  onRefresh: () => void;
  onSignInAgain: () => void;
  onContactSupport?: () => void;
  onBack: () => void;
}

export const CandidateProfileError: React.FC<CandidateProfileErrorProps> = ({
  message = "Your profile details couldn't be loaded from the server. Check your connection or try refreshing.",
  onRefresh,
  onSignInAgain,
  onContactSupport,
  onBack,
}) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <ChevronLeft color={colors.foreground} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <AlertCircle color={colors.error} size={36} />
        </View>

        <Text style={styles.title}>Couldn't fetch your profile</Text>
        <Text style={styles.subtitle}>{message}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={onRefresh} activeOpacity={0.85}>
            <RefreshCw color={colors.primaryForeground} size={16} style={styles.icon} />
            <Text style={styles.primaryButtonText}>Refresh Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={onSignInAgain} activeOpacity={0.8}>
            <LogIn color={colors.primary} size={16} style={styles.icon} />
            <Text style={styles.secondaryButtonText}>Sign in Again</Text>
          </TouchableOpacity>

          {onContactSupport && (
            <TouchableOpacity style={styles.secondaryButton} onPress={onContactSupport} activeOpacity={0.8}>
              <PhoneCall color={colors.primary} size={16} style={styles.icon} />
              <Text style={styles.secondaryButtonText}>Contact Support</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.errorBox}>
          <AlertCircle size={18} color={isDark ? '#fca5a5' : '#9B1C1C'} />
          <View style={styles.errorBoxTextContainer}>
            <Text style={styles.errorBoxTitle}>Error: HTTP_500_INTERNAL_SERVER_ERROR</Text>
            <Text style={styles.errorBoxSubtitle}>Failed to fetch user context from primary database server.</Text>
          </View>
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
    backgroundColor: colors.surface,
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
    marginBottom: 32,
  },
  primaryButton: {
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
  primaryButtonText: {
    color: colors.primaryForeground,
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Space Grotesk',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
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
  errorBox: {
    flexDirection: 'row',
    backgroundColor: isDark ? '#3b0707' : '#FDE8E8',
    borderColor: isDark ? '#991b1b' : '#F98080',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 12,
    maxWidth: 300,
  },
  errorBoxTextContainer: {
    flex: 1,
  },
  errorBoxTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: isDark ? '#fca5a5' : '#9B1C1C',
    fontFamily: 'Space Grotesk',
  },
  errorBoxSubtitle: {
    fontSize: 11,
    color: isDark ? '#fca5a5' : '#9B1C1C',
    fontFamily: 'Inter',
    marginTop: 2,
  },
});

export default CandidateProfileError;
