import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import {
  Shield,
  TrendingUp,
  CloudRain,
  Zap,
  CheckCircle,
  Bike,
  DollarSign,
  ChevronUp,
  Star,
  Lock,
  ArrowRight,
  Sun,
  Wind,
} from 'lucide-react'
import { Link } from 'react-router-dom'

/* ── Mock data ── */
const earningData = [
  { day: 'Mar 1', predicted: 820, actual: 790 }, { day: 'Mar 2', predicted: 780, actual: 810 },
  { day: 'Mar 3', predicted: 850, actual: 620 }, { day: 'Mar 4', predicted: 900, actual: 870 },
  { day: 'Mar 5', predicted: 860, actual: 880 }, { day: 'Mar 6', predicted: 700, actual: 460 },
  { day: 'Mar 7', predicted: 820, actual: 820 }, { day: 'Mar 8', predicted: 880, actual: 850 },
  { day: 'Mar 9', predicted: 940, actual: 910 }, { day: 'Mar 10', predicted: 870, actual: 580 },
  { day: 'Mar 11', predicted: 820, actual: 800 }, { day: 'Mar 12', predicted: 810, actual: 790 },
  { day: 'Mar 13', predicted: 860, actual: 840 }, { day: 'Mar 14', predicted: 920, actual: 680 },
  { day: 'Mar 15', predicted: 850, actual: 830 }, { day: 'Mar 16', predicted: 800, actual: 780 },
  { day: 'Mar 17', predicted: 870, actual: 850 }, { day: 'Mar 18', predicted: 910, actual: 580 },
  { day: 'Mar 19', predicted: 850, actual: 620 },
]

const weeklyData = [
  { day: 'Mon', income: 720 }, { day: 'Tue', income: 850 }, { day: 'Wed', income: 640 },
  { day: 'Thu', income: 920 }, { day: 'Fri', income: 780 }, { day: 'Sat', income: 450 },
  { day: 'Sun', income: 620 },
]

const claims = [
  { id: 'CL-2847', date: 'Mar 18, 2026', type: 'Heavy Rain', lost: 330, payout: 264, status: 'paid', time: '4 min' },
  { id: 'CL-2791', date: 'Mar 14, 2026', type: 'Heavy Rain', lost: 240, payout: 192, status: 'paid', time: '3 min' },
  { id: 'CL-2763', date: 'Mar 10, 2026', type: 'Extreme Heat', lost: 290, payout: 232, status: 'paid', time: '6 min' },
  { id: 'CL-2741', date: 'Mar 6, 2026', type: 'Traffic Block', lost: 240, payout: 192, status: 'paid', time: '5 min' },
  { id: 'CL-2847', date: 'Mar 19, 2026', type: 'Heavy Rain', lost: 230, payout: 184, status: 'processing', time: '—' },
]

const alerts = [
  { icon: CloudRain, type: 'Heavy Rain', zone: 'Andheri East', severity: 'high', time: '2 min ago', action: 'Claim triggered ₹230' },
  { icon: Wind, type: 'AQI Alert', zone: 'Bandra West', severity: 'medium', time: '1 hr ago', action: 'Suggest zone shift' },
  { icon: Sun, type: 'Extreme Heat', zone: 'Dharavi', severity: 'low', time: '3 hrs ago', action: 'Take early break' },
]

/* ── WRS Gauge SVG ── */
function WRSGauge({ score }: { score: number }) {
  const r = 60, cx = 80, cy = 80
  const circumference = Math.PI * r
  const pct = score / 100
  const dash = pct * circumference
  const angle = -180 + pct * 180

  const getColor = () => {
    if (score >= 80) return '#34d399'
    if (score >= 60) return '#f97316'
    return '#ef4444'
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width="160" height="100" viewBox="0 0 160 100">
          {/* Track */}
          <path d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`}
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" strokeLinecap="round" />
          {/* Value arc */}
          <motion.path
            d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`}
            fill="none" stroke={getColor()} strokeWidth="12" strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - dash }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
          />
          {/* Needle */}
          <motion.line
            x1={cx} y1={cy}
            x2={cx + 45 * Math.cos((angle * Math.PI) / 180)}
            y2={cy + 45 * Math.sin((angle * Math.PI) / 180)}
            stroke={getColor()} strokeWidth="2.5" strokeLinecap="round"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
          />
          <circle cx={cx} cy={cy} r="5" fill={getColor()} />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 text-center">
          <motion.div
            className="text-4xl font-black text-white"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          >
            {score}
          </motion.div>
          <div className="text-xs text-slate-500 font-medium">/100</div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-2">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getColor() }} />
        <span className="text-sm font-semibold" style={{ color: getColor() }}>
          {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'At Risk'}
        </span>
      </div>
    </div>
  )
}

/* ── Custom Tooltip ── */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl p-3 border border-white/10 text-xs">
      <p className="text-slate-400 mb-2 font-medium">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-slate-300">{p.name}:</span>
          <span className="text-white font-bold">₹{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'week' | 'month'>('month')

  const stagger = (i: number) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.08, duration: 0.5 } })

  return (
    <div className="min-h-screen bg-[#07070f] pt-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 pt-6 pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <motion.div {...stagger(0)}>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <Bike className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#07070f]" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">Rahul Sharma</h1>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-slate-400 text-sm">Zomato Partner · Mumbai, Andheri East</span>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-emerald-400 text-[10px] font-semibold">ONLINE</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div className="flex items-center gap-3" {...stagger(1)}>
            <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2">
              <Shield className="w-4 h-4 text-orange-400" />
              <span className="text-white text-sm font-semibold">Coverage: 80%</span>
            </div>
            <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" />
              <span className="text-white text-sm font-semibold">Premium: ₹49/wk</span>
            </div>
            <Link to="/demo">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-sm font-bold transition-colors shadow-lg shadow-orange-500/20">
                <Zap className="w-4 h-4" /> Simulate Claim
              </button>
            </Link>
          </motion.div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Today's Income", val: '₹620', sub: '↓ ₹230 from disruption', subColor: 'text-red-400', icon: DollarSign, bg: 'glass-orange', iconColor: 'text-orange-400' },
            { label: 'AI Predicted', val: '₹850', sub: '↑ Confidence 94.2%', subColor: 'text-emerald-400', icon: TrendingUp, bg: 'glass-purple', iconColor: 'text-purple-400' },
            { label: 'Active Claim', val: '₹230', sub: 'Processing · 2 min', subColor: 'text-amber-400', icon: Zap, bg: 'glass-amber', iconColor: 'text-amber-400' },
            { label: 'Monthly Saved', val: '₹1,064', sub: '↑ 4 claims this month', subColor: 'text-emerald-400', icon: CheckCircle, bg: 'glass-emerald', iconColor: 'text-emerald-400' },
          ].map((card, i) => (
            <motion.div key={i} className={`${card.bg} rounded-2xl p-5 relative overflow-hidden`} {...stagger(i + 2)}>
              <div className="flex items-start justify-between mb-3">
                <div className="text-slate-400 text-xs font-medium">{card.label}</div>
                <card.icon className={`w-4 h-4 ${card.iconColor}`} />
              </div>
              <div className="text-2xl font-black text-white mb-1">{card.val}</div>
              <div className={`text-xs font-semibold ${card.subColor}`}>{card.sub}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left col — charts */}
          <div className="lg:col-span-2 space-y-6">

            {/* Income chart */}
            <motion.div className="glass rounded-3xl p-6" {...stagger(6)}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-white font-bold text-lg">Income Prediction vs Actual</h2>
                  <p className="text-slate-500 text-xs mt-0.5">Shaded area = EarnKavach compensation</p>
                </div>
                <div className="flex gap-2">
                  {(['week', 'month'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setActiveTab(t)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === t ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white bg-white/5'}`}
                    >
                      {t === 'week' ? '7D' : '30D'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-5 mb-4">
                {[
                  { color: '#a855f7', label: 'AI Predicted' },
                  { color: '#f97316', label: 'Actual Earned' },
                ].map((l, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 rounded" style={{ backgroundColor: l.color }} />
                    <span className="text-slate-400 text-xs">{l.label}</span>
                  </div>
                ))}
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-orange-500/20 border border-orange-500/40" />
                  <span className="text-slate-400 text-xs">Compensated gap</span>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={earningData.slice(activeTab === 'week' ? -7 : 0)}>
                  <defs>
                    <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="day" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="predicted" stroke="#a855f7" strokeWidth={2} fill="url(#predGrad)" name="Predicted" dot={false} />
                  <Area type="monotone" dataKey="actual" stroke="#f97316" strokeWidth={2.5} fill="url(#actGrad)" name="Actual" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Weekly bar */}
            <motion.div className="glass rounded-3xl p-6" {...stagger(7)}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-white font-bold text-lg">This Week's Earnings</h2>
                  <p className="text-slate-500 text-xs mt-0.5">Total: ₹4,980 · vs predicted ₹5,920</p>
                </div>
                <div className="px-3 py-1.5 rounded-lg glass-orange text-xs font-semibold text-orange-400">₹940 recovered</div>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={weeklyData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="income" name="Income" fill="#f97316" radius={[6, 6, 0, 0]}
                    label={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Claims table */}
            <motion.div className="glass rounded-3xl p-6" {...stagger(8)}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-bold text-lg">Recent Claims</h2>
                <Link to="/claims">
                  <button className="flex items-center gap-1 text-orange-400 text-sm hover:text-orange-300 transition-colors">
                    View all <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>
              <div className="space-y-3">
                {claims.map((c, i) => (
                  <motion.div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.03] transition-colors" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 + i * 0.07 }}>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${c.status === 'paid' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                    <div className="flex-shrink-0 w-20">
                      <div className="text-white text-xs font-bold">{c.id}</div>
                      <div className="text-slate-500 text-[10px]">{c.date}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-slate-300 text-xs font-medium">{c.type}</div>
                      <div className="text-slate-500 text-[10px]">Lost: ₹{c.lost}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-white text-sm font-black">₹{c.payout}</div>
                      {c.time !== '—' && <div className="text-slate-500 text-[10px]">in {c.time}</div>}
                    </div>
                    <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex-shrink-0 ${
                      c.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {c.status === 'paid' ? 'Paid' : 'Processing'}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right col */}
          <div className="space-y-6">

            {/* WRS Score */}
            <motion.div className="glass rounded-3xl p-6 text-center" {...stagger(3)}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold">WRS Score</h2>
                <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                  <ChevronUp className="w-3 h-3" /> +2 this week
                </div>
              </div>
              <WRSGauge score={87} />
              <div className="mt-5 space-y-2.5">
                {[
                  { label: 'Activity Consistency', val: 92, color: 'bg-emerald-500' },
                  { label: 'Order Acceptance', val: 88, color: 'bg-orange-500' },
                  { label: 'Location Authenticity', val: 95, color: 'bg-blue-500' },
                  { label: 'Claims Honesty', val: 78, color: 'bg-purple-500' },
                  { label: 'Platform Rating', val: 85, color: 'bg-amber-500' },
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">{item.label}</span>
                      <span className="text-white font-bold">{item.val}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5">
                      <motion.div
                        className={`h-full rounded-full ${item.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${item.val}%` }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 1, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Active Alerts */}
            <motion.div className="glass rounded-3xl p-6" {...stagger(4)}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold">Live Alerts</h2>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  <span className="text-red-400 text-[10px] font-bold">3 ACTIVE</span>
                </div>
              </div>
              <div className="space-y-3">
                {alerts.map((a, i) => (
                  <div key={i} className={`rounded-xl p-3 flex items-start gap-3 ${
                    a.severity === 'high' ? 'glass-red' : a.severity === 'medium' ? 'glass-amber' : 'glass'
                  }`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      a.severity === 'high' ? 'bg-red-500/20' : a.severity === 'medium' ? 'bg-amber-500/20' : 'bg-white/10'
                    }`}>
                      <a.icon className={`w-3.5 h-3.5 ${a.severity === 'high' ? 'text-red-400' : a.severity === 'medium' ? 'text-amber-400' : 'text-slate-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-xs font-bold">{a.type}</div>
                      <div className="text-slate-500 text-[10px]">{a.zone}</div>
                      <div className={`text-[10px] font-semibold mt-1 ${a.severity === 'high' ? 'text-red-300' : a.severity === 'medium' ? 'text-amber-300' : 'text-slate-400'}`}>
                        {a.action}
                      </div>
                    </div>
                    <div className="text-slate-600 text-[10px] flex-shrink-0">{a.time}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Coverage card */}
            <motion.div className="glass-orange rounded-3xl p-6" {...stagger(5)}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <Shield className="w-4.5 h-4.5 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">Active Coverage</h3>
                  <p className="text-slate-500 text-[10px]">Plan: Premium Shield</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Coverage %', val: '80%' },
                  { label: 'Max daily payout', val: '₹960' },
                  { label: 'This week premium', val: '₹49' },
                  { label: 'Claims this month', val: '4 of 10' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                    <span className="text-slate-400 text-xs">{item.label}</span>
                    <span className="text-white text-xs font-bold">{item.val}</span>
                  </div>
                ))}
              </div>
              <Link to="/demo">
                <button className="w-full mt-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-xs font-bold transition-colors">
                  Simulate New Claim
                </button>
              </Link>
            </motion.div>

            {/* Fraud status */}
            <motion.div className="glass-emerald rounded-3xl p-5" {...stagger(6)}>
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span className="text-white font-bold text-sm">Fraud Shield Active</span>
              </div>
              <p className="text-slate-400 text-xs">All activity signals are clean. No anomalies detected in the last 30 days.</p>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-emerald-500/10">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 text-xs font-semibold">Trusted tier — instant payouts</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
