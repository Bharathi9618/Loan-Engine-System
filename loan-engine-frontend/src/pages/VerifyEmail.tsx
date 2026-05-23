import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { OtpInput } from '../components/forms/OtpInput';
import { authApi } from '../api/authApi';
import { otpApi } from '../api/otpApi';
import { getErrorMessage } from '../api/client';

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState((location.state as { email?: string })?.email || '');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return setError('Please enter the 6-digit OTP');
    setLoading(true);
    setError('');
    try {
      const { data } = await authApi.verifyEmail({ email, otp });
      setMessage(data.message || 'Email verified!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await otpApi.resend(email, 'EMAIL_VERIFICATION');
      setMessage('OTP resent. Check your email or server console (dev mode).');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-2">Verify Your Email</h2>
        <p className="text-slate-500 mb-6">Enter the 6-digit OTP sent to your email</p>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        {message && <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg mb-4 text-sm">{message}</div>}
        <form onSubmit={handleVerify} className="space-y-6">
          <input type="email" className="input-field" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <OtpInput value={otp} onChange={setOtp} />
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>
        <button onClick={handleResend} className="mt-4 text-sm text-primary-600 hover:underline">Resend OTP</button>
        <p className="mt-4 text-sm text-slate-500"><Link to="/login">Back to Login</Link></p>
      </motion.div>
    </div>
  );
}
