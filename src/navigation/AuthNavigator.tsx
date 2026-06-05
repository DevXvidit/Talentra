import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getHasCompletedOnboarding } from '../utils/storage';
import { ROUTES } from '../constants/screens';
import { AuthStackParamList } from '../types';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => {
  const hasCompletedOnboarding = getHasCompletedOnboarding();

  return (
    <Stack.Navigator
      initialRouteName={hasCompletedOnboarding ? ROUTES.LOGIN : ROUTES.ONBOARDING}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name={ROUTES.ONBOARDING} component={OnboardingScreen} />
      <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
      <Stack.Screen name={ROUTES.REGISTER} component={RegisterScreen} />
    </Stack.Navigator>
  );
};
