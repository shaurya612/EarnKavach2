import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Shield, Activity, DollarSign, AlertTriangle, Users, Database, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Admin() {
  const { token } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [claims, setClaims] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [modelHealth, setModelHealth] = useState<any>(null);
  const [payoutSchedule, setPayoutSchedule] = useState<any>(null);
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
        const workersRes = await axios.get('http://localhost:5000/admin/workers', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const modelHealthRes = await axios.get('http://localhost:5000/admin/model-health', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const scheduleRes = await axios.get('http://localhost:5000/admin/payout-schedule', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(statsRes.data);
        setClaims(claimsRes.data);
        setWorkers(workersRes.data);
        setModelHealth(modelHealthRes.data);
        setPayoutSchedule(scheduleRes.data);
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
          <div className="mt-4 flex gap-2">
            <Link to="/admin" className="px-3 py-2 rounded-lg bg-orange-500/20 border border-orange-400/30 text-orange-300 text-xs font-bold">
              Admin Portal
            </Link>
            <Link to="/demo" className="px-3 py-2 rounded-lg bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold">
              Live Demo (Admin)
            </Link>
          </div>
          {payoutSchedule && (
            <div className="mt-5 flex gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/5 px-4 py-3 text-sm text-slate-300">
              <Clock className="h-5 w-5 shrink-0 text-emerald-400" />
              <div>
                <div className="font-bold text-emerald-300">Automatic claim settlements</div>
                <p className="mt-1 text-slate-400">
                  Runs every <span className="text-white">{payoutSchedule.everyHours} hours</span>, and at{' '}
                  <span className="text-white">
                    {(payoutSchedule.dailySlotHours || []).map((h: number) => `${h}:00`).join(', ')}
                  </span>{' '}
                  ({payoutSchedule.timezoneNote}). Workers do not need to click anything on the dashboard.
                </p>
                <p className="mt-1 text-xs text-slate-500">{payoutSchedule.behavior}</p>
              </div>
            </div>
          )}
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

        {/* Model Health Section */}
        <div className="mt-8 glass rounded-2xl border border-white/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-bold text-lg">ML Model API Health</h3>
              <p className="text-slate-500 text-xs mt-1">
                Real-time status of Fraud, Income, WRS, and Risk models.
              </p>
            </div>
            <div className="text-slate-500 text-xs">
              Last checked: {modelHealth?.checkedAt ? new Date(modelHealth.checkedAt).toLocaleTimeString() : '—'}
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {['fraud', 'income', 'wrs', 'risk'].map((key) => {
              const row = modelHealth?.[key];
              const isUp = row?.status === 'up';
              return (
                <div key={key} className="rounded-xl p-4 border border-white/10 bg-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-bold uppercase text-xs">{key}</span>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${isUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {isUp ? 'UP' : 'DOWN'}
                    </span>
                  </div>
                  <div className="text-slate-400 text-[11px] break-all">{row?.endpoint || 'N/A'}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Worker Telemetry Section */}
        <div className="mt-8 glass rounded-2xl border border-white/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-bold text-lg">Worker Telemetry</h3>
              <p className="text-slate-500 text-xs mt-1">
                Live snapshot of gig workers, their platforms, and background-sync eligibility.
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="py-3 px-2 font-semibold">Name</th>
                  <th className="py-3 px-2 font-semibold">API ID</th>
                  <th className="py-3 px-2 font-semibold">Platform</th>
                  <th className="py-3 px-2 font-semibold">Active</th>
                  <th className="py-3 px-2 font-semibold">Location</th>
                  <th className="py-3 px-2 font-semibold">Claim Eligible</th>
                  <th className="py-3 px-2 font-semibold">Last Sync</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {workers.map((w) => (
                  <tr key={w.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-2 text-white">
                      <div className="flex flex-col">
                        <span className="font-semibold">{w.name || 'Unknown'}</span>
                        {w.email && <span className="text-xs text-slate-400">{w.email}</span>}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-slate-300 font-mono text-xs">{w.apiId}</td>
                    <td className="py-3 px-2 text-slate-300">{w.platform}</td>
                    <td className="py-3 px-2">
                      {w.activeStatus ? (
                        <span className="text-emerald-400 font-semibold px-2 py-1 bg-emerald-400/10 rounded-full text-xs">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="text-slate-400 font-semibold px-2 py-1 bg-slate-500/10 rounded-full text-xs">
                          OFFLINE
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-slate-300 text-xs">
                      {w.location && (w.location.lat || w.location.lng)
                        ? `${w.location.lat.toFixed(3)}, ${w.location.lng.toFixed(3)}`
                        : '—'}
                    </td>
                    <td className="py-3 px-2">
                      {w.claimEligibilityStatus ? (
                        <span className="text-emerald-400 font-semibold px-2 py-1 bg-emerald-400/10 rounded-full text-xs">
                          ELIGIBLE
                        </span>
                      ) : (
                        <span className="text-red-400 font-semibold px-2 py-1 bg-red-400/10 rounded-full text-xs">
                          NOT ELIGIBLE
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-slate-400 text-xs">
                      {w.lastSyncTime ? new Date(w.lastSyncTime).toLocaleTimeString() : '—'}
                    </td>
                  </tr>
                ))}
                {workers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 px-2 text-center text-slate-500 text-sm">
                      No worker telemetry available yet. Once workers generate activity, they will appear here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
