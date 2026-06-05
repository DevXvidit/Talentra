import { ROUTES, JOB_TYPES } from '../constants';

export type UserRole = 'candidate' | 'recruiter';

export interface Company {
  _id: string;
  name: string;
  description?: string;
  industry?: string;
  size?: string;
  email?: string;
  phone?: string;
  website?: string;
  linkedIn?: string;
  logoUrl?: string;
  bannerUrl?: string;
  headquarters?: string;
  country?: string;
  foundedYear?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  bookmarks?: string[];
  phone?: string;
  location?: string;
  experience?: number;
  resumeUrl?: string;
  resumeName?: string;
  title?: string;
  recruiterTitle?: string;
  about?: string;
  companyId?: Company | string | null;
  profileCompletionPercentage?: number;
  isProfileComplete?: boolean;
  stats?: {
    applied: number;
    hired: number;
    saved: number;
  };
  createdAt: string;
  updatedAt: string;
}

export type JobType = typeof JOB_TYPES[keyof typeof JOB_TYPES];

export interface Company {
  id: string;
  name: string;
  logoUrl?: string;
  headquarters?: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  salary: string;
  location: string;
  hasApplied?: boolean;
  applicationStatus?: string | null;
  type: JobType;
  category: string;
  company: Company;
  isBookmarked: boolean;
  totalPositions?: number;
  filledPositions?: number;
  createdAt: string;
}

export interface Pagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface Application {
  _id: string;
  jobId: string;
  candidateId: string;
  status: 'applied' | 'reviewed' | 'rejected' | 'accepted';
  resumeUrl: string;
  createdAt: string;
  updatedAt: string;
}

export type AuthStackParamList = {
  [ROUTES.ONBOARDING]: undefined;
  [ROUTES.LOGIN]: { role?: UserRole };
  [ROUTES.REGISTER]: { role?: UserRole };
};

export type CandidateTabParamList = {
  [ROUTES.CANDIDATE_JOB_FEED]: undefined;
  [ROUTES.CANDIDATE_SAVED_JOBS]: undefined;
  [ROUTES.CANDIDATE_PROFILE]: undefined;
};

export type RecruiterTabParamList = {
  [ROUTES.RECRUITER_JOB_FEED]: undefined;
  [ROUTES.RECRUITER_POST_JOB]: undefined;
  [ROUTES.RECRUITER_PROFILE]: undefined;
};

export type RootStackParamList = {
  AuthStack: undefined;
  [ROUTES.CANDIDATE_ROOT]: undefined;
  [ROUTES.RECRUITER_ROOT]: undefined;
  [ROUTES.JOB_DETAIL]: { jobId: string };
  [ROUTES.JOB_APPLICANTS_LIST]: { jobId: string };
  [ROUTES.CANDIDATE_COMPLETE_PROFILE]: undefined;
  [ROUTES.RECRUITER_COMPLETE_PROFILE]: undefined;
  [ROUTES.APPLICANT_REVIEW]: { applicationId: string; applicant?: any; jobId?: string };
};
