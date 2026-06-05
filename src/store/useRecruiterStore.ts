import { create } from 'zustand';
import { recruiterService, RecruiterJobsParams, ApplicantsParams, UpdateApplicationStatusParams, RecruiterProfileParams, CompanyParams } from '../services/recruiterService';
import { authService } from '../services/authService';
import { User } from '../types';

interface RecruiterState {
  jobs: any[];
  stats: {
    activeJobsCount: number;
    totalJobsCount: number;
    totalFilledPositions: number;
    totalPositions: number;
    totalApplicants: number;
  };
  applicants: any[];
  jobMeta: any | null;

  jobsPage: number;
  jobsTotalPages: number;
  applicantsPage: number;
  applicantsTotalPages: number;

  isLoading: boolean;
  isLoadingMore: boolean;
  isRefreshing: boolean;
  error: string | null;

  fetchJobs: (params?: RecruiterJobsParams, options?: { isRefresh?: boolean; isSilent?: boolean }) => Promise<void>;
  fetchApplicants: (params: ApplicantsParams) => Promise<void>;
  updateApplicationStatus: (params: UpdateApplicationStatusParams) => Promise<void>;
  updateProfile: (params: RecruiterProfileParams) => Promise<void>;
  createCompany: (params: CompanyParams) => Promise<void>;
  updateCompany: (companyId: string, params: CompanyParams) => Promise<void>;
  fetchStats: () => Promise<{ jobsCount: number; applicationsCount: number }>;
  refreshUser: () => Promise<User>;
  clearError: () => void;
}

export const useRecruiterStore = create<RecruiterState>((set, get) => ({
  jobs: [],
  stats: {
    activeJobsCount: 0,
    totalJobsCount: 0,
    totalFilledPositions: 0,
    totalPositions: 0,
    totalApplicants: 0,
  },
  applicants: [],
  jobMeta: null,

  jobsPage: 1,
  jobsTotalPages: 1,
  applicantsPage: 1,
  applicantsTotalPages: 1,

  isLoading: false,
  isLoadingMore: false,
  isRefreshing: false,
  error: null,

  fetchJobs: async (params = {}, options = {}) => {
    const { isRefresh, isSilent } = options;
    const pageNum = params.page || 1;

    if (isRefresh) set({ isRefreshing: true });
    else if (pageNum === 1 && !isSilent) set({ isLoading: true, error: null });
    else if (pageNum > 1) set({ isLoadingMore: true });

    try {
      const response = await recruiterService.fetchJobs(params);

      if (pageNum === 1) {
        set({ jobs: response.jobs });
      } else {
        set({ jobs: [...get().jobs, ...response.jobs] });
      }
      set({
        stats: response.stats,
        jobsPage: pageNum,
        jobsTotalPages: response.pagination.totalPages,
      });
    } catch (error: any) {
      if (pageNum === 1) {
        set({ error: error.response?.data?.message || error.message || 'Failed to load your job posts.' });
      }
      throw error;
    } finally {
      set({ isLoading: false, isRefreshing: false, isLoadingMore: false });
    }
  },

  fetchApplicants: async (params: ApplicantsParams) => {
    const pageNum = params.page || 1;
    if (pageNum === 1) set({ isLoading: true });
    else set({ isLoadingMore: true });

    try {
      const response = await recruiterService.fetchApplicants(params);

      if (pageNum === 1) {
        set({ applicants: response.applicants });
      } else {
        set({ applicants: [...get().applicants, ...response.applicants] });
      }
      if (response.job) {
        set({ jobMeta: response.job });
      }
      set({
        applicantsPage: pageNum,
        applicantsTotalPages: response.pagination.totalPages,
      });
    } catch (error: any) {
      console.warn('Failed to load applicants:', error);
      throw error;
    } finally {
      set({ isLoading: false, isLoadingMore: false });
    }
  },

  updateApplicationStatus: async (params: UpdateApplicationStatusParams) => {
    try {
      set({ isLoading: true });
      await recruiterService.updateApplicationStatus(params);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to update applicant status.';
      set({ error: msg });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (params: RecruiterProfileParams) => {
    try {
      set({ isLoading: true, error: null });
      await recruiterService.updateProfile(params);
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Failed to update profile.';
      set({ error: msg });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  createCompany: async (params: CompanyParams) => {
    try {
      set({ isLoading: true, error: null });
      await recruiterService.createCompany(params);
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Failed to create company.';
      set({ error: msg });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateCompany: async (companyId: string, params: CompanyParams) => {
    try {
      set({ isLoading: true, error: null });
      await recruiterService.updateCompany(companyId, params);
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Failed to update company.';
      set({ error: msg });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchStats: async () => {
    try {
      set({ isLoading: true });
      const stats = await recruiterService.fetchStats();
      return stats;
    } catch (error: any) {
      console.warn('Failed to load recruiter stats:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  refreshUser: async () => {
    try {
      const response = await authService.getMe();
      return response.user;
    } catch (error: any) {
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
