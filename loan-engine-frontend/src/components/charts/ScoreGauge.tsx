import { motion } from 'framer-motion';

interface ScoreGaugeProps {
  score: number;
  maxScore: number;
  percentage: number;
}

export const ScoreGauge = ({ score, maxScore, percentage }: ScoreGaugeProps) => {
  const color = percentage >= 80 ? '#10b981' : percentage >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="8" />
          <motion.circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${percentage * 2.64} 264`}
            initial={{ strokeDasharray: '0 264' }}
            animate={{ strokeDasharray: `${percentage * 2.64} 264` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color }}>{percentage.toFixed(0)}%</span>
          <span className="text-xs text-slate-500">{score}/{maxScore}</span>
        </div>
      </div>
    </div>
  );
};
