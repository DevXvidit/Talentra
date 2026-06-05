import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { Briefcase, User } from 'lucide-react-native';
import { ThemeColors } from '../../../constants/theme';
import { useTheme } from '../../../hooks/useTheme';
import { USER_ROLES } from '../../../constants';

interface RoleSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectRole: (role: typeof USER_ROLES.CANDIDATE | typeof USER_ROLES.RECRUITER) => void;
}

export const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({
  visible,
  onClose,
  onSelectRole,
}) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Profile Type</Text>
              <Text style={styles.modalSubtitle}>
                Since this is your first time signing in with Google, please select your profile type to complete registration.
              </Text>

              <TouchableOpacity
                style={styles.roleOptionButton}
                activeOpacity={0.7}
                onPress={() => onSelectRole(USER_ROLES.CANDIDATE)}
              >
                <View style={[styles.iconWrapper, { backgroundColor: isDark ? '#082f49' : '#E0F2FE' }]}>
                  <User size={20} color={isDark ? '#38bdf8' : '#0284C7'} />
                </View>
                <View style={styles.roleOptionButtonTextContainer}>
                  <Text style={styles.roleOptionTitle}>Candidate</Text>
                  <Text style={styles.roleOptionSub}>I want to search and apply for jobs</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.roleOptionButton}
                activeOpacity={0.7}
                onPress={() => onSelectRole(USER_ROLES.RECRUITER)}
              >
                <View style={[styles.iconWrapper, { backgroundColor: isDark ? '#064e3b' : '#F0FDF4' }]}>
                  <Briefcase size={20} color={isDark ? '#34d399' : '#16A34A'} />
                </View>
                <View style={styles.roleOptionButtonTextContainer}>
                  <Text style={styles.roleOptionTitle}>Recruiter</Text>
                  <Text style={styles.roleOptionSub}>I want to post jobs and hire talent</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelModalButton}
                activeOpacity={0.7}
                onPress={onClose}
              >
                <Text style={styles.cancelModalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const getStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)', 
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontFamily: 'Space Grotesk',
    fontSize: 20,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: colors.mutedForeground,
    lineHeight: 18,
    marginBottom: 20,
  },
  roleOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginBottom: 12,
    gap: 12,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleOptionButtonTextContainer: {
    flex: 1,
  },
  roleOptionTitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: colors.foreground,
  },
  roleOptionSub: {
    fontFamily: 'Inter',
    fontSize: 11,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  cancelModalButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  cancelModalButtonText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: colors.mutedForeground,
  },
});
