import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { ThemeColors } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  isPassword?: boolean;
  containerStyle?: ViewStyle | ViewStyle[];
}

export const Input = ({
  label,
  error,
  icon,
  isPassword = false,
  containerStyle,
  secureTextEntry,
  ...props
}: InputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const getContainerStyle = () => {
    const stylesArray: ViewStyle[] = [styles.inputContainer];
    
    if (error) {
      stylesArray.push(styles.borderError);
    } else if (isFocused) {
      stylesArray.push(styles.borderFocused);
    } else {
      stylesArray.push(styles.borderDefault);
    }

    return stylesArray;
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <Text style={styles.label}>
        {label}
      </Text>

      <View style={getContainerStyle()}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}

        <TextInput
          {...props}
          secureTextEntry={isPassword && !isPasswordVisible}
          placeholderTextColor={colors.mutedForeground}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={styles.textInput}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.passwordToggle}
          >
            {isPasswordVisible ? (
              <EyeOff size={20} color={colors.mutedForeground} />
            ) : (
              <Eye size={20} color={colors.mutedForeground} />
            )}
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}
    </View>
  );
};

export default Input;

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    color: colors.mutedForeground,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.input,
    minHeight: 48,
  },
  borderDefault: {
    borderColor: colors.border,
  },
  borderFocused: {
    borderColor: colors.primary,
  },
  borderError: {
    borderColor: colors.error,
  },
  iconContainer: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    color: colors.foreground,
    fontSize: 16,
    paddingVertical: 12,
    minHeight: 40,
  },
  passwordToggle: {
    marginLeft: 8,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
    fontWeight: '500',
  },
});
