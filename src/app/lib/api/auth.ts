import { apiFetch, apiUpload } from './client';
import type { ApiUser, LoginResponse, UserSession, UserSettingsPayload } from './types';

export const authApi = {
  login(email: string, password: string) {
    return apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      json: { email, password },
    });
  },

  me() {
    return apiFetch<ApiUser>('/auth/me');
  },

  changePassword(currentPassword: string, newPassword: string) {
    return apiFetch<LoginResponse>('/auth/change-password', {
      method: 'POST',
      json: { currentPassword, newPassword },
    });
  },

  getSettings() {
    return apiFetch<UserSettingsPayload>('/auth/settings');
  },

  updateSettings(payload: UserSettingsPayload) {
    return apiFetch<UserSettingsPayload>('/auth/settings', {
      method: 'POST',
      json: payload,
    });
  },

  updatePhoto(photoUrl: string) {
    return apiFetch<{ message: string; photoUrl: string }>('/auth/photo', {
      method: 'POST',
      json: { photoUrl },
    });
  },

  uploadPhotoFile(file: File) {
    const form = new FormData();
    form.append('file', file);
    return apiUpload<{ message: string; photoUrl: string }>('/auth/photo/upload', form);
  },

  enableTwoFactor() {
    return apiFetch<{ message: string; twoFactorEnabled: boolean }>('/auth/2fa/enable', {
      method: 'POST',
    });
  },

  sessions() {
    return apiFetch<UserSession[]>('/auth/sessions');
  },
};
