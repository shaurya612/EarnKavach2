import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Shield, Activity, Database, Server, BarChart3, 
  Lock, Zap, Globe, AlertTriangle, Layers
} from 'lucide-react'

const features = [
  { icon: Shield, title: 'Fraud Neutralization', desc: 'Isolation Forest AI instantly blocks GPS-spoofing and coordinated fraud rings without human intervention.', gradient: 'from-purple-600 to-indigo-700' },
  { icon: BarChart3, title: 'Loss Ratio Analytics', desc: 'Real-time aggregation of premiums vs claim payouts to track platform profitability and pricing adjustments.', gradient: 'from-emerald-500 to-teal-600' },
  { icon: Activity, title: 'Micro-Disruption Maps', desc: '7-day predictive weather forecasting natively hooked into Open-Meteo to anticipate massive claim events.', gradient: 'from-orange-500 to-amber-600' },
  { icon: Zap, title: 'Automated Settlements', desc: 'Razorpay Integration handles micro-payouts in 3 minutes via UPI, completely eliminating manual ledger work.', gradient: 'from-blue-500 to-cyan-600' },
  { icon: Database, title: 'Data Telemetry', desc: 'Direct ingestion of gig-worker platform data seamlessly updating the global parametric engine state.', gradient: 'from-yellow-500 to-orange-600' },
  { icon: Globe, title: 'Scalable Architecture', desc: 'Distributed node cluster capable of processing thousands of localized disruption checks instantly.', gradient: 'from-fuchsia-500 to-rose-600' },
]

export default function AdminHome() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <div className="overflow-hidden min-h-screen bg-[#020205] text-white">
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full bg-purple-600/5 blur-[150px] animate-pulse" />
          <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-blue-600/5 blur-[150px]" />
          <div className="absolute inset-0 grid-bg opacity-20" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-16 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Text */}
          <div>
            <motion.div
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/25 mb-7"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            >
              <Server className="w-4 h-4 text-purple-400" />
              <span className="text-purple-300 text-sm font-semibold tracking-wide">Enterprise Operations</span>
            </motion.div>

            <motion.h1
              className="text-5xl xl:text-7xl font-black leading-[1.05] mb-6 tracking-tight"
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.7 }}
            >
              <span className="block text-slate-200">Global System</span>
              <span className="block text-purple-400">Control Center.</span>
            </motion.h1>

            <motion.p
              className="text-slate-400 text-lg leading-relaxed mb-9 max-w-lg"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            >
              Manage scale, track systemic fraud, and monitor micro-economic disruptions in real-time. The EarnKavach automated parametric engine guarantees frictionless payouts and zero manual claims processing.
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-4 mb-12"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            >
              <Link to="/admin">
                <motion.button
                  className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-base shadow-2xl shadow-purple-500/20 hover:shadow-purple-500/40 border border-purple-500/50"
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Database className="w-5 h-5" /> Launch Admin Portal
                </motion.button>
              </Link>
              <Link to="/demo">
                <motion.button
                  className="flex items-center gap-2.5 px-8 py-4 rounded-2xl glass border border-slate-700 font-bold text-base text-slate-300 hover:text-white"
                  whileHover={{ scale: 1.04, y: -2, backgroundColor: 'rgba(255,255,255,0.05)' }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Activity className="w-5 h-5 text-emerald-400" /> View Live Simulation
                </motion.button>
              </Link>
            </motion.div>

            {/* Performance Stats */}
            <motion.div
              className="flex flex-wrap items-center gap-8 border-t border-white/10 pt-8"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            >
              {[
                { val: '99.9%', label: 'Server Uptime' },
                { val: '<30ms', label: 'Inference Latency' },
                { val: '0', label: 'Manual Paperwork' },
              ].map((s, i) => (
                <div key={i}>
                  <div className="text-2xl font-black text-white">{s.val}</div>
                  <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mt-1">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — B2B Server UI Visualization */}
          <motion.div
            className="hidden lg:block relative"
            initial={{ opacity: 0, x: 60, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 0.35, duration: 0.9, ease: 'easeOut' }}
          >
            <div className="relative">
              <div className="absolute -inset-8 rounded-3xl bg-indigo-500/10 blur-3xl animate-pulse" />
              <div className="relative glass rounded-3xl p-6 border border-white/10 bg-[#0a0a0f]/80 shadow-2xl backdrop-blur-xl">
                
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                   <div className="flex items-center gap-2">
                     <Lock className="text-emerald-400 w-4 h-4" />
                     <span className="text-sm font-bold text-slate-300">System Activity</span>
                   </div>
                   <div className="px-2 py-1 bg-emerald-500/10 rounded border border-emerald-500/20 text-[10px] text-emerald-400 uppercase tracking-widest font-bold animate-pulse">Monitoring</div>
                </div>

                <div className="space-y-3 mb-6">
                  {[
                    { action: 'Fraud engine rejected 4 payloads', loc: 'Delhi Zone B', time: 'Just now', color: 'text-red-400' },
                    { action: 'Disruption matched: Rainfall Event', loc: 'Bangalore Zone A', time: '2 mins ago', color: 'text-amber-400' },
                    { action: '8 payout ledgers settled via Razorpay', loc: 'Global', time: '5 mins ago', color: 'text-emerald-400' },
                  ].map((log, i) => (
                    <div key={i} className="flex flex-col gap-1 p-3 rounded-lg bg-white/5 border border-white/5">
                      <div className="flex justify-between items-center">
                        <span className={`text-xs font-mono font-semibold ${log.color}`}>{log.action}</span>
                        <span className="text-[10px] text-slate-500">{log.time}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 tracking-wide">{log.loc}</div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/5 bg-gradient-to-br from-indigo-500/10 to-transparent p-4">
                    <Layers className="w-5 h-5 text-indigo-400 mb-2" />
                    <div className="text-2xl font-black text-white">4</div>
                    <div className="text-xs text-slate-500 mt-1">Active ML Pipelines</div>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-gradient-to-br from-rose-500/10 to-transparent p-4">
                    <AlertTriangle className="w-5 h-5 text-rose-400 mb-2" />
                    <div className="text-2xl font-black text-white">0</div>
                    <div className="text-xs text-slate-500 mt-1">Current Outages</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── B2B FEATURES ── */}
      <section ref={ref} className="py-28 relative border-t border-white/5 bg-[#050508]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-5">Enterprise-Grade <span className="text-purple-400">Architecture.</span></h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">Built to validate, scale, and secure thousands of parametric micro-transactions concurrently.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={i}
                className="group p-6 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300"
                initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-5 shadow-lg`}>
                  <f.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-white leading-tight">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
