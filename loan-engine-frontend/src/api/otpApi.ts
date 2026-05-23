import { apiClient } from './client';

export const otpApi = {
  resend: (email: string, type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET') =>
    apiClient.post('/otp/resend', { email, type }),
};
