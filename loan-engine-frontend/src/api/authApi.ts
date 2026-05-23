import { apiClient } from './client';
import type { AuthResponse } from '../types';

export const authApi = {
  register: (data: { email: string; password: string; firstName: string; lastName: string }) =>
    apiClient.post<AuthResponse>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    apiClient.post<AuthResponse>('/auth/login', data),

  verifyEmail: (data: { email: string; otp: string }) =>
    apiClient.post<AuthResponse>('/auth/verify-email', data),

  forgotPassword: (email: string) =>
    apiClient.post<AuthResponse>('/auth/forgot-password', { email }),

  verifyOtp: (data: { email: string; otp: string }) =>
    apiClient.post<AuthResponse>('/auth/verify-otp', data),

  resetPassword: (data: { email: string; otp: string; newPassword: string }) =>
    apiClient.post<AuthResponse>('/auth/reset-password', data),
};
