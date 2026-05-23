import { useState } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../utils/format';

interface LoanOption {
  name: string;
  rate: number;
  processingFee: number;
}

const LOAN_OPTIONS: LoanOption[] = [
  { name: 'Standard Personal', rate: 12.5, processingFee: 1.5 },
  { name: 'Premium Personal', rate: 10.9, processingFee: 2.0 },
  { name: 'Quick Loan', rate: 14.0, processingFee: 0.5 },
  { name: 'Home Extension', rate: 9.5, processingFee: 1.0 },
];

function calculateEmi(principal: number, annualRate: number, months: number): number {
  const r = annualRate / 12 / 100;
  if (r === 0) return principal / months;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

export default function LoanComparison() {
  const [amount, setAmount] = useState(500000);
  const [tenure, setTenure] = useState(60);

  const comparisons = LOAN_OPTIONS.map((opt) => {
    const emi = calculateEmi(amount, opt.rate, tenure);
    const total = emi * tenure;
    const interest = total - amount;
    const fee = amount * (opt.processingFee / 100);
    return { ...opt, emi, total, interest, fee };
  }).sort((a, b) => a.emi - b.emi);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">Loan Comparison</h1>
        <p className="text-slate-500 mb-8">Compare EMI and total cost across loan products</p>

        <div className="card grid sm:grid-cols-2 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium mb-1">Loan Amount (₹)</label>
            <input type="number" className="input-field" value={amount} onChange={(e) => setAmount(+e.target.value)} min={10000} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tenure (months)</label>
            <input type="number" className="input-field" value={tenure} onChange={(e) => setTenure(+e.target.value)} min={6} max={360} />
          </div>
        </div>

        <div className="space-y-4">
          {comparisons.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`card ${i === 0 ? 'ring-2 ring-emerald-400' : ''}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{c.name}</h3>
                    {i === 0 && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">Best EMI</span>}
                  </div>
                  <p className="text-sm text-slate-500">Rate: {c.rate}% · Fee: {c.processingFee}%</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary-600">{formatCurrency(c.emi)}<span className="text-sm font-normal text-slate-500">/mo</span></p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100 text-sm">
                <div><p className="text-slate-500">Total Payable</p><p className="font-medium">{formatCurrency(c.total)}</p></div>
                <div><p className="text-slate-500">Total Interest</p><p className="font-medium">{formatCurrency(c.interest)}</p></div>
                <div><p className="text-slate-500">Processing Fee</p><p className="font-medium">{formatCurrency(c.fee)}</p></div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
