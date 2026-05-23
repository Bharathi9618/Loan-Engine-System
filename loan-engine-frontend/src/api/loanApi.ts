import { apiClient } from './client';
import type { EligibilityResult, LoanApplicationRequest, LoanApplicationSummary, Rule, AnalyticsData } from '../types';

export const loanApi = {
  apply: (data: LoanApplicationRequest) =>
    apiClient.post<EligibilityResult>('/loan/apply', data),

  getResult: (id: number) =>
    apiClient.get<EligibilityResult>(`/loan/result/${id}`),

  getMyApplications: () =>
    apiClient.get<LoanApplicationSummary[]>('/loan/my-applications'),
};

export const adminApi = {
  getRules: () => apiClient.get<Rule[]>('/admin/rules'),
  createRule: (data: Omit<Rule, 'id'>) => apiClient.post<Rule>('/admin/rules', data),
  updateRule: (id: number, data: Omit<Rule, 'id'>) => apiClient.put<Rule>(`/admin/rules/${id}`, data),
  deleteRule: (id: number) => apiClient.delete(`/admin/rules/${id}`),
  getAnalytics: () => apiClient.get<AnalyticsData>('/admin/analytics'),
};
