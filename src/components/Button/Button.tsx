import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { ThemeColors } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  isDisabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
}

export const Button = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
}: ButtonProps) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const getContainerStyle = () => {
    const stylesArray: ViewStyle[] = [styles.base];
    
    if (size === 'sm') stylesArray.push(styles.sizeSm);
    else if (size === 'lg') stylesArray.push(styles.sizeLg);
    else stylesArray.push(styles.sizeMd);

    if (isDisabled) {
      stylesArray.push(styles.disabled);
    } else if (variant === 'primary') {
      stylesArray.push(styles.primary);
    } else if (variant === 'secondary') {
      stylesArray.push(styles.secondary);
    } else if (variant === 'outline') {
      stylesArray.push(styles.outline);
    } else if (variant === 'ghost') {
      stylesArray.push(styles.ghost);
    }

    if (style) {
      if (Array.isArray(style)) stylesArray.push(...style);
      else stylesArray.push(style);
    }

    return stylesArray;
  };

  const getTextStyle = () => {
    const textStylesArray: TextStyle[] = [styles.textBase];
    
    if (size === 'sm') textStylesArray.push(styles.textSm);
    else if (size === 'lg') textStylesArray.push(styles.textLg);
    else textStylesArray.push(styles.textMd);

    if (isDisabled) {
      textStylesArray.push(styles.textDisabled);
    } else if (variant === 'primary') {
      textStylesArray.push(styles.textPrimary);
    } else if (variant === 'secondary') {
      textStylesArray.push(styles.textSecondary);
    } else if (variant === 'outline' || variant === 'ghost') {
      textStylesArray.push(styles.textOutlineGhost);
    }

    if (textStyle) {
      if (Array.isArray(textStyle)) textStylesArray.push(...textStyle);
      else textStylesArray.push(textStyle);
    }

    return textStylesArray;
  };

  const handlePress = () => {
    if (!isLoading && !isDisabled) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled || isLoading}
      activeOpacity={0.8}
      style={getContainerStyle()}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : colors.primary} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
          <Text style={getTextStyle()}>{label}</Text>
          {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default Button;

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    minHeight: 48,
    minWidth: 48,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeSm: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sizeMd: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  sizeLg: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  disabled: {
    backgroundColor: colors.input,
    borderColor: colors.border,
    borderWidth: 1,
    opacity: 0.5,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: colors.primary,
    borderWidth: 1,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  textBase: {
    fontWeight: '600',
    textAlign: 'center',
  },
  textSm: {
    fontSize: 12,
  },
  textMd: {
    fontSize: 16,
  },
  textLg: {
    fontSize: 18,
  },
  textDisabled: {
    color: colors.mutedForeground,
  },
  textPrimary: {
    color: colors.primaryForeground,
  },
  textSecondary: {
    color: colors.foreground,
  },
  textOutlineGhost: {
    color: colors.primary,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
