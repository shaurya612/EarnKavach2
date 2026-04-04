import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, Bike, ChevronRight, TriangleAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [platform, setPlatform] = useState('Zomato');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('https://earnkavach2.onrender.com/auth/register', {
        name,
        email,
        password,
        platform
      });

      const { token, ...userData } = response.data;
      login(userData, token);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-24 px-6 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-purple-500/10 blur-[130px]" />
      </div>

      <motion.div
        className="glass rounded-3xl p-8 w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 mb-4">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Create Account</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Join EarnKavach as a delivery partner</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
            <TriangleAlert className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200/90 bg-slate-50 py-3 pl-12 pr-4 text-slate-900 transition-all placeholder:text-slate-400 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
                placeholder="Rahul Sharma"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200/90 bg-slate-50 py-3 pl-12 pr-4 text-slate-900 transition-all placeholder:text-slate-400 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Connect Delivery Platform</label>
            <div className="mb-2 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPlatform('Zomato')}
                className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold transition-all ${
                  platform === 'Zomato'
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                    : 'bg-slate-200/60 text-slate-600 hover:bg-slate-300/70 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10'
                }`}
              >
                <div className={`h-2 w-2 rounded-full ${platform === 'Zomato' ? 'bg-white' : 'bg-red-500'}`} />
                Zomato
              </button>
              <button
                type="button"
                onClick={() => setPlatform('Swiggy')}
                className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold transition-all ${
                  platform === 'Swiggy'
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                    : 'bg-slate-200/60 text-slate-600 hover:bg-slate-300/70 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10'
                }`}
              >
                <div className={`h-2 w-2 rounded-full ${platform === 'Swiggy' ? 'bg-white' : 'bg-orange-500'}`} />
                Swiggy
              </button>
            </div>
            
            {(platform === 'Zomato' || platform === 'Swiggy') && (
              <div className="relative mt-3">
                <Bike className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-200/90 bg-slate-50 py-3 pl-12 pr-4 text-slate-900 transition-all placeholder:text-slate-400 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  placeholder={`${platform} Partner ID / Phone`}
                  required
                />
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200/90 bg-slate-50 py-3 pl-12 pr-4 text-slate-900 transition-all placeholder:text-slate-400 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
            {!loading && <ChevronRight className="w-4 h-4" />}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-400 hover:text-purple-300 font-bold">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
