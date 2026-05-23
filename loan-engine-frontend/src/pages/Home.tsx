import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 via-transparent to-primary-900/5" />
      <div className="max-w-7xl mx-auto px-4 py-20 relative">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Smart Loan Eligibility <span className="text-primary-600">Engine</span>
          </h1>
          <p className="text-lg text-slate-600 mb-10">
            Evaluate loan applications instantly using our priority-based rule engine with weighted scoring.
            Secure authentication, OTP verification, and admin analytics included.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            {isAuthenticated ? (
              <Link to={isAdmin ? '/admin' : '/dashboard'} className="btn-primary text-lg px-8">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/signup" className="btn-primary text-lg px-8">Get Started</Link>
                <Link to="/login" className="btn-secondary text-lg px-8">Login</Link>
              </>
            )}
            <Link to="/apply" className="btn-secondary text-lg px-8">Check Eligibility</Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6 mt-20"
        >
          {[
            { title: 'Rule-Based Engine', desc: 'Priority execution with weighted scoring for APPROVED, REJECTED, or REVIEW.' },
            { title: 'Secure Auth', desc: 'JWT authentication with email verification and OTP password reset.' },
            { title: 'Admin Analytics', desc: 'Manage rules and view real-time application analytics dashboard.' },
          ].map((f) => (
            <div key={f.title} className="card hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-slate-600 text-sm">{f.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
