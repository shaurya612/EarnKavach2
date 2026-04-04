import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, ChevronRight, TriangleAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'worker' | 'admin'>('worker');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('https://earnkavach2.onrender.com/auth/login', {
        email,
        password,
        mode,
      });

      const { token, ...userData } = response.data;
      login(userData, token, mode);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-24 px-6 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-orange-500/10 blur-[130px]" />
      </div>

      <motion.div
        className="glass rounded-3xl p-8 w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Welcome Back</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Sign in to your EarnKavach dashboard</p>
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Sign In Mode</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMode('worker')}
              className={`rounded-xl border py-2 text-sm font-bold transition-all ${
                mode === 'worker'
                  ? 'border-orange-400/40 bg-orange-500/20 text-orange-600 dark:text-orange-300'
                  : 'border-slate-200/90 bg-slate-200/50 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400'
              }`}
            >
              Sign in as User
            </button>
            <button
              type="button"
              onClick={() => setMode('admin')}
              className={`rounded-xl border py-2 text-sm font-bold transition-all ${
                mode === 'admin'
                  ? 'border-purple-400/40 bg-purple-500/20 text-purple-600 dark:text-purple-300'
                  : 'border-slate-200/90 bg-slate-200/50 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-400'
              }`}
            >
              Sign in as Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
            <TriangleAlert className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200/90 bg-slate-50 py-3 pl-12 pr-4 text-slate-900 transition-all placeholder:text-slate-400 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200/90 bg-slate-50 py-3 pl-12 pr-4 text-slate-900 transition-all placeholder:text-slate-400 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 px-4 bg-orange-500 hover:bg-orange-400 text-white rounded-xl font-bold transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
            {!loading && <ChevronRight className="w-4 h-4" />}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-orange-400 hover:text-orange-300 font-bold">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
