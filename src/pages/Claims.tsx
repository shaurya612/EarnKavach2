import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Clock, DollarSign, Shield, TriangleAlert, Zap, Search, Sparkles, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import {
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from 'recharts'

type CoverageTier = 'Trusted' | 'Suspicious' | 'Fraud'
type ClaimStatus = 'paid' | 'processing' | 'blocked'

type ClaimRecord = {
  id: string
  dateISO: string
  scenario: string
  platform: 'Zomato' | 'Swiggy'
  zone: string
  wrs: number
  rainfall: number
  rainThreshold: number
  ordersDropPct: number
  userActive: boolean
  fraudScore: number
  tier: CoverageTier
  status: ClaimStatus
  lostHours: number
  payoutINR: number
  processingTime: string
  fraudNotes?: string[]
  heatX?: number
  heatY?: number
}



function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function formatINR(n: number) {
  return `₹${Math.round(n).toLocaleString('en-IN')}`
}

function statusPill(status: ClaimStatus) {
  if (status === 'paid') return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
  if (status === 'blocked') return 'bg-red-500/10 border-red-500/20 text-red-400'
  return 'bg-amber-500/10 border-amber-500/20 text-amber-400'
}

function tierPill(tier: CoverageTier) {
  if (tier === 'Trusted') return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
  if (tier === 'Suspicious') return 'bg-amber-500/10 border-amber-500/20 text-amber-400'
  return 'bg-red-500/10 border-red-500/20 text-red-400'
}

function hashCoords(zone: string) {
  let h = 0
  for (let i = 0; i < zone.length; i++) h = (h * 31 + zone.charCodeAt(i)) % 100000
  const x = h % 10
  const y = (Math.floor(h / 10) + x * 3) % 10
  return { x, y }
}

function defaultClaims(): ClaimRecord[] {
  const now = new Date()
  const iso1 = new Date(now.getTime() - 1000 * 60 * 60 * 36).toISOString()
  const iso2 = new Date(now.getTime() - 1000 * 60 * 60 * 12).toISOString()
  return [
    {
      id: 'CL-2847',
      dateISO: iso1,
      scenario: 'Heavy rain triggered coverage',
      platform: 'Zomato',
      zone: 'North Zone',
      wrs: 87,
      rainfall: 46,
      rainThreshold: 30,
      ordersDropPct: 55,
      userActive: true,
      fraudScore: 0.18,
      tier: 'Trusted',
      status: 'paid',
      lostHours: 3,
      payoutINR: 264,
      processingTime: '4 min',
    },
    {
      id: 'CL-2791',
      dateISO: iso2,
      scenario: 'Traffic block compensation',
      platform: 'Swiggy',
      zone: 'South District',
      wrs: 66,
      rainfall: 12,
      rainThreshold: 20,
      ordersDropPct: 44,
      userActive: true,
      fraudScore: 0.41,
      tier: 'Suspicious',
      status: 'processing',
      lostHours: 2,
      payoutINR: 192,
      processingTime: '—',
      fraudNotes: ['Delayed verification: intermediate risk tier'],
    },
  ]
}

function HeatmapSnapshot({
  rainfall,
  ordersDropPct,
  x,
  y,
}: {
  rainfall: number
  ordersDropPct: number
  x: number
  y: number
}) {
  const grid = 10
  const intensities = useMemo(() => {
    const seed = Math.round(rainfall * 10 + ordersDropPct * 7)
    const cell: number[][] = []
    for (let i = 0; i < grid; i++) {
      const row: number[] = []
      for (let j = 0; j < grid; j++) {
        const dx = i - x
        const dy = j - y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const proximity = clamp(1 - dist / 7.2, 0, 1)
        const noise = (Math.sin((i + 1) * 12.9898 + (j + 1) * 78.233 + seed) * 43758.5453) % 1
        const normalizedNoise = noise < 0 ? noise + 1 : noise
        const base = (rainfall / 80) * 0.7 + (ordersDropPct / 70) * 0.4
        const raw = 100 * (0.55 * base + 0.35 * proximity + 0.1 * normalizedNoise)
        row.push(clamp(raw, 0, 100))
      }
      cell.push(row)
    }
    return cell
  }, [ordersDropPct, rainfall, x, y])

  const riskColor = (v: number) => {
    if (v >= 75) return { bg: 'rgba(239,68,68,0.35)', border: 'rgba(239,68,68,0.55)' }
    if (v >= 55) return { bg: 'rgba(249,115,22,0.30)', border: 'rgba(249,115,22,0.50)' }
    if (v >= 35) return { bg: 'rgba(168,85,247,0.25)', border: 'rgba(168,85,247,0.45)' }
    return { bg: 'rgba(255,255,255,0.07)', border: 'rgba(255,255,255,0.12)' }
  }

  return (
    <div className="glass rounded-3xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-4 h-4 text-orange-400" />
        <div>
          <div className="text-white font-bold text-sm">Risk Heat Snapshot</div>
          <div className="text-slate-500 text-[11px]">Preview around selected zone.</div>
        </div>
      </div>

      <div className="grid grid-cols-10 gap-[3px]">
        {intensities.map((row, i) =>
          row.map((v, j) => {
            const c = riskColor(v)
            const selected = i === x && j === y
            const isHigh = v >= 75
            return (
              <div
                key={`${i}-${j}`}
                className="h-[12px] rounded-[3px] border"
                style={{
                  backgroundColor: c.bg,
                  borderColor: selected ? 'rgba(249,115,22,0.95)' : c.border,
                  transform: selected ? 'scale(1.08)' : isHigh ? 'scale(1.03)' : 'scale(1)',
                  transition: 'transform 250ms ease',
                  boxShadow: selected
                    ? '0 0 22px rgba(249,115,22,0.25)'
                    : isHigh
                      ? '0 0 16px rgba(239,68,68,0.16)'
                      : 'none',
                }}
              />
            )
          })
        )}
      </div>

      <div className="text-slate-500 text-xs mt-4">
        Marker: [{x + 1},{y + 1}]
      </div>
    </div>
  )
}

function Timeline({
  status,
}: {
  status: ClaimStatus
}) {
  const steps = status === 'paid'
    ? ['done', 'done', 'done', 'done', 'done']
    : status === 'blocked'
      ? ['done', status === 'blocked' ? 'done' : 'fail', 'fail', 'fail', 'fail']
      : ['done', 'running', 'running', 'idle', 'idle']

  const labels = [
    { t: 'Trigger Conditions', s: 'Check rainfall, orders drop, and active signal.' },
    { t: 'WRS Scoring', s: 'Reliability score decides coverage tier.' },
    { t: 'Fraud Signals', s: 'Isolation/DBSCAN style anomaly detection.' },
    { t: 'Micro Payout', s: 'Recovered amount is computed from the predicted income gap and estimated disruption duration.' },
    { t: status === 'paid' ? 'Approved' : status === 'blocked' ? 'Blocked' : 'Processing', s: 'UX fairness layer finalizes outcome.' },
  ]

  const iconFor = (st: string) => {
    if (st === 'done') return <CheckCircle2 className="w-4 h-4 text-emerald-400" />
    if (st === 'fail') return <TriangleAlert className="w-4 h-4 text-red-400" />
    if (st === 'running') return <Zap className="w-4 h-4 text-orange-400" />
    return <Shield className="w-4 h-4 text-slate-500" />
  }

  const badgeClass = (st: string) => {
    if (st === 'done') return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
    if (st === 'fail') return 'bg-red-500/10 border-red-500/20 text-red-400'
    if (st === 'running') return 'bg-orange-500/10 border-orange-500/20 text-orange-400'
    return 'bg-white/5 border-white/10 text-slate-400'
  }

  return (
    <div className="glass rounded-3xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <div>
            <div className="text-white font-bold text-sm">Claim Timeline</div>
            <div className="text-slate-500 text-[11px]">What happened step-by-step.</div>
          </div>
        </div>
        <div className={`px-3 py-1.5 rounded-full border text-[11px] font-bold ${statusPill(status)}`}>
          {status === 'paid' ? 'PAID' : status === 'blocked' ? 'BLOCKED' : 'PROCESSING'}
        </div>
      </div>

      <div className="space-y-4">
        {labels.map((l, i) => (
          <motion.div key={l.t} className="flex items-start gap-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: i * 0.04 }}>
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${badgeClass(steps[i])}`}>
              {iconFor(steps[i])}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="text-white text-sm font-bold">{l.t}</div>
                <div className={`ml-auto text-[10px] font-bold px-2 py-1 rounded-full border ${badgeClass(steps[i])}`}>
                  {steps[i] === 'done' ? 'Done' : steps[i] === 'fail' ? 'Flagged' : steps[i] === 'running' ? 'In progress' : 'Pending'}
                </div>
              </div>
              <div className="text-slate-500 text-xs mt-1">{l.s}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default function Claims() {
  const [claims, setClaims] = useState<ClaimRecord[]>([])
  const [filter, setFilter] = useState<'all' | ClaimStatus>('all')
  const [search, setSearch] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)

  const { token, locationCity } = useAuth()

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const res = await axios.get('http://localhost:5000/claims', {
           headers: { Authorization: `Bearer ${token}` }
        })
        const mapped = res.data.map((d: any) => ({
            id: d._id.substring(d._id.length - 8).toUpperCase(),
            dateISO: d.createdAt,
            scenario: d.scenario,
            platform: d.platform,
            zone: locationCity || 'Central Grid',
            wrs: 85, // mockup ui stat
            rainfall: 45, // mockup ui stat
            rainThreshold: 30, // mockup ui stat
            ordersDropPct: 50, // mockup ui stat
            userActive: true, // mockup ui stat
            fraudScore: d.fraudScore,
            tier: d.tier,
            status: d.status,
            lostHours: 3, // mockup ui stat
            payoutINR: d.payoutINR,
            processingTime: d.processingTime,
            fraudNotes: d.fraudNotes || []
        }))
        setClaims(mapped)
        setActiveId(mapped[0]?.id ?? null)
      } catch (err) {
        console.error(err)
        setClaims(defaultClaims())
      }
    }
    if (token) fetchClaims()
  }, [token])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return claims.filter((c) => {
      const statusOk = filter === 'all' ? true : c.status === filter
      const qOk = !q ? true : `${c.id} ${c.zone} ${c.platform} ${c.tier}`.toLowerCase().includes(q)
      return statusOk && qOk
    })
  }, [claims, filter, search])

  const active = useMemo(() => filtered.find((c) => c.id === activeId) ?? filtered[0] ?? null, [activeId, filtered])

  const summary = useMemo(() => {
    const paid = claims.filter((c) => c.status === 'paid')
    const blocked = claims.filter((c) => c.status === 'blocked')
    const processing = claims.filter((c) => c.status === 'processing')
    return {
      paidCount: paid.length,
      paidTotal: paid.reduce((s, c) => s + c.payoutINR, 0),
      blockedCount: blocked.length,
      processingCount: processing.length,
    }
  }, [claims])

  const activeCoords = useMemo(() => {
    if (!active) return { x: 0, y: 0 }
    if (typeof active.heatX === 'number' && typeof active.heatY === 'number') return { x: active.heatX, y: active.heatY }
    return hashCoords(active.zone)
  }, [active])

  const activeChart = useMemo(() => {
    if (!active) return []
    const predicted = active.wrs * 9 + active.rainfall * 6 + active.ordersDropPct * 5
    const recovered = active.payoutINR
    const gap = Math.max(0, predicted - recovered)
    return [
      { label: 'Predicted', value: predicted },
      { label: 'Recovered', value: recovered },
      { label: 'Gap', value: gap },
    ]
  }, [active])

  return (
    <div className="min-h-screen pt-24 pb-16 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 right-1/4 w-[520px] h-[520px] rounded-full bg-purple-600/8 blur-[130px] animate-orb2" />
        <div className="absolute top-96 left-1/4 w-[420px] h-[420px] rounded-full bg-orange-500/7 blur-[120px] animate-orb" />
        <div className="absolute inset-0 grid-bg opacity-20" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-purple mb-5">
              <Shield className="w-4 h-4 text-purple-400" />
              <span className="text-purple-300 text-xs font-semibold tracking-wide uppercase">Claims & Payout Center</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-[1.05] mb-2">Track payouts, verify fraud, and present proof.</h1>
            <p className="text-slate-400 text-lg max-w-2xl">This demo stores claim history in your browser so you can present multiple scenarios instantly.</p>
          </motion.div>

          <motion.div className="lg:w-[420px]" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.05 }}>
            <div className="glass rounded-3xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-orange-400" />
                  <div className="text-white font-bold text-sm">Live Summary</div>
                </div>
                <Link to="/demo" className="text-orange-400 text-sm font-bold hover:text-orange-300 transition-colors">
                  Back to Simulator
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Stat label="Paid" value={`${summary.paidCount}`} sub={`${formatINR(summary.paidTotal)} total`} icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />} cls="glass-emerald" />
                <Stat label="Processing" value={`${summary.processingCount}`} sub="Pending verification" icon={<Clock className="w-4 h-4 text-amber-400" />} cls="glass-amber" />
                <Stat label="Blocked" value={`${summary.blockedCount}`} sub="Fraud tier flagged" icon={<TriangleAlert className="w-4 h-4 text-red-400" />} cls="glass-red" />
                <Stat label="Active" value={`${filtered.length}`} sub="Filtered view" icon={<Search className="w-4 h-4 text-purple-400" />} cls="glass-purple" />
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass rounded-3xl p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="text-white font-bold text-sm">Claims List</div>
                    <div className="text-slate-500 text-[11px]">Click a claim to view fraud/payout details.</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {(['all', 'paid', 'processing', 'blocked'] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                        filter === f ? 'bg-orange-500 border-orange-400 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {f === 'all' ? 'All' : f === 'paid' ? 'Paid' : f === 'processing' ? 'Processing' : 'Blocked'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1">
                  <div className="text-slate-500 text-[11px] font-bold mb-2">Search</div>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by ID, zone, tier..."
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-500/40"
                  />
                </div>
                <div className="w-[160px]">
                  <div className="text-slate-500 text-[11px] font-bold mb-2">Action</div>
                  <button
                    type="button"
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm font-bold hover:bg-white/10 transition-colors text-slate-200"
                    onClick={() => {
                        window.location.reload()
                    }}
                  >
                    Refresh Data
                  </button>
                </div>
              </div>

              <div className="space-y-3 max-h-[520px] overflow-auto pr-2">
                <AnimatePresence>
                  {filtered.map((c, i) => (
                    <motion.button
                      key={c.id + i}
                      type="button"
                      className="w-full text-left"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: i * 0.02 }}
                      onClick={() => setActiveId(c.id)}
                    >
                      <div
                        className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                          active?.id === c.id ? 'bg-white/[0.06] border-orange-500/30' : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05]'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${c.status === 'paid' ? 'bg-emerald-400' : c.status === 'blocked' ? 'bg-red-400' : 'bg-amber-400 animate-pulse'}`} />
                        <div className="flex-shrink-0 w-24">
                          <div className="text-white text-xs font-black">{c.id}</div>
                          <div className="text-slate-500 text-[10px] mt-0.5">{new Date(c.dateISO).toLocaleDateString('en-IN')}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-slate-300 text-xs font-medium truncate">{c.scenario}</div>
                          <div className="text-slate-500 text-[11px] mt-1 flex items-center gap-2">
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-orange-400" />
                              {c.zone}
                            </span>
                            <span className="text-slate-600">|</span>
                            <span>WRS {c.wrs}/100</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white text-sm font-black">{formatINR(c.payoutINR)}</div>
                          <div className={`mt-2 inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusPill(c.status)}`}>
                            {c.status === 'paid' ? 'Paid' : c.status === 'blocked' ? 'Blocked' : 'Processing'}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                  {!filtered.length && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-3xl p-6 text-center">
                      <div className="text-white font-bold">No claims match your filter.</div>
                      <div className="text-slate-500 text-sm mt-1">Try a different status or clear search.</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <AnimatePresence>
              {active && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.35 }}>
                  <div className="glass rounded-3xl p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className={`px-3 py-1.5 rounded-full border text-[11px] font-bold ${tierPill(active.tier)}`}>
                            {active.tier}
                          </div>
                          <div className={`px-3 py-1.5 rounded-full border text-[11px] font-bold ${statusPill(active.status)}`}>
                            {active.status === 'paid' ? 'Paid' : active.status === 'blocked' ? 'Blocked' : 'Processing'}
                          </div>
                        </div>
                        <div className="text-white text-2xl font-black mt-2">{formatINR(active.payoutINR)}</div>
                        <div className="text-slate-500 text-sm mt-1">
                          ID {active.id} · {new Date(active.dateISO).toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div className="w-[130px]">
                        <div className="rounded-2xl bg-white/5 border border-white/10 p-3.5">
                          <div className="text-slate-500 text-xs font-bold">Fraud Score</div>
                          <div className="text-white text-2xl font-black mt-1">{Math.round(active.fraudScore * 100)}%</div>
                          <div className={`text-[11px] mt-1 font-semibold ${active.status === 'blocked' ? 'text-red-300' : 'text-emerald-300'}`}>
                            {active.status === 'blocked' ? 'Flagged' : 'Clean'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <MiniLine label="Rainfall" value={`${active.rainfall}mm`} />
                      <MiniLine label="Orders Drop" value={`${active.ordersDropPct}%`} />
                      <MiniLine label="Lost Hours" value={`${active.lostHours}h`} />
                      <MiniLine label="Processing" value={active.processingTime} />
                    </div>
                  </div>

                  <div className="mt-6">
                    <Timeline status={active.status} />
                  </div>

                  <div className="mt-6">
                    <HeatmapSnapshot rainfall={active.rainfall} ordersDropPct={active.ordersDropPct} x={activeCoords.x} y={activeCoords.y} />
                  </div>

                  {active.status !== 'paid' && (
                    <div className="mt-6 glass rounded-3xl p-5">
                      <div className="flex items-center gap-2 mb-2">
                        {active.status === 'blocked' ? <TriangleAlert className="w-4 h-4 text-red-400" /> : <Clock className="w-4 h-4 text-amber-400" />}
                        <div className="text-white font-bold text-sm">Fraud Insights</div>
                      </div>
                      <div className="text-slate-500 text-xs">
                        {active.fraudNotes?.length
                          ? active.fraudNotes.join(' ')
                          : active.status === 'blocked'
                            ? 'Fraud tier blocked instant payout. Verification required.'
                            : 'Claim is in verification tier; waiting for stable signals.'}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 glass rounded-3xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="text-white font-bold text-sm">Recovery Visualization</div>
                        <div className="text-slate-500 text-[11px]">Predicted vs recovered gap.</div>
                      </div>
                    </div>
                    <div className="h-[220px]">
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={activeChart} barSize={30} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <Tooltip
                            contentStyle={{ background: 'rgba(13,13,26,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, backdropFilter: 'blur(20px)' }}
                            formatter={(val: any) => [`${Math.round(Number(val)).toLocaleString('en-IN')}`, 'value']}
                          />
                          <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#a855f7" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!active && (
              <div className="glass rounded-3xl p-5">
                <div className="text-white font-bold">Select a claim to view details.</div>
                <div className="text-slate-500 text-sm mt-1">Then present it on your hackathon screen.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function MiniLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-2xl p-3.5">
      <div className="text-slate-500 text-[10px] font-semibold">{label}</div>
      <div className="text-white text-sm font-bold mt-1">{value}</div>
    </div>
  )
}

function Stat({ label, value, sub, icon, cls }: { label: string; value: string; sub: string; icon: ReactNode; cls: string }) {
  return (
    <div className={`${cls} rounded-3xl p-4`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-slate-200 text-xs font-bold">{label}</div>
        {icon}
      </div>
      <div className="text-white text-2xl font-black">{value}</div>
      <div className="text-slate-400 text-[11px] mt-1">{sub}</div>
    </div>
  )
}

