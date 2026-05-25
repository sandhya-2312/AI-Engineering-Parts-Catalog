import { apiFetch } from './client';
import type { ApiUser, UserRole } from './types';

export interface CreateUserPayload {
  email: string;
  fullName?: string;
  contactNo?: string;
  roleManual?: string;
  role?: UserRole;
  password?: string;
}

export interface CreateUserResponse {
  user: ApiUser;
  temporaryPassword?: string;
}

export interface AdminChangePasswordResponse {
  message: string;
  temporaryPassword?: string;
}

export const usersApi = {
  list() {
    return apiFetch<ApiUser[]>('/users');
  },

  create(payload: CreateUserPayload) {
    return apiFetch<CreateUserResponse>('/users', {
      method: 'POST',
      json: payload,
    });
  },

  updateRole(id: string, role: UserRole) {
    return apiFetch<ApiUser>(`/users/${id}/role`, {
      method: 'PATCH',
      json: { role },
    });
  },

  resetPassword(id: string, newPassword?: string) {
    return apiFetch<AdminChangePasswordResponse>(`/users/${id}/password`, {
      method: 'PATCH',
      json: newPassword ? { newPassword } : {},
    });
  },

  remove(id: string) {
    return apiFetch<{ message: string }>(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};
