import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { loanApi } from '../api/loanApi';
import { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function ApplicationForm() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    loanAmount: 500000,
    tenureMonths: 60,
    annualIncome: 600000,
    existingEmi: 10000,
    creditScore: 720,
    employmentType: 'SALARIED',
    employmentYears: 3,
    loanPurpose: 'Home Renovation',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await loanApi.apply(form);
      navigate(`/result/${data.applicationId}`, { state: { result: data } });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
        <h2 className="text-2xl font-bold mb-2">Loan Application</h2>
        <p className="text-slate-500 mb-6">Submit your details for eligibility evaluation</p>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Loan Amount (₹)</label>
            <input type="number" className="input-field" value={form.loanAmount} onChange={(e) => setForm({ ...form, loanAmount: +e.target.value })} min={10000} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tenure (months)</label>
            <input type="number" className="input-field" value={form.tenureMonths} onChange={(e) => setForm({ ...form, tenureMonths: +e.target.value })} min={6} max={360} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Annual Income (₹)</label>
            <input type="number" className="input-field" value={form.annualIncome} onChange={(e) => setForm({ ...form, annualIncome: +e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Existing EMI (₹/month)</label>
            <input type="number" className="input-field" value={form.existingEmi} onChange={(e) => setForm({ ...form, existingEmi: +e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Credit Score</label>
            <input type="number" className="input-field" value={form.creditScore} onChange={(e) => setForm({ ...form, creditScore: +e.target.value })} min={300} max={900} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Employment Type</label>
            <select className="input-field" value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value })}>
              <option value="SALARIED">Salaried</option>
              <option value="SELF_EMPLOYED">Self Employed</option>
              <option value="BUSINESS">Business</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Years of Employment</label>
            <input type="number" className="input-field" value={form.employmentYears} onChange={(e) => setForm({ ...form, employmentYears: +e.target.value })} min={0} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Loan Purpose</label>
            <input className="input-field" value={form.loanPurpose} onChange={(e) => setForm({ ...form, loanPurpose: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Evaluating...' : 'Submit Application'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
