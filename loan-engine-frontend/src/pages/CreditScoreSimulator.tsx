import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function CreditScoreSimulator() {
  const [score, setScore] = useState(720);
  const [missedPayments, setMissedPayments] = useState(0);
  const [creditUtilization, setCreditUtilization] = useState(30);
  const [newAccounts, setNewAccounts] = useState(0);

  const simulatedScore = useMemo(() => {
    let s = score;
    s -= missedPayments * 35;
    if (creditUtilization > 70) s -= 40;
    else if (creditUtilization > 50) s -= 20;
    else if (creditUtilization < 30) s += 10;
    s -= newAccounts * 15;
    return Math.max(300, Math.min(900, s));
  }, [score, missedPayments, creditUtilization, newAccounts]);

  const impact = simulatedScore - score;
  const eligibility =
    simulatedScore >= 750 ? 'Excellent — High approval chance' :
    simulatedScore >= 650 ? 'Good — Likely approved' :
    simulatedScore >= 550 ? 'Fair — Manual review likely' :
    'Poor — Low approval chance';

  const scoreColor =
    simulatedScore >= 750 ? 'text-emerald-600' :
    simulatedScore >= 650 ? 'text-primary-600' :
    simulatedScore >= 550 ? 'text-amber-600' : 'text-red-600';

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card">
        <h1 className="text-3xl font-bold mb-2">Credit Score Simulator</h1>
        <p className="text-slate-500 mb-8">See how financial behaviors affect your credit score</p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Current Credit Score: {score}</label>
            <input type="range" min={300} max={900} value={score} onChange={(e) => setScore(+e.target.value)} className="w-full accent-primary-600" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Missed Payments (last 12 months): {missedPayments}</label>
            <input type="range" min={0} max={6} value={missedPayments} onChange={(e) => setMissedPayments(+e.target.value)} className="w-full accent-primary-600" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Credit Utilization: {creditUtilization}%</label>
            <input type="range" min={0} max={100} value={creditUtilization} onChange={(e) => setCreditUtilization(+e.target.value)} className="w-full accent-primary-600" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">New Credit Accounts: {newAccounts}</label>
            <input type="range" min={0} max={5} value={newAccounts} onChange={(e) => setNewAccounts(+e.target.value)} className="w-full accent-primary-600" />
          </div>
        </div>

        <motion.div
          key={simulatedScore}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="mt-10 text-center p-6 bg-slate-50 rounded-xl"
        >
          <p className="text-sm text-slate-500 mb-1">Simulated Score</p>
          <p className={`text-5xl font-bold ${scoreColor}`}>{simulatedScore}</p>
          <p className={`text-sm mt-2 ${impact >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {impact >= 0 ? '+' : ''}{impact} points from current
          </p>
          <p className="mt-4 font-medium text-slate-700">{eligibility}</p>
        </motion.div>

        <div className="mt-8 text-center">
          <Link to="/apply" className="btn-primary">Apply with This Profile</Link>
        </div>
      </motion.div>
    </div>
  );
}
