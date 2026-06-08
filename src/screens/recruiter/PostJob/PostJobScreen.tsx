import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ChevronLeft, Briefcase, MapPin, IndianRupee, Tag, FileText, AlertCircle, ListChecks } from 'lucide-react-native';
import { ROUTES } from '../../../constants/screens';
import { JOB_TYPES, JOB_CATEGORIES } from '../../../constants/jobs';
import { jobService } from '../../../services/jobService';
import { useAuthStore } from '../../../store/useAuthStore';
import { useToastStore } from '../../../store/useToastStore';
import { CategoryDropdown } from '../../../components/common/CategoryDropdown';
import { getStyles } from './PostJobScreen.styles';
import { useTheme } from '../../../hooks/useTheme';
import PostJobLoading from './components/PostJobLoading';

const JOB_TYPE_OPTIONS = Object.values(JOB_TYPES);
const EXPERIENCE_OPTIONS = ['Entry (0-2 years)', 'Mid (2-5 years)', 'Senior (5-8 years)', 'Lead (8+ years)'];

const INR_SALARY_PRESETS = [
  '0–3 LPA',
  '3–6 LPA',
  '6–10 LPA',
  '10–15 LPA',
  '15–25 LPA',
  '25–40 LPA',
  '40+ LPA',
];

export const PostJobScreen = () => {
  const { user } = useAuthStore();
  const company = user?.companyId && typeof user.companyId === 'object' ? user.companyId : null;
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const jobId = route.params?.jobId;

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [selectedType, setSelectedType] = useState<string>(JOB_TYPE_OPTIONS[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>(JOB_CATEGORIES[0]);
  const [experience, setExperience] = useState(EXPERIENCE_OPTIONS[1]);
  const [mustHaveSkills, setMustHaveSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [responsibilities, setResponsibilities] = useState<string[]>([]);
  const [responsibilityInput, setResponsibilityInput] = useState('');

  const [totalPositions, setTotalPositions] = useState<string>('1');
  const [filledPositions, setFilledPositions] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasSubmittedFailed, setHasSubmittedFailed] = useState(false);

  React.useEffect(() => {
    if (jobId) {
      const fetchJobDetails = async () => {
        setLoading(true);
        try {
          const job = await jobService.fetchJobById(jobId);
          if (job) {
            setTitle(job.title || '');
            setDescription(job.description || '');
            setLocation(job.location || '');
            setSalary(job.salary || '');
            setSelectedType(job.type || JOB_TYPE_OPTIONS[0]);
            setSelectedCategory(job.category || JOB_CATEGORIES[0]);
            setMustHaveSkills(job.mustHaveSkills || []);
            setResponsibilities(job.responsibilities || []);
            setTotalPositions(String(job.totalPositions || 1));
            setFilledPositions(job.filledPositions || 0);
          }
        } catch (_err: any) {
          useToastStore.getState().show('Failed to fetch job details.', 'error');
        } finally {
          setLoading(false);
        }
      };
      fetchJobDetails();
    } else {
      
      setStep(1);
      setTitle('');
      setDescription('');
      setLocation('');
      setSalary('');
      setSelectedType(JOB_TYPE_OPTIONS[0]);
      setSelectedCategory(JOB_CATEGORIES[0]);
      setExperience(EXPERIENCE_OPTIONS[1]);
      setMustHaveSkills([]);
      setSkillInput('');
      setResponsibilities([]);
      setResponsibilityInput('');
      setTotalPositions('1');
      setFilledPositions(0);
      setErrors({});
      setHasSubmittedFailed(false);
    }
  }, [jobId]);

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (mustHaveSkills.includes(trimmed)) {
      useToastStore.getState().show('This skill is already added.', 'warning');
      return;
    }
    if (mustHaveSkills.length >= 10) {
      useToastStore.getState().show('You can add up to 10 must-have skills.', 'warning');
      return;
    }
    setMustHaveSkills([...mustHaveSkills, trimmed]);
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setMustHaveSkills(mustHaveSkills.filter((s) => s !== skillToRemove));
  };

  const handleAddResponsibility = () => {
    const trimmed = responsibilityInput.trim();
    if (!trimmed) return;
    if (responsibilities.length >= 20) {
      useToastStore.getState().show('You can add up to 20 responsibilities.', 'warning');
      return;
    }
    setResponsibilities([...responsibilities, trimmed]);
    setResponsibilityInput('');
  };

  const handleRemoveResponsibility = (index: number) => {
    setResponsibilities(responsibilities.filter((_, i) => i !== index));
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) {
      newErrors.title = 'Job title is required';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }
    if (!location.trim()) newErrors.location = 'Location is required';

    const parsedPositions = parseInt(String(totalPositions), 10);
    if (isNaN(parsedPositions) || parsedPositions < 1) {
      newErrors.totalPositions = 'Number of open positions must be at least 1';
    } else if (jobId && parsedPositions < filledPositions) {
      newErrors.totalPositions = `Cannot decrease positions below ${filledPositions} (currently filled)`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    if (!salary) newErrors.salary = 'Salary range is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
        setHasSubmittedFailed(false);
      } else {
        setHasSubmittedFailed(true);
      }
    } else if (step === 2) {
      
      setStep(3);
      setHasSubmittedFailed(false);
    } else if (step === 3) {
      if (validateStep3()) {
        setStep(4);
        setHasSubmittedFailed(false);
      } else {
        setHasSubmittedFailed(true);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setHasSubmittedFailed(false);
      setErrors({});
    }
  };

  const handlePost = async () => {
    setLoading(true);
    const parsedPositions = parseInt(String(totalPositions), 10) || 1;
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        salary: salary.trim(),
        type: selectedType,
        category: selectedCategory,
        mustHaveSkills,
        responsibilities,
        totalPositions: parsedPositions,
      };

      if (jobId) {
        await jobService.updateJob(jobId, payload);
        useToastStore.getState().show('Job listing updated successfully!', 'success');
        
        navigation.setParams({ jobId: undefined });
        navigation.goBack();
      } else {
        await jobService.createJob(payload);
        useToastStore.getState().show('Your job listing has been posted successfully!', 'success');
        
        setStep(1);
        setTitle('');
        setDescription('');
        setLocation('');
        setSalary('');
        setSelectedType(JOB_TYPE_OPTIONS[0]);
        setSelectedCategory(JOB_CATEGORIES[0]);
        setExperience(EXPERIENCE_OPTIONS[1]);
        setMustHaveSkills([]);
        setResponsibilities([]);
        setTotalPositions('1');
        setFilledPositions(0);
        setErrors({});
        setHasSubmittedFailed(false);
        navigation.navigate(ROUTES.RECRUITER_JOB_FEED);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to submit job listing. Please try again.';
      useToastStore.getState().show(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <PostJobLoading />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <View style={styles.header}>
        {step > 1 ? (
          <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
            <ChevronLeft color={colors.foreground} size={24} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backButtonPlaceholder} />
        )}
        <Text style={styles.headerTitle}>{jobId ? 'Edit Job' : 'Post a Job'}</Text>
        <View style={styles.backButtonPlaceholder} />
      </View>

      <View style={[styles.stepsContainer, { paddingVertical: 16 }]}>
        <View style={styles.segmentedBar}>
          {[1, 2, 3, 4].map((s) => (
            <View
              key={s}
              style={[
                styles.segment,
                s < step && styles.segmentDone,
                s === step && styles.segmentActive,
              ]}
            />
          ))}
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >

          {hasSubmittedFailed && (
            <View style={styles.errorBanner}>
              <AlertCircle size={20} color={colors.error} />
              <View style={styles.errorBannerTextContainer}>
                <Text style={styles.errorBannerTitle}>Submission Failed</Text>
                <Text style={styles.errorBannerSubtitle}>Please correct the highlighted errors below.</Text>
              </View>
            </View>
          )}

          {step === 1 && (
            <View style={styles.formContainer}>

              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Briefcase size={16} color={errors.title ? colors.error : colors.primary} />
                  <Text style={[styles.label, errors.title && styles.labelError]}>Job Title *</Text>
                </View>
                <TextInput
                  style={[styles.input, errors.title && styles.inputError]}
                  placeholder="e.g. Senior Product Designer"
                  placeholderTextColor={colors.mutedForeground}
                  value={title}
                  onChangeText={(val) => {
                    setTitle(val);
                    if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
                  }}
                />
                {errors.title ? <Text style={styles.helperErrorText}>{errors.title}</Text> : null}
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <FileText size={16} color={errors.description ? colors.error : colors.primary} />
                  <Text style={[styles.label, errors.description && styles.labelError]}>Description *</Text>
                </View>
                <TextInput
                  style={[styles.input, styles.textArea, errors.description && styles.inputError]}
                  placeholder="Describe the role, responsibilities overview, and what makes this opportunity exciting..."
                  placeholderTextColor={colors.mutedForeground}
                  value={description}
                  onChangeText={(val) => {
                    setDescription(val);
                    if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
                  }}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
                {errors.description ? <Text style={styles.helperErrorText}>{errors.description}</Text> : null}
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Tag size={16} color={colors.primary} />
                  <Text style={styles.label}>Category</Text>
                </View>
                <CategoryDropdown
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <MapPin size={16} color={errors.location ? colors.error : colors.primary} />
                  <Text style={[styles.label, errors.location && styles.labelError]}>Location *</Text>
                </View>
                <TextInput
                  style={[styles.input, errors.location && styles.inputError]}
                  placeholder="City, State or Remote"
                  placeholderTextColor={colors.mutedForeground}
                  value={location}
                  onChangeText={(val) => {
                    setLocation(val);
                    if (errors.location) setErrors((prev) => ({ ...prev, location: '' }));
                  }}
                />
                {errors.location ? <Text style={styles.helperErrorText}>{errors.location}</Text> : null}
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Briefcase size={16} color={errors.totalPositions ? colors.error : colors.primary} />
                  <Text style={[styles.label, errors.totalPositions && styles.labelError]}>Number of Open Positions *</Text>
                </View>
                <TextInput
                  style={[styles.input, errors.totalPositions && styles.inputError]}
                  placeholder="e.g. 2"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="numeric"
                  value={totalPositions}
                  onChangeText={(val) => {
                    const cleanVal = val.replace(/[^0-9]/g, '');
                    setTotalPositions(cleanVal);
                    if (errors.totalPositions) setErrors((prev) => ({ ...prev, totalPositions: '' }));
                  }}
                />
                {errors.totalPositions ? <Text style={styles.helperErrorText}>{errors.totalPositions}</Text> : null}
                {jobId ? (
                  <Text style={[styles.skillHelpText, { marginTop: 4, color: colors.mutedForeground }]}>
                    Currently filled positions: {filledPositions}. You cannot decrease positions below this.
                  </Text>
                ) : null}
              </View>
            </View>
          )}

          {step === 2 && (
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <ListChecks size={16} color={colors.primary} />
                  <Text style={styles.label}>Key Responsibilities</Text>
                </View>
                <Text style={styles.skillHelpText}>
                  Add specific duties candidates will perform. Each item becomes a bullet point on the job listing.
                </Text>

                <View style={[styles.skillInputContainer, { marginTop: 12 }]}>
                  <TextInput
                    style={styles.skillTextInput}
                    placeholder="e.g. Lead cross-functional design sprints"
                    placeholderTextColor={colors.mutedForeground}
                    value={responsibilityInput}
                    onChangeText={setResponsibilityInput}
                    onSubmitEditing={handleAddResponsibility}
                    returnKeyType="done"
                  />
                  <TouchableOpacity style={styles.addSkillButton} onPress={handleAddResponsibility} activeOpacity={0.7}>
                    <Text style={styles.addSkillButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>

                {responsibilities.length > 0 && (
                  <View style={styles.responsibilityList}>
                    {responsibilities.map((item, index) => (
                      <View key={index} style={styles.responsibilityItem}>
                        <View style={styles.responsibilityBullet} />
                        <Text style={styles.responsibilityItemText} numberOfLines={3}>{item}</Text>
                        <TouchableOpacity
                          style={styles.removeResponsibilityBtn}
                          onPress={() => handleRemoveResponsibility(index)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.removeSkillBtnText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                {responsibilities.length === 0 && (
                  <View style={styles.emptyResponsibilities}>
                    <ListChecks size={32} color={colors.border} />
                    <Text style={styles.emptyResponsibilitiesText}>No responsibilities added yet</Text>
                  </View>
                )}

                <Text style={[styles.skillHelpText, { marginTop: 8 }]}>
                  {responsibilities.length}/20 responsibilities added
                </Text>
              </View>
            </View>
          )}

          {step === 3 && (
            <View style={styles.formContainer}>

              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Briefcase size={16} color={colors.primary} />
                  <Text style={styles.label}>Job Type</Text>
                </View>
                <View style={styles.chipRow}>
                  {JOB_TYPE_OPTIONS.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.chip, selectedType === type && styles.chipActive]}
                      onPress={() => setSelectedType(type)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.chipText, selectedType === type && styles.chipTextActive]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Tag size={16} color={colors.primary} />
                  <Text style={styles.label}>Experience Level</Text>
                </View>
                <View style={styles.chipRow}>
                  {EXPERIENCE_OPTIONS.map((exp) => (
                    <TouchableOpacity
                      key={exp}
                      style={[styles.chip, experience === exp && styles.chipActive]}
                      onPress={() => setExperience(exp)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.chipText, experience === exp && styles.chipTextActive]}>
                        {exp}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={{ marginBottom: 24 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <IndianRupee size={16} color={errors.salary ? colors.error : colors.primary} />
                  <Text style={[styles.label, errors.salary && styles.labelError, { marginLeft: 6 }]}>Salary Range (INR) *</Text>
                </View>
                <Text style={styles.skillHelpText}>Select a preset range or type a custom value.</Text>

                <View style={[styles.chipRow, { marginTop: 10 }]}>
                  {INR_SALARY_PRESETS.map((preset) => (
                    <TouchableOpacity
                      key={preset}
                      style={[styles.chip, salary === preset && styles.chipActive]}
                      onPress={() => {
                        setSalary(preset);
                        if (errors.salary) setErrors((prev) => ({ ...prev, salary: '' }));
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.chipText, salary === preset && styles.chipTextActive]}>
                        ₹ {preset}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  style={[styles.input, { marginTop: 12 }, errors.salary && styles.inputError]}
                  placeholder="Or type custom, e.g. ₹12–18 LPA"
                  placeholderTextColor={colors.mutedForeground}
                  value={salary}
                  onChangeText={(val) => {
                    setSalary(val);
                    if (errors.salary) setErrors((prev) => ({ ...prev, salary: '' }));
                  }}
                />
                {errors.salary ? <Text style={styles.helperErrorText}>{errors.salary}</Text> : null}
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Tag size={16} color={colors.primary} />
                  <Text style={styles.label}>Must-Have Skills</Text>
                </View>
                <View style={styles.skillInputContainer}>
                  <TextInput
                    style={styles.skillTextInput}
                    placeholder="e.g. React Native"
                    placeholderTextColor={colors.mutedForeground}
                    value={skillInput}
                    onChangeText={setSkillInput}
                    onSubmitEditing={handleAddSkill}
                    returnKeyType="done"
                  />
                  <TouchableOpacity style={styles.addSkillButton} onPress={handleAddSkill} activeOpacity={0.7}>
                    <Text style={styles.addSkillButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
                {mustHaveSkills.length > 0 && (
                  <View style={styles.skillsChipRow}>
                    {mustHaveSkills.map((skill, index) => (
                      <View key={index} style={styles.skillChip}>
                        <Text style={styles.skillChipText}>{skill}</Text>
                        <TouchableOpacity style={styles.removeSkillBtn} onPress={() => handleRemoveSkill(skill)}>
                          <Text style={styles.removeSkillBtnText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
                <Text style={styles.skillHelpText}>Add up to 10 key technical skills required for this job listing.</Text>
              </View>
            </View>
          )}

          {step === 4 && (
            <View style={styles.reviewContainer}>
              <Text style={styles.reviewHeading}>Review Listing Details</Text>

              <View style={styles.reviewCard}>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Company</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {company?.logoUrl && (
                      <Image source={{ uri: company.logoUrl }} style={{ width: 24, height: 24, borderRadius: 4 }} />
                    )}
                    <Text style={styles.reviewVal}>{company?.name || 'Your Company'}</Text>
                  </View>
                </View>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Title</Text>
                  <Text style={styles.reviewVal}>{title}</Text>
                </View>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Category</Text>
                  <Text style={styles.reviewVal}>{selectedCategory}</Text>
                </View>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Location</Text>
                  <Text style={styles.reviewVal}>{location}</Text>
                </View>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Job Type</Text>
                  <Text style={styles.reviewVal}>{selectedType}</Text>
                </View>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Experience</Text>
                  <Text style={styles.reviewVal}>{experience}</Text>
                </View>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Salary</Text>
                  <Text style={styles.reviewVal}>{salary}</Text>
                </View>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Open Positions</Text>
                  <Text style={styles.reviewVal}>{totalPositions}</Text>
                </View>

                <View style={[styles.reviewRow, { flexDirection: 'column', alignItems: 'flex-start' }]}>
                  <Text style={[styles.reviewLabel, { marginBottom: 6 }]}>Responsibilities</Text>
                  {responsibilities.length > 0 ? (
                    responsibilities.map((r, i) => (
                      <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 }}>
                        <Text style={[styles.reviewDesc, { color: colors.primary, marginRight: 6 }]}>•</Text>
                        <Text style={styles.reviewDesc}>{r}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.reviewDesc}>None specified</Text>
                  )}
                </View>

                <View style={[styles.reviewRow, { flexDirection: 'column', alignItems: 'flex-start' }]}>
                  <Text style={[styles.reviewLabel, { marginBottom: 6 }]}>Must-Have Skills</Text>
                  {mustHaveSkills.length > 0 ? (
                    <View style={styles.reviewChipsRow}>
                      {mustHaveSkills.map((skill, index) => (
                        <View key={index} style={styles.reviewChip}>
                          <Text style={styles.reviewChipText}>{skill}</Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.reviewDesc}>None specified</Text>
                  )}
                </View>

                <View style={[styles.reviewRow, { flexDirection: 'column', alignItems: 'flex-start' }]}>
                  <Text style={[styles.reviewLabel, { marginBottom: 6 }]}>Description</Text>
                  <Text style={styles.reviewDesc}>{description}</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          {step < 4 ? (
            <TouchableOpacity style={styles.primaryButton} onPress={handleContinue} activeOpacity={0.8}>
              <Text style={styles.primaryButtonText}>Continue</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.footerButtons}>
              <TouchableOpacity style={styles.secondaryButton} onPress={handleBack} activeOpacity={0.8}>
                <Text style={styles.secondaryButtonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.primaryButton, { flex: 2 }]} onPress={handlePost} activeOpacity={0.8}>
                <Text style={styles.primaryButtonText}>{jobId ? 'Save Changes' : 'Publish Job'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PostJobScreen;
