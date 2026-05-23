import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { adminApi } from '../api/loanApi';
import { OutcomeChart } from '../components/charts/OutcomeChart';
import { MonthlyChart } from '../components/charts/MonthlyChart';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import type { AnalyticsData } from '../types';

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getAnalytics()
      .then(({ data: d }) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-semibold mb-4">Outcome Distribution</h3>
            <OutcomeChart data={data?.outcomeDistribution ?? {}} />
          </div>
          <div className="card">
            <h3 className="font-semibold mb-4">Monthly Applications</h3>
            <MonthlyChart data={data?.monthlyApplications ?? []} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
