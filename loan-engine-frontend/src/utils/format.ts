export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export const formatPercent = (value: number): string => `${value.toFixed(1)}%`;

export const outcomeColor = (outcome: string): string => {
  switch (outcome) {
    case 'APPROVED':
      return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    case 'REJECTED':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'REVIEW':
      return 'text-amber-600 bg-amber-50 border-amber-200';
    default:
      return 'text-slate-600 bg-slate-50 border-slate-200';
  }
};
