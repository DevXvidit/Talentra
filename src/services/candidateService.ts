import { apiClient } from './apiClient';
import { User } from '../types';

export interface CandidateProfileResponse {
  success: boolean;
  user: User;
}

export interface UpdateAvatarParams {
  uri: string;
  name: string;
  type: string;
}

export interface CompleteProfileParams {
  name: string;
  phone: string;
  location: string;
  title: string;
  experience: string;
  resume?: { uri: string; name: string; type: string };
}

export interface UpdateResumeParams {
  name: string;
  phone: string;
  location: string;
  experience: string;
  resume: { uri: string; name: string; type: string };
}

export const candidateService = {
  updateAvatar: async (params: UpdateAvatarParams): Promise<CandidateProfileResponse> => {
    const formData = new FormData();
    formData.append('avatar', {
      uri: params.uri,
      name: params.name,
      type: params.type,
    } as any);

    const response = await apiClient.patch('/candidate/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return {
      success: response.data.success,
      user: response.data.user,
    };
  },

  completeProfile: async (params: CompleteProfileParams): Promise<CandidateProfileResponse> => {
    const formData = new FormData();
    formData.append('name', params.name.trim());
    formData.append('phone', `+91${params.phone.trim()}`);
    formData.append('location', params.location.trim());
    formData.append('title', params.title.trim());
    formData.append('experience', params.experience.trim());

    if (params.resume && !params.resume.uri.startsWith('http')) {
      formData.append('resume', {
        uri: params.resume.uri,
        name: params.resume.name,
        type: params.resume.type,
      } as any);
    }

    const response = await apiClient.patch('/candidate/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return {
      success: response.data.success,
      user: response.data.user,
    };
  },

  updateResume: async (params: UpdateResumeParams): Promise<CandidateProfileResponse> => {
    const formData = new FormData();
    formData.append('name', params.name);
    formData.append('phone', params.phone);
    formData.append('location', params.location);
    formData.append('experience', params.experience);
    formData.append('resume', {
      uri: params.resume.uri,
      name: params.resume.name,
      type: params.resume.type,
    } as any);

    const response = await apiClient.patch('/candidate/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return {
      success: response.data.success,
      user: response.data.user,
    };
  },
};
