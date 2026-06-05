import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from '../constants/screens';
import { AuthNavigator } from './AuthNavigator';
import { CandidateTabNavigator } from './CandidateTabNavigator';
import { RecruiterTabNavigator } from './RecruiterTabNavigator';
import { CandidateCompleteProfileScreen } from '../screens/candidate/CandidateCompleteProfile';
import { RecruiterCompleteProfileScreen } from '../screens/recruiter/RecruiterCompleteProfile';
import { RootStackParamList } from '../types';
import { useAuthStore } from '../store/useAuthStore';
import { JobDetailScreen } from '../screens/shared/JobDetail';
import { JobApplicantsListScreen } from '../screens/recruiter/JobApplicantsList/JobApplicantsListScreen';
import { ApplicantReviewScreen } from '../screens/recruiter/ApplicantReview/ApplicantReviewScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="AuthStack" component={AuthNavigator} />
      ) : (
        <>
          {user?.role === 'recruiter' ? (
            <>
              <Stack.Screen name={ROUTES.RECRUITER_ROOT} component={RecruiterTabNavigator} />
              <Stack.Screen name={ROUTES.RECRUITER_COMPLETE_PROFILE} component={RecruiterCompleteProfileScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name={ROUTES.CANDIDATE_ROOT} component={CandidateTabNavigator} />
              <Stack.Screen name={ROUTES.CANDIDATE_COMPLETE_PROFILE} component={CandidateCompleteProfileScreen} />
            </>
          )}
          <Stack.Screen name={ROUTES.JOB_DETAIL} component={JobDetailScreen} />
          <Stack.Screen name={ROUTES.JOB_APPLICANTS_LIST} component={JobApplicantsListScreen} />
          <Stack.Screen name={ROUTES.APPLICANT_REVIEW} component={ApplicantReviewScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};
