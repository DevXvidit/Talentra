import { apiClient } from './apiClient';
import { User } from '../types';

export interface RecruiterJobsParams {
  page?: number;
  limit?: number;
}

export interface RecruiterJobsResponse {
  jobs: any[];
  pagination: { totalPages: number };
  stats: {
    activeJobsCount: number;
    totalJobsCount: number;
    totalFilledPositions: number;
    totalPositions: number;
    totalApplicants: number;
  };
}

export interface ApplicantsParams {
  jobId: string;
  page?: number;
  limit?: number;
}

export interface ApplicantsResponse {
  applicants: any[];
  pagination: { totalPages: number };
  job?: any;
}

export interface UpdateApplicationStatusParams {
  applicationId: string;
  status: string;
}

export interface RecruiterProfileParams {
  name: string;
  phone: string;
  location: string;
  recruiterTitle: string;
  about: string;
  avatar?: { uri: string; name: string; type: string };
}

export interface CompanyParams {
  name: string;
  website: string;
  headquarters: string;
  industry: string;
  size: string;
  phone: string;
  logo?: { uri: string; name: string; type: string };
}

export const recruiterService = {
  fetchJobs: async (params: RecruiterJobsParams = {}): Promise<RecruiterJobsResponse> => {
    const response = await apiClient.get('/recruiter/jobs', { params });
    return {
      jobs: response.data.data || [],
      pagination: response.data.pagination || { totalPages: 1 },
      stats: response.data.stats || {
        activeJobsCount: 0,
        totalJobsCount: 0,
        totalFilledPositions: 0,
        totalPositions: 0,
        totalApplicants: 0,
      },
    };
  },

  fetchApplicants: async (params: ApplicantsParams): Promise<ApplicantsResponse> => {
    const response = await apiClient.get(`/recruiter/jobs/${params.jobId}/applicants`, {
      params: { page: params.page || 1, limit: params.limit || 10 },
    });
    return {
      applicants: response.data.data || [],
      pagination: response.data.pagination || { totalPages: 1 },
      job: response.data.job || null,
    };
  },

  updateApplicationStatus: async (params: UpdateApplicationStatusParams): Promise<void> => {
    await apiClient.patch(`/recruiter/applications/${params.applicationId}`, { status: params.status });
  },

  updateProfile: async (params: RecruiterProfileParams): Promise<void> => {
    const formData = new FormData();
    formData.append('name', params.name.trim());
    formData.append('phone', `+91${params.phone.trim()}`);
    formData.append('location', params.location.trim());
    formData.append('recruiterTitle', params.recruiterTitle.trim());
    formData.append('about', params.about.trim());

    if (params.avatar) {
      formData.append('avatar', {
        uri: params.avatar.uri,
        name: params.avatar.name,
        type: params.avatar.type,
      } as any);
    }

    await apiClient.patch('/recruiter/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  createCompany: async (params: CompanyParams): Promise<void> => {
    const formData = new FormData();
    formData.append('name', params.name.trim());
    formData.append('website', params.website.trim());
    formData.append('headquarters', params.headquarters.trim());
    formData.append('industry', params.industry.trim());
    formData.append('size', params.size);
    formData.append('phone', `+91${params.phone.trim()}`);

    if (params.logo) {
      formData.append('logo', {
        uri: params.logo.uri,
        name: params.logo.name,
        type: params.logo.type,
      } as any);
    }

    await apiClient.post('/recruiter/companies', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  updateCompany: async (companyId: string, params: CompanyParams): Promise<void> => {
    const formData = new FormData();
    formData.append('name', params.name.trim());
    formData.append('website', params.website.trim());
    formData.append('headquarters', params.headquarters.trim());
    formData.append('industry', params.industry.trim());
    formData.append('size', params.size);
    formData.append('phone', `+91${params.phone.trim()}`);

    if (params.logo) {
      formData.append('logo', {
        uri: params.logo.uri,
        name: params.logo.name,
        type: params.logo.type,
      } as any);
    }

    await apiClient.patch(`/recruiter/companies/${companyId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  fetchStats: async (): Promise<{ jobsCount: number; applicationsCount: number }> => {
    const response = await apiClient.get('/recruiter/jobs');
    const myJobs = response.data.data || [];
    const jobsCount = myJobs.length;
    const applicationsCount = myJobs.reduce((total: number, job: any) => total + (job.applicantCount || 0), 0);
    return { jobsCount, applicationsCount };
  },
};
