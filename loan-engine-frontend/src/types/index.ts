export type Role = 'USER' | 'ADMIN';

export type DecisionOutcome = 'APPROVED' | 'REJECTED' | 'REVIEW';

export interface User {
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}

export interface AuthResponse {
  token?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: Role;
  message?: string;
}

export interface LoanApplicationRequest {
  loanAmount: number;
  tenureMonths: number;
  annualIncome: number;
  existingEmi: number;
  creditScore: number;
  employmentType: string;
  employmentYears: number;
  loanPurpose?: string;
}

export interface RuleEvaluationDetail {
  ruleName: string;
  passed: boolean;
  weightEarned: number;
  weightMax: number;
  reason: string;
}

export interface EligibilityResult {
  applicationId: number;
  outcome: DecisionOutcome;
  score: number;
  maxScore: number;
  scorePercentage: number;
  message: string;
  details?: RuleEvaluationDetail[];
  evaluatedAt?: string;
  loanAmount: number;
  tenureMonths: number;
  creditScore: number;
}

export interface Rule {
  id: number;
  name: string;
  fieldName: string;
  operator: string;
  thresholdValue: string;
  weight: number;
  priority: number;
  active: boolean;
  description?: string;
}

export interface AnalyticsData {
  totalApplications: number;
  totalUsers: number;
  totalRules: number;
  outcomeDistribution: Record<string, number>;
  monthlyApplications: { month: string; count: number }[];
  averageScore: number;
  rulePerformance: { ruleName: string; passCount: number }[];
}

export interface LoanApplicationSummary {
  id: number;
  loanAmount: number;
  tenureMonths: number;
  creditScore: number;
  createdAt: string;
}
