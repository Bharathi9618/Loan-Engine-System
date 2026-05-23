import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/client';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const emailError = !email && emailTouched
    ? 'Email is required'
    : email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? 'Please enter a valid email address'
    : '';

  const passwordError = !password && passwordTouched
    ? 'Password is required'
    : '';

  const isValid = email && password && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      const role = JSON.parse(localStorage.getItem('loan_engine_user') || '{}').role;
      navigate(role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card w-full max-w-md">
        <h2 className="text-2xl font-bold mb-2">Welcome back</h2>
        <p className="text-slate-500 mb-6">Sign in to your account</p>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="input-field"
              autoComplete="new-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
              placeholder="Enter your email"
              required
            />
            {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              className="input-field"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setPasswordTouched(true)}
              placeholder="Enter your password"
              required
            />
            {passwordError && <p className="text-xs text-red-500 mt-1">{passwordError}</p>}
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading || !isValid}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          <Link to="/forgot-password" className="text-primary-600 hover:underline">Forgot password?</Link>
        </p>
        <p className="mt-2 text-center text-sm text-slate-500">
          No account? <Link to="/signup" className="text-primary-600 hover:underline">Sign up</Link>
        </p>
        {/* <div className="mt-6 p-3 bg-slate-50 rounded-lg text-xs text-slate-500">
          <p><strong>Demo Admin:</strong> admin@loanengine.com / Admin@123</p>
          <p><strong>Demo User:</strong> user@loanengine.com / User@123</p>
        </div> */}
      </motion.div>
    </div>
  );
}
