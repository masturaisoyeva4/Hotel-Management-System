import api from '../lib/api';
import { User, ApiResponse } from '../types';

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const usersService = {
  updateProfile: (payload: UpdateProfilePayload) =>
    api.put<ApiResponse<User>>('/users/me', payload).then((r) => r.data.data),

  changePassword: (payload: ChangePasswordPayload) =>
    api.put('/users/me/password', payload).then((r) => r.data),
};
