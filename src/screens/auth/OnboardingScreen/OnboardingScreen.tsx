import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRight, SlidersHorizontal, Check } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PageDots } from '../../../components/PageDots';
import { GoogleLogo, MetaLogo, AppleLogo } from '../../../components/common/SocialIcons';
import { useTheme } from '../../../hooks/useTheme';
import { SHADOWS } from '../../../constants/theme';
import { ROUTES } from '../../../constants/screens';
import { USER_ROLES, ONBOARDING_SLIDES, IMAGES } from '../../../constants';
import { AuthStackParamList } from '../../../types';
import { setHasCompletedOnboarding } from '../../../utils/storage';
import { getStyles } from './OnboardingScreen.styles';

export const OnboardingScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const [currentStep, setCurrentStep] = useState(0);
  const { height } = useWindowDimensions();
  const isSmallScreen = height < 750;

  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(prev => prev + 1);
    } else {
      console.log('Finished onboarding! Navigating to register...');
      setHasCompletedOnboarding(true);
      navigation.navigate(ROUTES.REGISTER, { role: USER_ROLES.CANDIDATE });
    }
  };

  const handleSkipOrBack = () => {
    if (currentStep < 2) {
      setCurrentStep(2);
    } else {
      setCurrentStep(prev => prev - 1);
    }
  };

  const activeSlide = ONBOARDING_SLIDES[currentStep];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topNav}>
        <View style={styles.stepChip}>
          <Text style={styles.stepText}>
            {currentStep + 1} / 3
          </Text>
        </View>

        <View style={[styles.dotsContainer, { position: 'absolute', left: 0, right: 0, alignItems: 'center' }]} pointerEvents="box-none">
          <PageDots total={3} active={currentStep} onPressDot={setCurrentStep} />
        </View>

        <TouchableOpacity
          style={styles.skipButton}
          activeOpacity={0.7}
          onPress={handleSkipOrBack}
        >
          <Text style={styles.stepText}>
            {currentStep < 2 ? 'Skip' : 'Back'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.contentContainer, { justifyContent: 'flex-start' }]}>
        <View style={{ flex: isSmallScreen ? 0.2 : 0.8 }} />

        <View style={[styles.heroContainer, isSmallScreen && { minHeight: 200, transform: [{ scale: 0.9 }] }]}>
          {currentStep === 0 && (
            <View style={styles.imageWrapper}>
              <Image
                source={IMAGES.ONBOARDING_STEP_1}
                style={styles.heroImage}
                resizeMode="cover"
              />

              <View style={[styles.floatingChip, styles.chipGoogle, !isDark && SHADOWS.sm]}>
                <View style={styles.chipIconBox}>
                  <GoogleLogo size={14} />
                </View>
                <Text style={styles.chipText}>Google</Text>
              </View>

              <View style={[styles.floatingChip, styles.chipMeta, !isDark && SHADOWS.sm]}>
                <View style={styles.chipIconBox}>
                  <MetaLogo size={15} />
                </View>
                <Text style={styles.chipText}>Meta</Text>
              </View>

              <View style={[styles.statsBadge, !isDark && SHADOWS.lg]}>
                <Text style={styles.statsBadgeNumber}>50k+</Text>
                <Text style={styles.statsBadgeText}>Jobs</Text>
              </View>

              <View style={[styles.floatingChip, styles.chipApple, !isDark && SHADOWS.sm]}>
                <View style={styles.chipIconBox}>
                  <AppleLogo size={14} />
                </View>
                <Text style={styles.chipText}>Apple</Text>
              </View>
            </View>
          )}

          {currentStep === 1 && (
            <View style={[styles.imageWrapper, isSmallScreen && { transform: [{ scale: 0.95 }] }]}>
              <Image
                source={IMAGES.ONBOARDING_STEP_2}
                style={{ width: '100%', height: '100%', borderRadius: 16 }}
                resizeMode="cover"
              />

              <View style={[styles.floatingChip, styles.chipFilters, !isDark && SHADOWS.sm]}>
                <SlidersHorizontal size={12} color={colors.primary} />
                <Text style={styles.filtersText}>12 Filters</Text>
              </View>

              <View style={[styles.floatingChip, styles.chipApplied, !isDark && SHADOWS.sm]}>
                <View style={styles.appliedIconBox}>
                  <Check size={10} color="#FFFFFF" strokeWidth={3} />
                </View>
                <View>
                  <Text style={styles.appliedTextTitle}>Applied!</Text>
                  <Text style={styles.appliedTextSubtitle}>Google</Text>
                </View>
              </View>

              <View style={[styles.floatingChip, styles.chipTracked, !isDark && SHADOWS.lg]}>
                <Text style={styles.trackedTextNum}>8</Text>
                <Text style={styles.trackedTextLabel}>Tracked</Text>
              </View>

            </View>
          )}
          {currentStep === 2 && (
            <View style={[styles.imageWrapper, isSmallScreen && { transform: [{ scale: 0.9 }] }]}>
              <View style={styles.trackingCardContainer}>
                <View style={[styles.glassCard, !isDark && SHADOWS.lg]}>
                  <View style={styles.cardHeader}>
                    <View style={styles.avatarGradient}>
                      <Text style={styles.avatarText}>SJ</Text>
                    </View>
                    <View style={styles.headerText}>
                      <Text style={styles.jobTitleText}>Sarah Jenkins</Text>
                      <Text style={styles.companyNameText}>Senior React Native Developer</Text>
                    </View>
                  </View>

                  <View style={styles.matchScoreRow}>
                    <View style={styles.matchBadge}>
                      <Text style={styles.matchBadgeText}>🔥 98% Match Score</Text>
                    </View>
                    <View style={styles.tagBadge}>
                      <Text style={styles.tagBadgeText}>4+ yrs exp</Text>
                    </View>
                  </View>

                  <View style={styles.candidateActionRow}>
                    <TouchableOpacity style={styles.declineButton} activeOpacity={0.7}>
                      <Text style={styles.declineButtonText}>Decline</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.shortlistButton} activeOpacity={0.8}>
                      <Text style={styles.shortlistButtonText}>Shortlist</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>

        <View style={{ flex: isSmallScreen ? 0.2 : 0.6 }} />

        <View style={styles.textSection}>
            <View style={styles.badgeRow}>
              <View style={styles.platformBadge}>
                <Text style={styles.platformBadgeText}>
                  {activeSlide.badge}
                </Text>
              </View>
            </View>
            <Text style={styles.title}>
              {activeSlide.titleFirst}
              <Text style={[styles.title, styles.titleHighlight]}>
                {activeSlide.titleHighlight}
              </Text>
              {activeSlide.titleLast}
            </Text>
            <Text style={styles.subtitle}>
              {activeSlide.subtitle}
            </Text>

            <View style={styles.statsRow}>
              {activeSlide.stats.map((s) => (
                <View key={s.label} style={styles.statCard}>
                  <Text style={styles.statNum}>{s.num}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ flex: isSmallScreen ? 0.3 : 1 }} />

          <View style={[styles.ctaSection, isSmallScreen && { paddingBottom: 12, paddingTop: 8 }]}>
            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.8}
              onPress={handleNext}
            >
              <Text style={styles.primaryButtonText}>
                {currentStep < 2 ? 'Next Step' : 'Get Started'}
              </Text>
              <View style={styles.arrowBox}>
                <ArrowRight size={16} color={colors.primaryForeground} />
              </View>
            </TouchableOpacity>
          </View>
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;
