import { apiClient } from './apiClient';
import { Job, Pagination } from '../types';

export interface FetchJobsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  type?: string;
}

export interface FetchJobsResponse {
  jobs: Job[];
  pagination: Pagination;
}

export interface JobDetailResponse {
  job: any;
}

export interface BookmarkResponse {
  isBookmarked: boolean;
}

export interface FetchBookmarksParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface FetchBookmarksResponse {
  jobs: Job[];
  pagination: Pagination;
}

export interface CreateJobPayload {
  title: string;
  description: string;
  location: string;
  salary: string;
  type: string;
  category: string;
  mustHaveSkills: string[];
  responsibilities: string[];
  totalPositions: number;
}

export interface UpdateJobPayload extends CreateJobPayload {}

export interface ApplyJobPayload {
  jobId: string;
  coverLetter: string;
  resumeFile?: { uri: string; name: string; type: string };
  useSavedResume?: boolean;
}

export const jobService = {
  fetchJobs: async (params: FetchJobsParams): Promise<FetchJobsResponse> => {
    const response = await apiClient.get('/jobs', { params });
    const data = response.data.data;
    return {
      jobs: data.jobs || [],
      pagination: data.pagination || { totalPages: 1, totalItems: 0, currentPage: 1, limit: 10 },
    };
  },

  fetchJobById: async (jobId: string): Promise<any> => {
    const response = await apiClient.get(`/jobs/${jobId}`);
    return response.data.data;
  },

  fetchBookmarks: async (params: FetchBookmarksParams): Promise<FetchBookmarksResponse> => {
    const response = await apiClient.get('/jobs/bookmarks', { params });
    return {
      jobs: response.data.data || [],
      pagination: response.data.pagination || { totalPages: 1, totalItems: 0, currentPage: 1, limit: 10 },
    };
  },

  toggleBookmark: async (jobId: string): Promise<BookmarkResponse> => {
    const response = await apiClient.post(`/jobs/${jobId}/bookmark`);
    return { isBookmarked: response.data.isBookmarked };
  },

  fetchCategories: async (): Promise<string[]> => {
    const response = await apiClient.get('/jobs/categories');
    if (response.data?.success && Array.isArray(response.data?.data)) {
      return response.data.data;
    }
    return [];
  },

  createJob: async (payload: CreateJobPayload): Promise<void> => {
    await apiClient.post('/jobs', payload);
  },

  updateJob: async (jobId: string, payload: UpdateJobPayload): Promise<void> => {
    await apiClient.patch(`/jobs/${jobId}`, payload);
  },

  applyToJob: async (params: ApplyJobPayload): Promise<void> => {
    const formData = new FormData();
    formData.append('coverLetter', params.coverLetter);

    if (params.useSavedResume) {
      formData.append('useSavedResume', 'true');
    } else if (params.resumeFile) {
      formData.append('resume', {
        uri: params.resumeFile.uri,
        name: params.resumeFile.name,
        type: params.resumeFile.type,
      } as any);
    }

    await apiClient.post(`/jobs/${params.jobId}/apply`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
