import { create } from 'zustand';
import { Job, Pagination } from '../types';
import { jobService, FetchJobsParams, FetchBookmarksParams, CreateJobPayload, UpdateJobPayload, ApplyJobPayload } from '../services/jobService';

interface JobState {
  jobs: Job[];
  bookmarks: Job[];
  categories: string[];
  jobDetail: any | null;

  jobsPage: number;
  jobsTotalPages: number;
  bookmarksPage: number;
  bookmarksTotalPages: number;

  isLoading: boolean;
  isLoadingMore: boolean;
  isSearching: boolean;
  isRefreshing: boolean;
  error: string | null;

  fetchJobs: (params: FetchJobsParams, options?: { isRefresh?: boolean; isFullLoad?: boolean; isSearching?: boolean }) => Promise<void>;
  fetchBookmarks: (params: FetchBookmarksParams, options?: { isRefresh?: boolean; isFullLoad?: boolean; isSearching?: boolean }) => Promise<void>;
  fetchJobById: (jobId: string) => Promise<any>;
  fetchCategories: () => Promise<void>;
  toggleBookmark: (jobId: string) => Promise<boolean>;
  createJob: (payload: CreateJobPayload) => Promise<void>;
  updateJob: (jobId: string, payload: UpdateJobPayload) => Promise<void>;
  applyToJob: (params: ApplyJobPayload) => Promise<void>;
  clearError: () => void;
}

export const useJobStore = create<JobState>((set, get) => ({
  jobs: [],
  bookmarks: [],
  categories: [],
  jobDetail: null,

  jobsPage: 1,
  jobsTotalPages: 1,
  bookmarksPage: 1,
  bookmarksTotalPages: 1,

  isLoading: false,
  isLoadingMore: false,
  isSearching: false,
  isRefreshing: false,
  error: null,

  fetchJobs: async (params, options = {}) => {
    const { isRefresh, isFullLoad, isSearching: searching } = options;
    const pageNum = params.page || 1;

    if (isRefresh) set({ isRefreshing: true });
    else if (pageNum === 1 && isFullLoad) set({ isLoading: true, error: null });
    else if (pageNum === 1 && searching) set({ isSearching: true });
    else if (pageNum > 1) set({ isLoadingMore: true });

    try {
      const response = await jobService.fetchJobs(params);

      if (pageNum === 1) {
        set({ jobs: response.jobs });
      } else {
        set({ jobs: [...get().jobs, ...response.jobs] });
      }
      set({
        jobsPage: pageNum,
        jobsTotalPages: response.pagination.totalPages,
      });
    } catch (error: any) {
      if (pageNum === 1) {
        set({ error: error.response?.data?.message || error.message || 'Failed to load jobs.' });
      }
      throw error;
    } finally {
      set({ isLoading: false, isLoadingMore: false, isSearching: false, isRefreshing: false });
    }
  },

  fetchBookmarks: async (params, options = {}) => {
    const { isRefresh, isFullLoad, isSearching: searching } = options;
    const pageNum = params.page || 1;

    if (isRefresh) set({ isRefreshing: true });
    else if (pageNum === 1 && isFullLoad) set({ isLoading: true, error: null });
    else if (pageNum === 1 && searching) set({ isSearching: true });
    else if (pageNum > 1) set({ isLoadingMore: true });

    try {
      const response = await jobService.fetchBookmarks(params);

      if (pageNum === 1) {
        set({ bookmarks: response.jobs });
      } else {
        set({ bookmarks: [...get().bookmarks, ...response.jobs] });
      }
      set({
        bookmarksPage: pageNum,
        bookmarksTotalPages: response.pagination.totalPages,
      });
    } catch (error: any) {
      if (error.response?.status === 401) return;
      if (pageNum === 1) {
        set({ error: error.response?.data?.message || error.message || 'Failed to sync saved jobs.' });
      }
      throw error;
    } finally {
      set({ isLoading: false, isLoadingMore: false, isSearching: false, isRefreshing: false });
    }
  },

  fetchJobById: async (jobId: string) => {
    try {
      const data = await jobService.fetchJobById(jobId);
      set({ jobDetail: data });
      return data;
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Failed to load job details.';
      set({ error: msg });
      throw error;
    }
  },

  fetchCategories: async () => {
    try {
      const categories = await jobService.fetchCategories();
      set({ categories });
    } catch (error: any) {
      console.warn('Failed to fetch categories:', error);
    }
  },

  toggleBookmark: async (jobId: string) => {
    try {
      const response = await jobService.toggleBookmark(jobId);
      return response.isBookmarked;
    } catch (error: any) {
      throw error;
    }
  },

  createJob: async (payload: CreateJobPayload) => {
    try {
      set({ isLoading: true, error: null });
      await jobService.createJob(payload);
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to submit job listing. Please try again.';
      set({ error: msg });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateJob: async (jobId: string, payload: UpdateJobPayload) => {
    try {
      set({ isLoading: true, error: null });
      await jobService.updateJob(jobId, payload);
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to update job listing. Please try again.';
      set({ error: msg });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  applyToJob: async (params: ApplyJobPayload) => {
    try {
      await jobService.applyToJob(params);
    } catch (error: any) {
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
