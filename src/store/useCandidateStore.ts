import { create } from 'zustand';
import { User } from '../types';
import { candidateService, CompleteProfileParams, UpdateResumeParams, UpdateAvatarParams } from '../services/candidateService';
import { authService } from '../services/authService';

interface CandidateState {
  isLoading: boolean;
  error: string | null;

  updateAvatar: (params: UpdateAvatarParams) => Promise<User>;
  completeProfile: (params: CompleteProfileParams) => Promise<User>;
  updateResume: (params: UpdateResumeParams) => Promise<User>;
  fetchProfileStats: () => Promise<User>;
  clearError: () => void;
}

export const useCandidateStore = create<CandidateState>((set) => ({
  isLoading: false,
  error: null,

  updateAvatar: async (params: UpdateAvatarParams) => {
    try {
      set({ isLoading: true, error: null });
      const response = await candidateService.updateAvatar(params);
      if (response.success && response.user) {
        return response.user;
      }
      throw new Error('Failed to update profile picture.');
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Failed to update profile picture.';
      set({ error: msg });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  completeProfile: async (params: CompleteProfileParams) => {
    try {
      set({ isLoading: true, error: null });
      const response = await candidateService.completeProfile(params);
      if (response.success && response.user) {
        return response.user;
      }
      throw new Error('Failed to save profile. Please check inputs and try again.');
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'An error occurred during submission.';
      set({ error: msg });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateResume: async (params: UpdateResumeParams) => {
    try {
      set({ isLoading: true, error: null });
      const response = await candidateService.updateResume(params);
      if (response.success && response.user) {
        return response.user;
      }
      throw new Error('Failed to update resume.');
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Failed to update resume.';
      set({ error: msg });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchProfileStats: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await authService.getMe();
      return response.user;
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Failed to retrieve profile details.';
      set({ error: msg });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
