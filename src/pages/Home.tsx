import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Shield, Zap, Brain, MapPin, TrendingUp, AlertTriangle, CheckCircle,
  ArrowRight, Star, Users, DollarSign, Activity, CloudRain, Bike,
  Lock, Clock, ChevronRight, Cpu, Network, BarChart3, Layers
} from 'lucide-react'

/* ── Animated Counter ── */
function Counter({ end, prefix = '', suffix = '', duration = 2.2 }: { end: number; prefix?: string; suffix?: string; duration?: number }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView) return
    let start: number | null = null
    const step = (ts: number) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / (duration * 1000), 1)
      setVal(Math.floor(p * end))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [inView, end, duration])
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>
}

/* ── Feature data ── */
const features = [
  { icon: Brain, title: 'Income Prediction AI', desc: 'Hybrid LSTM/ARIMA + XGBoost forecasts your expected earnings from 30-day history, weather, time, and demand signals.', gradient: 'from-purple-600 to-indigo-700', glow: 'group-hover:shadow-purple-500/20' },
  { icon: Activity, title: 'Worker Reliability Score', desc: 'Dynamic trust score calculated from activity consistency, order acceptance, location authenticity, and claims honesty.', gradient: 'from-orange-500 to-amber-600', glow: 'group-hover:shadow-orange-500/20' },
  { icon: MapPin, title: 'Hyperlocal Risk Detection', desc: 'City micro-zoned into 500m cells. Real-time tracking of rainfall, AQI, traffic, and order density per zone.', gradient: 'from-emerald-500 to-teal-600', glow: 'group-hover:shadow-emerald-500/20' },
  { icon: Zap, title: 'Smart Trigger Engine', desc: 'Automatically triggers a claim when disruption signals align with demand drop and active worker status.', gradient: 'from-yellow-500 to-orange-600', glow: 'group-hover:shadow-yellow-500/20' },
  { icon: DollarSign, title: 'Micro-Payout Model', desc: 'Micro payouts calculated from predicted vs realized income gaps and estimated disruption duration.', gradient: 'from-blue-500 to-cyan-600', glow: 'group-hover:shadow-blue-500/20' },
  { icon: Lock, title: 'AI Fraud Detection', desc: 'Isolation Forest + DBSCAN detect GPS spoofing, fake inactivity, duplicate claims, and coordinated fraud rings.', gradient: 'from-red-500 to-rose-600', glow: 'group-hover:shadow-red-500/20' },
  { icon: AlertTriangle, title: 'Preventive Alerts', desc: 'Warned before disruptions hit. System suggests safer delivery zones and optimal time shifts to maximize earnings.', gradient: 'from-amber-500 to-yellow-600', glow: 'group-hover:shadow-amber-500/20' },
  { icon: TrendingUp, title: 'Multi-Platform Tracking', desc: 'Aggregates earnings from Zomato, Swiggy, and other platforms into a unified income prediction pipeline.', gradient: 'from-pink-500 to-rose-600', glow: 'group-hover:shadow-pink-500/20' },
  { icon: Star, title: 'Dynamic Premium Model', desc: 'Weekly premium adjusts based on risk and your reliability score—rewarding trusted partners with fairer rates.', gradient: 'from-violet-500 to-purple-700', glow: 'group-hover:shadow-violet-500/20' },
]

/* ── Workflow steps ── */
const steps = [
  { n: '01', title: 'Register & Connect', desc: 'Link Zomato/Swiggy account and set coverage profile', icon: Users, color: 'text-orange-400' },
  { n: '02', title: 'Risk Assessment', desc: 'AI calculates your Worker Reliability Score and weekly premium', icon: Brain, color: 'text-purple-400' },
  { n: '03', title: 'Income Prediction', desc: 'Hybrid AI models forecast expected hourly and daily earnings', icon: TrendingUp, color: 'text-blue-400' },
  { n: '04', title: 'Real-time Monitoring', desc: 'System tracks weather, traffic, and orders in your zone 24/7', icon: Activity, color: 'text-emerald-400' },
  { n: '05', title: 'Preventive Alert', desc: 'Get notified before disruptions hit your delivery zone', icon: AlertTriangle, color: 'text-yellow-400' },
  { n: '06', title: 'Auto Trigger', desc: 'Smart engine detects income drop and activates claim automatically', icon: Zap, color: 'text-orange-400' },
  { n: '07', title: 'Instant Processing', desc: 'Claim validated by AI against fraud and activity patterns', icon: CheckCircle, color: 'text-purple-400' },
  { n: '08', title: 'Payout Received', desc: 'Money in your account within minutes, not days', icon: DollarSign, color: 'text-emerald-400' },
]

export default function Home() {
  const { user, locationCity } = useAuth()
  
  return (
    <div className="overflow-hidden">
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/6 w-[700px] h-[700px] rounded-full bg-orange-500/8 blur-[130px] animate-orb" />
          <div className="absolute bottom-1/4 right-1/6 w-[600px] h-[600px] rounded-full bg-purple-600/8 blur-[120px] animate-orb2" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-indigo-600/4 blur-[150px]" />
        </div>
        {/* Dot grid */}
        <div className="absolute inset-0 grid-bg opacity-60" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-16 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <motion.div
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/25 mb-7"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            >
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-blink" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
              <span className="text-orange-300 text-sm font-semibold tracking-wide">AI-Powered Income Protection</span>
            </motion.div>

            <motion.h1
              className="text-6xl xl:text-7xl font-black leading-[1.05] mb-6 tracking-tight"
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.7 }}
            >
              <span className="block text-slate-900 dark:text-white">Shield Your</span>
              <span className="block gradient-text">Earnings.</span>
              <span className="block text-slate-900 dark:text-white text-5xl xl:text-6xl mt-1">Empower Every</span>
              <span className="block text-slate-900 dark:text-white text-5xl xl:text-6xl">Delivery.</span>
            </motion.h1>

            <motion.p
              className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-9 max-w-lg"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            >
              EarnKavach is India's first AI engine that{' '}
              <span className="text-slate-900 dark:text-white font-semibold">predicts, prevents, and compensates</span>{' '}
              income loss for Zomato & Swiggy partners — caused by rain, heat, traffic, and disruptions — <span className="text-orange-400 font-semibold">automatically</span>.
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-4 mb-12"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            >
              <Link to="/dashboard">
                <motion.button
                  className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-base shadow-2xl shadow-orange-500/30"
                  whileHover={{ scale: 1.04, y: -2, boxShadow: '0 20px 60px rgba(249,115,22,0.4)' }}
                  whileTap={{ scale: 0.97 }}
                >
                  View Dashboard <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <Link to="/demo">
                <motion.button
                  className="flex items-center gap-2.5 px-8 py-4 rounded-2xl glass border border-slate-200/80 font-bold text-base text-slate-900 dark:border-white/10 dark:text-white"
                  whileHover={{ scale: 1.04, y: -2, backgroundColor: 'rgba(255,255,255,0.06)' }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Zap className="w-5 h-5 text-orange-400" /> Live Demo
                </motion.button>
              </Link>
            </motion.div>

            {/* Stats row */}
            <motion.div
              className="flex items-center gap-8"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            >
              {[
                { val: '2.3M+', label: 'Workers Protected' },
                { val: '₹4.2Cr', label: 'Claims Paid' },
                { val: '<5min', label: 'Payout Time' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl font-black text-slate-900 dark:text-white">{s.val}</div>
                  <div className="text-[11px] text-slate-500 font-medium">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — floating dashboard card */}
          <motion.div
            className="hidden lg:block relative"
            initial={{ opacity: 0, x: 60, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 0.35, duration: 0.9, ease: 'easeOut' }}
          >
            <div className="relative">
              {/* Glow ring */}
              <div className="absolute -inset-8 rounded-3xl bg-orange-500/8 blur-2xl animate-orb" />

              {/* Main card */}
              <div className="relative glass rounded-3xl p-6 glow-orange animate-float-y">
                <div className="flex items-center gap-3 mb-5">
                  <div className="relative">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                      <Bike className="h-5 w-5 text-white" />
                    </div>
                    <div className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-slate-50 bg-emerald-400 dark:border-[#07070f]" />
                  </div>
                  <div className="flex-1">
                    <div className="text-slate-900 dark:text-white font-bold text-sm">{user?.name || 'Rahul Sharma'}</div>
                    <div className="text-slate-600 dark:text-slate-400 text-xs">{user?.platform || 'Zomato'} Partner · {locationCity || 'India'}</div>
                  </div>
                  <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-emerald-400 text-xs font-semibold">Active</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="glass-orange rounded-2xl p-3.5">
                    <div className="text-slate-600 dark:text-slate-400 text-xs mb-1 font-medium">Today's Income</div>
                    <div className="text-slate-900 dark:text-white text-2xl font-black">₹620</div>
                    <div className="text-red-400 text-xs mt-0.5 font-medium">↓ ₹230 disruption</div>
                  </div>
                  <div className="glass-purple rounded-2xl p-3.5">
                    <div className="text-slate-600 dark:text-slate-400 text-xs mb-1 font-medium">WRS Score</div>
                    <div className="text-purple-400 text-2xl font-black">87<span className="text-lg text-slate-500">/100</span></div>
                    <div className="text-emerald-400 text-xs mt-0.5 font-medium">↑ Excellent</div>
                  </div>
                </div>

                {/* Mini chart bars */}
                <div className="mb-4">
                  <div className="flex items-end gap-1 h-12">
                    {[65, 85, 50, 90, 75, 40, 62].map((h, i) => (
                      <motion.div
                        key={i}
                        className={`flex-1 rounded-sm ${i === 6 ? 'bg-orange-500' : 'bg-slate-300/70 dark:bg-white/10'}`}
                        style={{ height: `${h}%` }}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: 0.8 + i * 0.06, duration: 0.4 }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-slate-600 text-[10px]">Mon</span>
                    <span className="text-orange-400 text-[10px] font-bold">Today</span>
                  </div>
                </div>

                {/* Alert */}
                <div className="glass-red rounded-2xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <CloudRain className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-red-300 text-xs font-bold">Heavy Rain Alert</div>
                    <div className="text-slate-600 dark:text-slate-400 text-xs">Auto-claim triggered · ₹230</div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-red-400 animate-blink" />
                </div>
              </div>

              {/* Floating payout badge */}
              <motion.div
                className="absolute -bottom-10 -right-10 glass rounded-2xl p-4 glow-emerald"
                initial={{ opacity: 0, scale: 0.7, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 1.1, type: 'spring' }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-900 dark:text-white text-xs font-bold">Claim Approved!</span>
                </div>
                <div className="text-3xl font-black gradient-text-green mb-0.5">₹230</div>
                <div className="text-slate-600 dark:text-slate-400 text-xs">UPI · 3 minutes</div>
              </motion.div>

              {/* AI prediction badge */}
              <motion.div
                className="absolute -top-8 -left-8 glass rounded-2xl p-3.5"
                initial={{ opacity: 0, scale: 0.7, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 1.3, type: 'spring' }}
              >
                <div className="text-[10px] text-slate-500 font-medium mb-1.5">AI Prediction</div>
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span className="text-slate-900 dark:text-white text-sm font-bold">₹850 expected</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Confidence: 94.2%</div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}
        >
          <div className="text-slate-600 text-[11px] font-medium tracking-widest uppercase">Scroll</div>
          <div className="flex h-8 w-5 items-start justify-center rounded-full border border-slate-300/90 p-1 dark:border-white/20">
            <motion.div
              className="w-1.5 h-2 rounded-full bg-orange-500/70"
              animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}
            />
          </div>
        </motion.div>
      </section>

      {/* ── PROBLEM STATEMENT ── */}
      <ProblemSection />

      {/* ── FEATURES ── */}
      <FeaturesSection />

      {/* ── HOW IT WORKS ── */}
      <HowItWorksSection />

      {/* ── AI ARCHITECTURE ── */}
      <AIArchSection />

      {/* ── CTA ── */}
      <CTASection />
    </div>
  )
}

/* ─────────────────── Problem Section ─────────────────── */
function ProblemSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const stats = [
    { value: 45, suffix: 'Cr+', prefix: '₹', label: 'Annual income lost to weather disruptions by gig workers in India', color: 'text-red-400' },
    { value: 23, suffix: 'M+', prefix: '', label: 'Gig delivery workers in India with zero automated income protection', color: 'text-orange-400' },
    { value: 0, suffix: '', prefix: '', label: 'Existing automated solutions for parametric gig income stabilization', color: 'text-amber-400' },
  ]

  return (
    <section ref={ref} className="py-28 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-red-600/5 blur-[100px] rounded-full" />
      </div>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-red mb-5">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span className="text-red-300 text-xs font-semibold tracking-wide uppercase">The Crisis</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-5">Millions of Workers.  <span className="text-red-400">Zero Protection.</span></h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            India's gig delivery partners earn ₹400–1200/day but lose <strong className="text-slate-900 dark:text-white">20–60% of income</strong> to uncontrollable external disruptions — with no recourse.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              className="glass rounded-3xl p-8 text-center card-hover relative overflow-hidden"
              initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.12, duration: 0.6 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent" />
              <div className={`text-5xl md:text-6xl font-black mb-3 ${s.color}`}>
                {inView && <Counter end={s.value} prefix={s.prefix} suffix={s.suffix} duration={2} />}
              </div>
              <div className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed relative z-10">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Problem breakdown */}
        <motion.div
          className="glass rounded-3xl p-8 md:p-10"
          initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.4, duration: 0.6 }}
        >
          <h3 className="text-slate-900 dark:text-white font-bold text-xl mb-6">What causes income loss?</h3>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { icon: CloudRain, label: 'Heavy Rain', pct: 38, color: 'bg-blue-500' },
              { icon: Cpu, label: 'Extreme Heat', pct: 24, color: 'bg-orange-500' },
              { icon: Network, label: 'Traffic / Blockades', pct: 21, color: 'bg-amber-500' },
              { icon: Layers, label: 'Local Restrictions', pct: 17, color: 'bg-red-500' },
            ].map((item, i) => (
              <motion.div key={i} className="space-y-3" initial={{ opacity: 0, x: -20 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.5 + i * 0.08 }}>
                <div className="flex items-center gap-2">
                  <item.icon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <span className="text-slate-300 text-sm font-medium">{item.label}</span>
                  <span className="ml-auto text-slate-900 dark:text-white font-bold text-sm">{item.pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200/90 dark:bg-white/5">
                  <motion.div
                    className={`h-full rounded-full ${item.color}`}
                    initial={{ width: 0 }}
                    animate={inView ? { width: `${item.pct}%` } : {}}
                    transition={{ delay: 0.7 + i * 0.1, duration: 1.2, ease: 'easeOut' }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ─────────────────── Features Section ─────────────────── */
function FeaturesSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="py-28 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-purple-600/5 blur-[120px] rounded-full" />
      </div>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-purple mb-5">
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-purple-300 text-xs font-semibold tracking-wide uppercase">Core Capabilities</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-5">9 Features. One <span className="gradient-text">Shield.</span></h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-xl mx-auto">Every feature works in harmony to detect, predict, protect, and pay — faster than any human process.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={i}
              className="group glass rounded-3xl p-6 card-hover relative overflow-hidden cursor-default"
              initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.07, duration: 0.5 }}
              whileHover={{ y: -6 }}
            >
              {/* Hover glow */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${f.gradient} opacity-0`} style={{ opacity: 0 }} />
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `radial-gradient(circle at 50% 0%, rgba(255,255,255,0.04), transparent 60%)` }} />

              <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4 shadow-lg transition-all duration-300 ${f.glow} group-hover:scale-110`}>
                <f.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="mb-2 text-base font-bold text-slate-900 group-hover:text-slate-800 dark:text-white dark:group-hover:text-white">{f.title}</h3>
              <p className="text-sm leading-relaxed text-slate-600 transition-colors group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-300">{f.desc}</p>

              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────── How It Works ─────────────────── */
function HowItWorksSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="py-28 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/5 blur-[120px] rounded-full" />
      </div>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-orange mb-5">
            <Clock className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-orange-300 text-xs font-semibold tracking-wide uppercase">The Workflow</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-5">From <span className="text-orange-400">Disruption</span> to <span className="gradient-text-green">Payout</span><br/>in Minutes.</h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-xl mx-auto">8 automated steps. Zero paperwork. No delays.</p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-5">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              className="relative"
              initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              {i < steps.length - 1 && (
                <div className="pointer-events-none absolute left-[calc(100%+10px)] top-8 z-10 hidden h-px w-5 bg-gradient-to-r from-slate-300 to-transparent dark:from-white/20 md:block" />
              )}
              <div className="glass rounded-2xl p-5 h-full hover:glow-orange transition-all duration-300 group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/80 glass dark:border-white/10">
                    <span className="text-xs font-black text-slate-500">{s.n}</span>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-200/70 transition-transform group-hover:scale-110 dark:bg-white/5">
                    <s.icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                </div>
                <h3 className="text-slate-900 dark:text-white font-bold text-sm mb-2">{s.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────── AI Architecture ─────────────────── */
function AIArchSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="py-28 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/6 blur-[100px] rounded-full" />
      </div>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-purple mb-5">
            <Brain className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-purple-300 text-xs font-semibold tracking-wide uppercase">AI/ML Architecture</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-5">Powered by <span className="gradient-text">Deep Intelligence</span></h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: 'Income Prediction Model',
              subtitle: 'LSTM/ARIMA + XGBoost Hybrid',
              color: 'glass-purple',
              icon: TrendingUp,
              iconColor: 'text-purple-400',
              items: ['Historical earnings (30-day)', 'Time of day & day of week', 'Weather conditions', 'Location demand signal', 'Platform activity patterns'],
            },
            {
              title: 'Worker Reliability Score',
              subtitle: 'Weighted Composite Index',
              color: 'glass-orange',
              icon: Activity,
              iconColor: 'text-orange-400',
              items: [
                'Activity consistency (most weight)',
                'Order acceptance rate',
                'Location authenticity signals',
                'Past claims honesty',
                'Platform rating',
              ],
            },
            {
              title: 'Fraud Detection Model',
              subtitle: 'Isolation Forest + DBSCAN',
              color: 'glass-red',
              icon: Lock,
              iconColor: 'text-red-400',
              items: ['GPS spoofing detection', 'Fake inactivity patterns', 'Duplicate claim analysis', 'Cluster fraud rings', 'Behavioral anomaly scoring'],
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              className={`${card.color} rounded-3xl p-6 card-hover`}
              initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.12 }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200/80 dark:bg-white/10">
                  <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
                <div>
                  <h3 className="text-slate-900 dark:text-white font-bold text-sm">{card.title}</h3>
                  <p className="text-slate-500 text-xs">{card.subtitle}</p>
                </div>
              </div>
              <ul className="space-y-2 mb-5">
                {card.items.map((item, j) => (
                  <li key={j} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <div className="h-1 w-1 flex-shrink-0 rounded-full bg-slate-400/80 dark:bg-white/30" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="rounded-xl border border-slate-200/90 bg-slate-900/[0.04] p-3 dark:border-white/5 dark:bg-black/30">
                <div className="text-slate-500 text-[10px] font-mono mb-1">Model outputs are used internally</div>
                <div className="text-slate-900 dark:text-white text-[11px] font-mono leading-relaxed break-all">Expected earnings, tier, and fraud decisions are computed from the signals above.</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─────────────────── CTA Section ─────────────────── */
function CTASection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="py-28 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/5 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-orange-500/8 blur-[120px] rounded-full" />
      </div>
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-emerald mb-6">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-300 text-xs font-semibold tracking-wide uppercase">Start Today</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-5 leading-tight">
            Your Earnings Deserve <span className="gradient-text">Protection.</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-xl mb-10 max-w-2xl mx-auto">
            Join thousands of delivery partners already using EarnKavach. Setup takes 2 minutes. Coverage starts immediately.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/dashboard">
              <motion.button
                className="flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 font-black text-lg text-white shadow-2xl shadow-orange-500/40"
                whileHover={{ scale: 1.05, boxShadow: '0 25px 70px rgba(249,115,22,0.5)' }}
                whileTap={{ scale: 0.97 }}
              >
                <Shield className="w-6 h-6" /> Get Protected Now
              </motion.button>
            </Link>
            <Link to="/demo">
              <motion.button
                className="flex items-center gap-3 px-10 py-5 rounded-2xl gradient-border text-slate-900 dark:text-white font-black text-lg"
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              >
                <BarChart3 className="w-6 h-6 text-purple-400" /> Watch Live Demo
              </motion.button>
            </Link>
          </div>
          <p className="text-slate-600 text-sm mt-6">No credit card required · ₹49/week after free trial · Cancel anytime</p>
        </motion.div>
      </div>
    </section>
  )
}
