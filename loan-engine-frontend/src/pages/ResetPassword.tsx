import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { OtpInput } from '../components/forms/OtpInput';
import { authApi } from '../api/authApi';
import { getErrorMessage } from '../api/client';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState((location.state as { email?: string })?.email || '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'otp' | 'password'>('otp');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return setError('Enter 6-digit OTP');
    setLoading(true);
    setError('');
    try {
      await authApi.verifyOtp({ email, otp });
      setStep('password');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authApi.resetPassword({ email, otp, newPassword });
      navigate('/login');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Reset Password</h2>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        <input type="email" className="input-field mb-4" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        {step === 'otp' ? (
          <form onSubmit={verifyOtp} className="space-y-6">
            <OtpInput value={otp} onChange={setOtp} />
            <button type="submit" className="btn-primary w-full" disabled={loading}>Verify OTP</button>
          </form>
        ) : (
          <form onSubmit={resetPassword} className="space-y-4">
            <input type="password" className="input-field" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={8} required />
            <button type="submit" className="btn-primary w-full" disabled={loading}>Reset Password</button>
          </form>
        )}
        <p className="mt-4 text-center text-sm"><Link to="/login">Back to Login</Link></p>
      </motion.div>
    </div>
  );
}
