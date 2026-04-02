import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Shield, Activity, DollarSign, AlertTriangle, Users, Database } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Admin() {
  const { token } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const statsRes = await axios.get('http://localhost:5000/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const claimsRes = await axios.get('http://localhost:5000/admin/claims', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(statsRes.data);
        setClaims(claimsRes.data);
      } catch (err) {
        console.error("Failed to fetch admin data", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) {
      fetchAdminData();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-orange-500 animate-spin"></div>
      </div>
    );
  }

  const chartData = [
    { name: 'Paid Out', count: stats?.totalClaims - Math.max(0, stats?.fraudBlockedCount), fill: '#10b981' },
    { name: 'Fraud Blocked', count: stats?.fraudBlockedCount, fill: '#ef4444' }
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute top-10 left-10 w-[400px] h-[400px] rounded-full bg-orange-600/10 blur-[120px] animate-orb" />
         <div className="absolute top-40 right-20 w-[300px] h-[300px] rounded-full bg-blue-600/10 blur-[100px] animate-orb2" />
         <div className="absolute inset-0 grid-bg opacity-30" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-6 h-6 text-orange-400" />
            <h1 className="text-3xl font-black text-white">Central Admin</h1>
          </div>
          <p className="text-slate-400">Global monitor for transactions, risk vectors, and AI validations.</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <div className="glass rounded-2xl p-5 border border-white/5">
            <div className="flex justify-between items-start mb-2">
              <div className="text-slate-400 text-sm font-semibold">Total Payouts</div>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-white">₹{stats?.totalPaidOut?.toLocaleString()}</div>
          </div>
          <div className="glass rounded-2xl p-5 border border-white/5">
            <div className="flex justify-between items-start mb-2">
              <div className="text-slate-400 text-sm font-semibold">Fraud Blocks</div>
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-3xl font-black text-white">{stats?.fraudBlockedCount}</div>
            <div className="text-red-400/80 text-xs mt-1">Saved from pool drain</div>
          </div>
          <div className="glass rounded-2xl p-5 border border-white/5">
            <div className="flex justify-between items-start mb-2">
              <div className="text-slate-400 text-sm font-semibold">Total Claims</div>
              <Activity className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-3xl font-black text-white">{stats?.totalClaims}</div>
          </div>
          <div className="glass rounded-2xl p-5 border border-white/5">
            <div className="flex justify-between items-start mb-2">
              <div className="text-slate-400 text-sm font-semibold">Active Workers</div>
              <Users className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-3xl font-black text-white">{stats?.totalUsers}</div>
          </div>
        </div>

        {/* Main Section */}
        <div className="grid lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 glass rounded-2xl border border-white/5 p-5">
            <div className="flex items-center gap-2 mb-4">
               <Database className="w-5 h-5 text-purple-400" />
               <h3 className="text-white font-bold text-lg">Global Ledger</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="py-3 px-2 font-semibold">Claim ID</th>
                    <th className="py-3 px-2 font-semibold">Amount</th>
                    <th className="py-3 px-2 font-semibold">AI Flag</th>
                    <th className="py-3 px-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {claims.map((claim) => (
                    <tr key={claim._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-2 text-white font-mono">{claim._id.substring(claim._id.length - 8).toUpperCase()}</td>
                      <td className="py-3 px-2 text-slate-300">₹{claim.payoutINR}</td>
                      <td className="py-3 px-2">
                         <span className="text-slate-400">
                           {claim.status === 'blocked' ? 'Fraud (Isolation Forest)' : 'Verified (WRS)'}
                         </span>
                      </td>
                      <td className="py-3 px-2">
                        {claim.status === 'paid' ? (
                          <span className="text-emerald-400 font-semibold px-2 py-1 bg-emerald-400/10 rounded-full text-xs">PAID</span>
                        ) : claim.status === 'blocked' ? (
                          <span className="text-red-400 font-semibold px-2 py-1 bg-red-400/10 rounded-full text-xs">BLOCKED</span>
                        ) : (
                          <span className="text-blue-400 font-semibold px-2 py-1 bg-blue-400/10 rounded-full text-xs">PENDING</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass rounded-2xl border border-white/5 p-5 flex flex-col items-center justify-center">
             <h3 className="text-white font-bold text-lg mb-6 w-full text-left">Intervention Ratio</h3>
             <div className="h-[250px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData}>
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                   <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px'}} />
                   <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                 </BarChart>
               </ResponsiveContainer>
             </div>
             <p className="text-slate-500 text-xs mt-4 text-center">Comparing genuine claims passed against anomalies trapped by Python inference models.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
