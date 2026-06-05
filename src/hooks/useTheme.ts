import { useColorScheme } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';
import { LIGHT_COLORS, DARK_COLORS, ThemeColors } from '../constants/theme';

export const useTheme = () => {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const systemColorScheme = useColorScheme();

  const isDark = theme === 'system' ? systemColorScheme === 'dark' : theme === 'dark';
  const colors: ThemeColors = isDark ? DARK_COLORS : LIGHT_COLORS;

  return {
    theme,
    isDark,
    colors,
    setTheme,
  };
};
