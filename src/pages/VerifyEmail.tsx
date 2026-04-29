import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle, XCircle, Loader2, Mail, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';
import { useAuthStore } from '../stores/authStore';

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser, setAuthenticated } = useAuthStore();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-token'>('loading');
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('no-token');
      setMessage('No verification token provided');
      return;
    }

    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const result = await api.verifyEmail(token!);
      setStatus('success');
      setMessage(result.message || 'Email verified successfully!');
      
      // Auto-login the user
      if (result.user) {
        setUser(result.user);
        setAuthenticated(true);
      }

      // Redirect to home after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Failed to verify email');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="glass rounded-3xl p-8 text-center">
          {status === 'loading' && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-stone-800 mb-2">
                Verifying Your Email
              </h1>
              <p className="text-stone-600">
                Please wait while we verify your email address...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center"
              >
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </motion.div>
              <h1 className="text-2xl font-bold text-stone-800 mb-2">
                Email Verified! 🎉
              </h1>
              <p className="text-stone-600 mb-6">{message}</p>
              <p className="text-sm text-stone-400">
                Redirecting you to the home page...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-stone-800 mb-2">
                Verification Failed
              </h1>
              <p className="text-stone-600 mb-6">{message}</p>
              
              <div className="space-y-3">
                <Link
                  to="/auth"
                  className="block w-full px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors"
                >
                  Go to Login
                </Link>
                <button
                  onClick={() => navigate('/auth?resend=true')}
                  className="block w-full px-6 py-3 border border-stone-200 text-stone-600 font-medium rounded-xl hover:bg-stone-50 transition-colors"
                >
                  Resend Verification Email
                </button>
              </div>
            </>
          )}

          {status === 'no-token' && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-100 flex items-center justify-center">
                <Mail className="w-10 h-10 text-amber-500" />
              </div>
              <h1 className="text-2xl font-bold text-stone-800 mb-2">
                Invalid Link
              </h1>
              <p className="text-stone-600 mb-6">
                This verification link is invalid or has expired. Please request a new one.
              </p>
              
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors"
              >
                Go to Login
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};
