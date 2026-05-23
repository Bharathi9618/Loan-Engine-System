import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { loanApi } from '../api/loanApi';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatCurrency } from '../utils/format';
import type { LoanApplicationSummary } from '../types';
import { getErrorMessage } from '../api/client';

export default function UserDashboard() {
  const { user } = useAuth();
  const [apps, setApps] = useState<LoanApplicationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loanApi.getMyApplications()
      .then(({ data }) => setApps(data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">Welcome, {user?.firstName}!</h1>
        <p className="text-slate-500 mb-8">Manage your loan applications</p>

        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          <Link to="/apply" className="card hover:shadow-md transition-shadow text-center">
            <div className="text-3xl mb-2">📝</div>
            <h3 className="font-semibold">New Application</h3>
            <p className="text-sm text-slate-500">Check your eligibility</p>
          </Link>
          <Link to="/comparison" className="card hover:shadow-md transition-shadow text-center">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="font-semibold">Loan Comparison</h3>
            <p className="text-sm text-slate-500">Compare loan options</p>
          </Link>
          <Link to="/simulator" className="card hover:shadow-md transition-shadow text-center">
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="font-semibold">Credit Simulator</h3>
            <p className="text-sm text-slate-500">Simulate score impact</p>
          </Link>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Your Applications</h2>
          {loading && <LoadingSpinner />}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && apps.length === 0 && (
            <p className="text-slate-500 text-center py-8">No applications yet. <Link to="/apply" className="text-primary-600">Apply now</Link></p>
          )}
          <div className="space-y-3">
            {apps.map((app) => (
              <Link key={app.id} to={`/result/${app.id}`} className="flex justify-between items-center p-4 rounded-lg border border-slate-100 hover:bg-slate-50 transition">
                <div>
                  <p className="font-medium">{formatCurrency(app.loanAmount)}</p>
                  <p className="text-sm text-slate-500">{app.tenureMonths} months · Score: {app.creditScore}</p>
                </div>
                <span className="text-primary-600 text-sm">View Result →</span>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
