import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemeColors } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

export interface PageDotsProps {
  total?: number;
  active?: number;
  onPressDot?: (index: number) => void;
}

export const PageDots = ({ total = 3, active = 0, onPressDot }: PageDotsProps) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, i) => (
        <TouchableOpacity
          key={i}
          activeOpacity={0.8}
          onPress={() => onPressDot?.(i)}
          style={[
            styles.dot,
            i === active ? styles.activeDot : styles.inactiveDot
          ]}
        />
      ))}
    </View>
  );
};

export default PageDots;

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 8,
  },
  activeDot: {
    width: 28,
    backgroundColor: colors.primary,
  },
  inactiveDot: {
    width: 8,
    backgroundColor: colors.muted,
  },
});
