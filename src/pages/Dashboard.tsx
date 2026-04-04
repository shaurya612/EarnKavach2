import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
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

/* ── Mock data is now fetched from backend ── */

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
            fill="none" className="stroke-slate-200 dark:stroke-[rgba(255,255,255,0.06)]" strokeWidth="12" strokeLinecap="round" />
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
            className="text-4xl font-black text-slate-900 dark:text-white"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          >
            {score}
          </motion.div>
          <div className="text-xs font-medium text-slate-500">/100</div>
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
    <div className="glass rounded-xl border border-slate-200/80 p-3 text-xs dark:border-white/10">
      <p className="mb-2 font-medium text-slate-600 dark:text-slate-400">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-slate-700 dark:text-slate-300">{p.name}:</span>
          <span className="font-bold text-slate-900 dark:text-white">₹{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { user, token, locationCity } = useAuth()
  const [activeTab, setActiveTab] = useState<'week' | 'month'>('month')
  const [dbClaims, setDbClaims] = useState<any[]>([])
  const [dashboardData, setDashboardData] = useState<any>({ earningData: [], weeklyData: [], alerts: [], wrsScore: 85 })
  const [policyData, setPolicyData] = useState<any>(null)
  const [autoDecision, setAutoDecision] = useState<any>(null)
  const [payments, setPayments] = useState<any[]>([])
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)
  const [paySuccess, setPaySuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    const headers = { Authorization: `Bearer ${token}` };

    const refreshData = () => {
      axios.get('https://earnkavach2.onrender.com/claims', { headers })
        .then(res => setDbClaims(res.data))
        .catch(console.error)

      axios.get('https://earnkavach2.onrender.com/gig/realtime-stats', { headers })
        .then(res => setDashboardData(res.data))
        .catch(console.error)

      axios.get('https://earnkavach2.onrender.com/policy/my-policy', { headers })
        .then(res => setPolicyData(res.data.policy))
        .catch(console.error)

      axios.get('https://earnkavach2.onrender.com/dashboard', { headers })
        .then(res => setAutoDecision(res.data))
        .catch(console.error)

      axios.get('https://earnkavach2.onrender.com/payment/my-payments', { headers })
        .then(res => setPayments(res.data))
        .catch(console.error)
    };

    refreshData();
    const timer = setInterval(refreshData, 15000);
    return () => clearInterval(timer);
  }, [token])

  const ensureRazorpayLoaded = async () => {
    if ((window as any).Razorpay) return true;
    return new Promise<boolean>((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const payPremium = async () => {
    if (!token) {
      setPayError('Please sign in again.')
      return
    }
    setPayError(null)
    setPaySuccess(null)
    setPaying(true)
    try {
      const loaded = await ensureRazorpayLoaded()
      if (!loaded || !(window as any).Razorpay) {
        setPayError('Could not load Razorpay. Disable ad-blockers or check your connection.')
        setPaying(false)
        return
      }

      const headers = { Authorization: `Bearer ${token}` }
      const orderRes = await axios.post(
        'https://earnkavach2.onrender.com/payment/create-premium-order',
        {},
        { headers },
      )
      const { order, key } = orderRes.data
      if (!key || !order?.id) {
        setPayError('Invalid order from server. Check backend logs and Razorpay keys in .env.')
        setPaying(false)
        return
      }

      // `amount` must match the order (paise). Omitting it breaks checkout in many Razorpay builds.
      const rz = new (window as any).Razorpay({
        key,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'EarnKavach Premium',
        description: 'Weekly premium — ₹49',
        order_id: order.id,
        handler: async (response: any) => {
          try {
            const verifyRes = await axios.post(
              'https://earnkavach2.onrender.com/payment/verify-premium',
              response,
              { headers },
            )
            const payRes = await axios.get('https://earnkavach2.onrender.com/payment/my-payments', { headers })
            setPayments(payRes.data)
            setPayError(null)
            const emailed = verifyRes.data?.emailSent
            setPaySuccess(
              emailed
                ? `Payment successful. A receipt was sent to ${user?.email || 'your email'}.`
                : `Payment successful. Ask your admin to set SMTP_HOST / SMTP_USER / SMTP_PASS in the server to email receipts.`,
            )
          } catch (err: any) {
            const msg =
              err?.response?.data?.message ||
              err?.message ||
              'Payment succeeded but verification failed. Contact support with your payment id.'
            setPayError(msg)
            console.error(err)
          } finally {
            setPaying(false)
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: { color: '#f97316' },
        modal: {
          ondismiss: () => {
            setPaying(false)
          },
        },
      })

      rz.on('payment.failed', (ev: any) => {
        const desc = ev?.error?.description || ev?.error?.reason || 'Payment failed'
        setPayError(desc)
        setPaying(false)
      })
      rz.open()
    } catch (error: any) {
      console.error(error)
      setPayError(
        error?.response?.data?.message ||
          error?.message ||
          'Could not start checkout. Confirm RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend .env.',
      )
      setPaying(false)
    }
  }

  const getAlertIcon = (type: string) => {
    if (type.includes('Rain')) return CloudRain
    if (type.includes('Heat')) return Sun
    return Wind
  }

  const stats = useMemo(() => {
    const paid = dbClaims.filter(c => c.status === 'paid')
    const processing = dbClaims.filter(c => c.status === 'processing')
    const saved = paid.reduce((s, c) => s + c.payoutINR, 0)
    const pending = processing.reduce((s, c) => s + c.payoutINR, 0)
    return { saved, pending, paidCount: paid.length }
  }, [dbClaims])

  const stagger = (i: number) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.08, duration: 0.5 } })

  return (
    <div className="min-h-screen bg-slate-50 pt-20 dark:bg-[#07070f]">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 pt-6 pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <motion.div {...stagger(0)}>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <Bike className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-slate-50 bg-emerald-400 dark:border-[#07070f]" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">{user?.name || 'Rahul Sharma'}</h1>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{user?.platform || 'Zomato'} Partner · {locationCity}</span>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-emerald-400 text-[10px] font-semibold">ONLINE</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div className="flex flex-col items-stretch gap-2 md:flex-row md:items-center md:gap-3" {...stagger(1)}>
            {paySuccess && (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-800 dark:text-emerald-200 md:max-w-md">
                {paySuccess}
              </div>
            )}
            {payError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-300 md:order-last md:max-w-md">
                {payError}
              </div>
            )}
            <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2">
              <Shield className="w-4 h-4 text-orange-400" />
              <span className="text-slate-900 dark:text-white text-sm font-semibold">Coverage: {policyData?.coveragePercent || '80'}%</span>
            </div>
            <div className="glass flex items-center gap-2 rounded-xl px-4 py-2.5">
              <Star className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-semibold text-slate-900 dark:text-white">Weekly premium: ₹49</span>
            </div>
            <button
              onClick={payPremium}
              disabled={paying}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-colors hover:bg-emerald-400 disabled:opacity-60"
            >
              <DollarSign className="w-4 h-4" /> {paying ? 'Processing...' : 'Pay ₹49'}
            </button>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200/90 bg-slate-200/50 px-5 py-2.5 text-sm font-bold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              <Lock className="w-4 h-4" /> View Only Mode
            </div>
          </motion.div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
            { label: "Today's Income", val: '₹620', sub: '↓ ₹230 from disruption', subColor: 'text-red-400', icon: DollarSign, bg: 'glass-orange', iconColor: 'text-orange-400' },
              { label: 'AI Predicted', val: `₹${Math.round(autoDecision?.payout_estimate || 850)}`, sub: 'Automated by ML models', subColor: 'text-emerald-400', icon: TrendingUp, bg: 'glass-purple', iconColor: 'text-purple-400' },
            { label: 'Active Claim', val: `₹${stats.pending}`, sub: 'Processing · 2 min', subColor: 'text-amber-400', icon: Zap, bg: 'glass-amber', iconColor: 'text-amber-400' },
            { label: 'Monthly Saved', val: `₹${stats.saved}`, sub: `↑ ${stats.paidCount} claims this month`, subColor: 'text-emerald-400', icon: CheckCircle, bg: 'glass-emerald', iconColor: 'text-emerald-400' },
          ].map((card, i) => (
            <motion.div key={i} className={`${card.bg} rounded-2xl p-5 relative overflow-hidden`} {...stagger(i + 2)}>
              <div className="flex items-start justify-between mb-3">
                <div className="text-xs font-medium text-slate-600 dark:text-slate-400">{card.label}</div>
                <card.icon className={`w-4 h-4 ${card.iconColor}`} />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mb-1">{card.val}</div>
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
                  <h2 className="text-slate-900 dark:text-white font-bold text-lg">Income Prediction vs Actual</h2>
                  <p className="text-slate-500 text-xs mt-0.5">Shaded area = EarnKavach compensation</p>
                </div>
                <div className="flex gap-2">
                  {(['week', 'month'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setActiveTab(t)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${activeTab === t ? 'bg-orange-500 text-white' : 'bg-slate-200/70 text-slate-600 hover:text-slate-900 dark:bg-white/5 dark:text-slate-400 dark:hover:text-white'}`}
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
                <AreaChart data={dashboardData.earningData.slice(activeTab === 'week' ? -7 : 0)}>
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
                  <h2 className="text-slate-900 dark:text-white font-bold text-lg">This Week's Earnings</h2>
                  <p className="text-slate-500 text-xs mt-0.5">Total: ₹4,980 · vs predicted ₹5,920</p>
                </div>
                <div className="px-3 py-1.5 rounded-lg glass-orange text-xs font-semibold text-orange-400">₹940 recovered</div>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={dashboardData.weeklyData} barSize={28}>
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
                <h2 className="text-slate-900 dark:text-white font-bold text-lg">Recent Claims</h2>
                <Link to="/claims">
                  <button className="flex items-center gap-1 text-orange-400 text-sm hover:text-orange-300 transition-colors">
                    View all <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>
              <div className="space-y-3">
                {dbClaims.slice(0, 5).map((c, i) => (
                  <motion.div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.03] transition-colors" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 + i * 0.07 }}>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${c.status === 'paid' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                    <div className="flex-shrink-0 w-20">
                      <div className="text-slate-900 dark:text-white text-xs font-bold">{c._id.substring(c._id.length - 8).toUpperCase()}</div>
                      <div className="text-slate-500 text-[10px]">{new Date(c.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-slate-300 text-xs font-medium">{c.scenario}</div>
                      <div className="text-slate-500 text-[10px]">Tier: {c.tier}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-900 dark:text-white text-sm font-black">₹{c.payoutINR}</div>
                      {c.processingTime !== '—' && <div className="text-slate-500 text-[10px]">in {c.processingTime}</div>}
                    </div>
                    <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex-shrink-0 ${
                      c.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : c.status === 'blocked' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {c.status === 'paid' ? 'Paid' : c.status === 'blocked' ? 'Blocked' : 'Processing'}
                    </div>
                  </motion.div>
                ))}
                {!dbClaims.length && (
                   <div className="text-slate-500 text-sm text-center py-4">No real claims yet. Try a simulation!</div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right col */}
          <div className="space-y-6">

            {/* WRS Score */}
            <motion.div className="glass rounded-3xl p-6 text-center" {...stagger(3)}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-slate-900 dark:text-white font-bold">WRS Score</h2>
                <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                  <ChevronUp className="w-3 h-3" /> +2 this week
                </div>
              </div>
              <WRSGauge score={dashboardData.wrsScore} />
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
                      <span className="text-slate-900 dark:text-white font-bold">{item.val}%</span>
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
                <h2 className="text-slate-900 dark:text-white font-bold">Live Alerts</h2>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  <span className="text-red-400 text-[10px] font-bold">3 ACTIVE</span>
                </div>
              </div>
              <div className="space-y-3">
                {dashboardData.alerts.map((a: any, i: number) => {
                  const AlertIcon = getAlertIcon(a.type);
                  return (
                  <div key={i} className={`rounded-xl p-3 flex items-start gap-3 ${
                    a.severity === 'high' ? 'glass-red' : a.severity === 'medium' ? 'glass-amber' : 'glass'
                  }`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      a.severity === 'high' ? 'bg-red-500/20' : a.severity === 'medium' ? 'bg-amber-500/20' : 'bg-white/10'
                    }`}>
                      <AlertIcon className={`w-3.5 h-3.5 ${a.severity === 'high' ? 'text-red-400' : a.severity === 'medium' ? 'text-amber-400' : 'text-slate-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-slate-900 dark:text-white text-xs font-bold">{a.type}</div>
                      <div className="text-slate-500 text-[10px]">{a.zone}</div>
                      <div className={`text-[10px] font-semibold mt-1 ${a.severity === 'high' ? 'text-red-300' : a.severity === 'medium' ? 'text-amber-300' : 'text-slate-400'}`}>
                        {a.action}
                      </div>
                    </div>
                    <div className="text-slate-600 text-[10px] flex-shrink-0">{a.time}</div>
                  </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Coverage card */}
            <motion.div className="glass-orange rounded-3xl p-6" {...stagger(5)}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <Shield className="w-4.5 h-4.5 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-slate-900 dark:text-white font-bold text-sm">Active Coverage</h3>
                  <p className="text-slate-500 text-[10px]">Plan: {policyData?.planName || 'Premium Shield'}</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Coverage %', val: `${policyData?.coveragePercent || 80}%` },
                  { label: 'Max daily payout', val: `₹${policyData?.maxDailyPayout || 960}` },
                  { label: 'This week premium', val: `₹${policyData?.weeklyPremiumINR || 49}` },
                  { label: 'Claims this month', val: '4 of 10' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                    <span className="text-slate-400 text-xs">{item.label}</span>
                    <span className="text-slate-900 dark:text-white text-xs font-bold">{item.val}</span>
                  </div>
                ))}
              </div>
              <Link to="/demo">
                <button className="mt-4 w-full rounded-xl bg-orange-500 py-2.5 text-xs font-bold text-white transition-colors hover:bg-orange-400">
                  Simulate New Claim
                </button>
              </Link>
            </motion.div>

            {/* Fraud status */}
            <motion.div className="glass-emerald rounded-3xl p-5" {...stagger(6)}>
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-900 dark:text-white font-bold text-sm">Fraud Shield Active</span>
              </div>
              <p className="text-slate-400 text-xs">
                Fraud: {autoDecision?.fraud_status || 'clear'} · Suspicious: {autoDecision?.suspicious_flag ? 'yes' : 'no'} ·
                Weather: {autoDecision?.weather_status?.weather_condition || 'syncing'}
              </p>
              <p className="text-slate-500 text-xs mt-2">
                Premium payments: {payments.filter(p => p.type === 'premium' && p.status === 'paid').length} successful ·
                Auto payout queue: {payments.filter(p => p.type === 'claim_payout').length}
              </p>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-emerald-500/10">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 text-xs font-semibold">Read-only dashboard for user accounts</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
