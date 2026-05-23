import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { adminApi } from '../api/loanApi';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import type { AnalyticsData, Rule } from '../types';
import { getErrorMessage } from '../api/client';

const emptyRule = {
  name: '',
  fieldName: 'creditScore',
  operator: 'GTE',
  thresholdValue: '',
  weight: 10,
  priority: 1,
  active: true,
  description: '',
};

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [rules, setRules] = useState<Rule[]>([]);
  const [form, setForm] = useState(emptyRule);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState<'overview' | 'rules'>('overview');

  const loadData = async () => {
    try {
      const [a, r] = await Promise.all([adminApi.getAnalytics(), adminApi.getRules()]);
      setAnalytics(a.data);
      setRules(r.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.createRule(form);
      setForm(emptyRule);
      setShowForm(false);
      const { data } = await adminApi.getRules();
      setRules(data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const toggleActive = async (rule: Rule) => {
    await adminApi.updateRule(rule.id, { ...rule, active: !rule.active });
    const { data } = await adminApi.getRules();
    setRules(data);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this rule?')) return;
    await adminApi.deleteRule(id);
    const { data } = await adminApi.getRules();
    setRules(data);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        <div className="flex gap-2 mb-8">
          <button onClick={() => setTab('overview')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'overview' ? 'bg-primary-600 text-white' : 'bg-slate-100'}`}>Overview</button>
          <button onClick={() => setTab('rules')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'rules' ? 'bg-primary-600 text-white' : 'bg-slate-100'}`}>Rules</button>
          <Link to="/admin/analytics" className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-100 hover:bg-slate-200">Analytics →</Link>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">{error}</div>}

        {tab === 'overview' && (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {[
                { label: 'Applications', value: analytics?.totalApplications ?? 0 },
                { label: 'Users', value: analytics?.totalUsers ?? 0 },
                { label: 'Rules', value: analytics?.totalRules ?? 0 },
                { label: 'Avg Score', value: analytics?.averageScore ?? 0 },
              ].map((s) => (
                <div key={s.label} className="card text-center">
                  <p className="text-3xl font-bold text-primary-600">{s.value}</p>
                  <p className="text-sm text-slate-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
            <Link to="/admin/analytics" className="card block hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg mb-2">View Full Analytics</h3>
              <p className="text-slate-500 text-sm">Charts, outcome distribution, and monthly trends</p>
            </Link>
          </>
        )}

        {tab === 'rules' && (
          <>
            <div className="flex justify-end mb-4">
              <button onClick={() => setShowForm(!showForm)} className="btn-primary">{showForm ? 'Cancel' : 'Add Rule'}</button>
            </div>
            {showForm && (
              <form onSubmit={handleCreate} className="card mb-6 grid md:grid-cols-2 gap-4">
                <input className="input-field" placeholder="Rule Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                <input className="input-field" placeholder="Field" value={form.fieldName} onChange={(e) => setForm({ ...form, fieldName: e.target.value })} required />
                <select className="input-field" value={form.operator} onChange={(e) => setForm({ ...form, operator: e.target.value })}>
                  {['GTE', 'LTE', 'GT', 'LT', 'EQ'].map((op) => <option key={op} value={op}>{op}</option>)}
                </select>
                <input className="input-field" placeholder="Threshold" value={form.thresholdValue} onChange={(e) => setForm({ ...form, thresholdValue: e.target.value })} required />
                <input type="number" className="input-field" placeholder="Weight" value={form.weight} onChange={(e) => setForm({ ...form, weight: +e.target.value })} />
                <input type="number" className="input-field" placeholder="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: +e.target.value })} />
                <button type="submit" className="btn-primary md:col-span-2">Create Rule</button>
              </form>
            )}
            <div className="space-y-3">
              {rules.map((rule) => (
                <div key={rule.id} className="card flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{rule.name}</h3>
                    <p className="text-sm text-slate-500">{rule.fieldName} {rule.operator} {rule.thresholdValue} · W:{rule.weight} · P:{rule.priority}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => toggleActive(rule)} className="btn-secondary text-sm py-1 px-3">{rule.active ? 'Disable' : 'Enable'}</button>
                    <button onClick={() => handleDelete(rule.id)} className="text-red-500 text-sm">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
