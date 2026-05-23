import { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { loanApi } from '../api/loanApi';
import { ScoreGauge } from '../components/charts/ScoreGauge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatCurrency, outcomeColor } from '../utils/format';
import type { EligibilityResult } from '../types';
import { getErrorMessage } from '../api/client';

export default function ApplicationResult() {
  const { id } = useParams();
  const location = useLocation();
  const [result, setResult] = useState<EligibilityResult | null>((location.state as { result?: EligibilityResult })?.result || null);
  const [loading, setLoading] = useState(!result);
  const [error, setError] = useState('');

  useEffect(() => {
    if (result || !id) return;
    loanApi.getResult(+id)
      .then(({ data }) => setResult(data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id, result]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-center py-20 text-red-600">{error}</div>;
  if (!result) return null;

  const pct = result.scorePercentage ?? (result.maxScore > 0 ? (result.score / result.maxScore) * 100 : 0);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card">
        <div className="text-center mb-8">
          <span className={`inline-block px-4 py-1 rounded-full border text-sm font-semibold ${outcomeColor(result.outcome)}`}>
            {result.outcome}
          </span>
          <h2 className="text-2xl font-bold mt-4">Eligibility Result</h2>
          <p className="text-slate-600 mt-2">{result.message}</p>
        </div>

        <div className="flex justify-center mb-8">
          <ScoreGauge score={result.score} maxScore={result.maxScore} percentage={pct} />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8 text-center">
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-500">Loan Amount</p>
            <p className="font-semibold">{formatCurrency(result.loanAmount)}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-500">Tenure</p>
            <p className="font-semibold">{result.tenureMonths} mo</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-500">Credit Score</p>
            <p className="font-semibold">{result.creditScore}</p>
          </div>
        </div>

        {result.details && result.details.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Rule Breakdown</h3>
            <div className="space-y-2">
              {result.details.map((d) => (
                <div key={d.ruleName} className="flex items-center justify-between p-3 rounded-lg border border-slate-100">
                  <div>
                    <p className="font-medium text-sm">{d.ruleName}</p>
                    <p className="text-xs text-slate-500">{d.reason}</p>
                  </div>
                  <span className={`text-sm font-semibold ${d.passed ? 'text-emerald-600' : 'text-red-500'}`}>
                    {d.weightEarned}/{d.weightMax}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex gap-4 justify-center">
          <Link to="/apply" className="btn-secondary">New Application</Link>
          <Link to="/dashboard" className="btn-primary">Dashboard</Link>
        </div>
      </motion.div>
    </div>
  );
}
