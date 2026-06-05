import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, PlusCircle, User } from 'lucide-react-native';
import { ROUTES } from '../constants/screens';
import { SHADOWS, ThemeColors } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import { RecruiterTabParamList } from '../types';
import { RecruiterJobFeedScreen } from '../screens/recruiter/RecruiterJobFeed';
import { PostJobScreen } from '../screens/recruiter/PostJob';
import { RecruiterProfileScreen } from '../screens/recruiter/RecruiterProfile';

const Tab = createBottomTabNavigator<RecruiterTabParamList>();

export const RecruiterTabNavigator = () => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const bottomInset = insets.bottom > 0 ? insets.bottom : 12;
  const tabBarHeight = 60 + bottomInset;
  const styles = getStyles(colors, isDark);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: [
          styles.tabBar,
          {
            paddingBottom: bottomInset,
            height: tabBarHeight,
          },
        ],
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tab.Screen
        name={ROUTES.RECRUITER_JOB_FEED}
        component={RecruiterJobFeedScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name={ROUTES.RECRUITER_POST_JOB}
        component={PostJobScreen}
        options={{
          tabBarLabel: 'Post Job',
          tabBarIcon: ({ color, size }) => <PlusCircle size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name={ROUTES.RECRUITER_PROFILE}
        component={RecruiterProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

const getStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  tabBar: {
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    ...(isDark ? {} : SHADOWS.sm),
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Inter',
    marginTop: 2,
  },
  tabBarItem: {
    paddingVertical: 4,
  },
});

export default RecruiterTabNavigator;
