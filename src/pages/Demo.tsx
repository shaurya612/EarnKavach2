import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import {
  Bike,
  Brain,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CloudRain,
  DollarSign,
  Gauge,
  MapPin,
  Shield,
  Sparkles,
  Timer,
  TriangleAlert,
  Zap,
  Wind,
  Activity,
  Lock,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type CoverageTier = 'Trusted' | 'Suspicious' | 'Fraud'
type ClaimStatus = 'paid' | 'processing' | 'blocked'

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function formatINR(n: number) {
  return `₹${Math.round(n).toLocaleString('en-IN')}`
}

function pickZone(x: number, y: number) {
  const zones = [
    'North Zone',
    'South District',
    'Central Grid',
    'East Sector',
    'West Hub',
    'Industrial Park',
    'Business Center',
    'Residential Sector',
    'Uptown Block',
    'Downtown Grid',
  ]
  const idx = (x * 17 + y * 13) % zones.length
  return zones[idx]
}

function computeFraudScore(opts: { wrs: number; rainfall: number; rainThreshold: number; ordersDropPct: number; userActive: boolean }) {
  const wrsRisk = (100 - opts.wrs) / 100 // higher = worse
  const severity = clamp((opts.rainfall - opts.rainThreshold) / Math.max(1, opts.rainThreshold), 0, 2) // 0..2+
  const ordersRisk = clamp((opts.ordersDropPct - 40) / 30, 0, 2) // 0..2+
  const inactivityRisk = opts.userActive ? 0 : 0.35
  const raw = 0.55 * wrsRisk + 0.25 * severity + 0.2 * ordersRisk + inactivityRisk
  return clamp(raw, 0, 1)
}

function computeTier(wrs: number): CoverageTier {
  if (wrs >= 80) return 'Trusted'
  if (wrs >= 60) return 'Suspicious'
  return 'Fraud'
}

function computeCoveragePercent(tier: CoverageTier, fraudScore: number) {
  // Fraud score slightly reduces effective coverage for borderline decisions.
  const fraudPenalty = 1 - clamp(fraudScore * 0.18, 0, 0.18)
  if (tier === 'Trusted') return 0.85 * fraudPenalty
  if (tier === 'Suspicious') return 0.62 * fraudPenalty
  return 0.22 * fraudPenalty
}

function computeExpectedHourly(wrs: number, platform: 'Zomato' | 'Swiggy', demandDropPct: number) {
  const base = platform === 'Zomato' ? 560 : 610
  const wrsBoost = (wrs - 50) * 1.4 // 0..70ish
  // Model assumes demand volatility: higher disruption typically increases "lost gap" urgency,
  // but expected baseline still shifts with how hard the orders fall.
  const demandFactor = 0.88 + clamp(demandDropPct / 100, 0, 0.7) // 0.88..1.36-ish
  const hourly = (base * 0.7 + wrsBoost) * demandFactor
  return clamp(hourly, 380, 980)
}

function buildScenarioLabel(opts: { rainfall: number; rainThreshold: number; ordersDropPct: number; userActive: boolean }) {
  const rainState = opts.rainfall > opts.rainThreshold ? 'Disruption active' : 'Below threshold'
  const ordersState = opts.ordersDropPct >= 40 ? 'Orders drop confirmed' : 'Orders drop insufficient'
  const activeState = opts.userActive ? 'Worker active' : 'Worker not active'
  return `${rainState} · ${ordersState} · ${activeState}`
}

function createId() {
  const t = Date.now().toString(36)
  const r = Math.random().toString(36).slice(2, 8)
  return `CL-${t.toUpperCase()}-${r.toUpperCase()}`
}

function CountUp({ value, suffix = '', durationMs = 900 }: { value: number; suffix?: string; durationMs?: number }) {
  const [display, setDisplay] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const start = performance.now()
    const from = display
    const to = value

    const tick = (now: number) => {
      const p = clamp((now - start) / durationMs, 0, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(from + (to - from) * eased)
      if (p < 1) rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <span>{Math.round(display).toLocaleString('en-IN')}{suffix}</span>
}

function RiskHeatmap({
  rainfall,
  ordersDropPct,
  x,
  y,
  onPick,
}: {
  rainfall: number
  ordersDropPct: number
  x: number
  y: number
  onPick: (nx: number, ny: number) => void
}) {
  const grid = 10

  const intensities = useMemo(() => {
    // Deterministic-ish map: same inputs -> same colors.
    const seed = Math.round(rainfall * 10 + ordersDropPct * 7)
    const cell: number[][] = []
    for (let i = 0; i < grid; i++) {
      const row: number[] = []
      for (let j = 0; j < grid; j++) {
        const dx = i - x
        const dy = j - y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const proximity = clamp(1 - dist / 7.2, 0, 1)
        // pseudo noise 0..1
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
    // v: 0..100
    if (v >= 75) return { bg: 'rgba(239,68,68,0.35)', border: 'rgba(239,68,68,0.55)', text: 'rgba(255,180,180,0.95)' }
    if (v >= 55) return { bg: 'rgba(249,115,22,0.30)', border: 'rgba(249,115,22,0.50)', text: 'rgba(255,214,170,0.95)' }
    if (v >= 35) return { bg: 'rgba(168,85,247,0.25)', border: 'rgba(168,85,247,0.45)', text: 'rgba(232,208,255,0.95)' }
    return { bg: 'rgba(255,255,255,0.07)', border: 'rgba(255,255,255,0.12)', text: 'rgba(226,232,240,0.92)' }
  }

  return (
    <div className="glass rounded-3xl p-5 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-orange-400" />
          <div>
            <div className="text-white font-bold text-sm">Hyperlocal Risk Map</div>
            <div className="text-slate-500 text-[11px]">Click a zone to preview trigger.</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-[11px]">
          <span className="w-2 h-2 rounded-full bg-red-400/80" />
          High
          <span className="w-2 h-2 rounded-full bg-orange-400/80 ml-2" />
          Med
          <span className="w-2 h-2 rounded-full bg-purple-400/80 ml-2" />
          Low
        </div>
      </div>

      <div className="relative">
        {/* Slightly animated shimmer overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-50">
          <div className="absolute -left-10 top-0 w-[160%] h-full shimmer" style={{ transform: 'skewX(-12deg)' }} />
        </div>

        <div className="grid grid-cols-10 gap-[3px] relative z-10">
          {intensities.map((row, i) =>
            row.map((v, j) => {
              const c = riskColor(v)
              const selected = i === x && j === y
              const isHigh = v >= 75

              return (
                <button
                  key={`${i}-${j}`}
                  type="button"
                  aria-label={`Select zone ${i + 1}-${j + 1}`}
                  onClick={() => onPick(i, j)}
                  className={`h-[14px] rounded-[3px] border transition-all ${
                    selected ? 'scale-[1.06] ring-1 ring-orange-400' : 'hover:scale-[1.06]'
                  }`}
                  style={{
                    backgroundColor: c.bg,
                    borderColor: selected ? 'rgba(249,115,22,0.95)' : c.border,
                    boxShadow: selected
                      ? '0 0 22px rgba(249,115,22,0.25)'
                      : isHigh
                        ? '0 0 16px rgba(239,68,68,0.18)'
                        : 'none',
                  }}
                />
              )
            })
          )}
        </div>

        <motion.div
          className="absolute -bottom-12 left-1/2 -translate-x-1/2 px-3 py-2 rounded-xl glass-orange text-center"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
        >
          <div className="flex items-center justify-center gap-2">
            <CloudRain className="w-4 h-4 text-orange-400" />
            <span className="text-white text-xs font-bold">{pickZone(x, y)}</span>
          </div>
          <div className="text-slate-400 text-[10px] mt-0.5">
            Selected Cell: [{x + 1},{y + 1}]
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function Step({
  title,
  subtitle,
  icon,
  state,
}: {
  title: string
  subtitle: string
  icon: ReactNode
  state: 'idle' | 'running' | 'done' | 'fail'
}) {
  const pill =
    state === 'done'
      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
      : state === 'fail'
        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
        : state === 'running'
          ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
          : 'bg-white/5 text-slate-400 border border-white/10'

  return (
    <motion.div
      className="flex items-start gap-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${pill}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <div className={`text-sm font-bold ${state === 'fail' ? 'text-red-300' : state === 'done' ? 'text-white' : 'text-white'}`}>{title}</div>
          <div className={`ml-auto text-[10px] font-bold px-2 py-1 rounded-full ${pill}`}>
            {state === 'idle' ? 'Pending' : state === 'running' ? 'Running' : state === 'done' ? 'Complete' : 'Flagged'}
          </div>
        </div>
        <div className="text-slate-500 text-xs mt-1">{subtitle}</div>
      </div>
    </motion.div>
  )
}

export default function Demo() {
  const { user, token, locationCity } = useAuth()
  const [platform, setPlatform] = useState<'Zomato' | 'Swiggy'>('Zomato')
  const [userActive, setUserActive] = useState(true)
  const [wrs, setWrs] = useState(82)
  const [rainThreshold, setRainThreshold] = useState(30)
  const [rainfall, setRainfall] = useState(46)
  const [ordersDropPct, setOrdersDropPct] = useState(55)
  const [liveMode, setLiveMode] = useState(false)

  const [heatX, setHeatX] = useState(2)
  const [heatY, setHeatY] = useState(6)

  const [lostHours, setLostHours] = useState(3)
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null)

  const [runStatus, setRunStatus] = useState<'idle' | 'running' | 'none' | ClaimStatus>('idle')
  const [steps, setSteps] = useState<Array<'idle' | 'running' | 'done' | 'fail'>>(['idle', 'idle', 'idle', 'idle', 'idle'])
  const claimFinalizeLockRef = useRef(false)

  const tier = useMemo(() => computeTier(wrs), [wrs])

  const zone = useMemo(() => pickZone(heatX, heatY), [heatX, heatY])

  const fraudScore = useMemo(
    () => computeFraudScore({ wrs, rainfall, rainThreshold, ordersDropPct, userActive }),
    [ordersDropPct, rainfall, rainThreshold, userActive, wrs]
  )

  const coveragePercent = useMemo(() => computeCoveragePercent(tier, fraudScore), [tier, fraudScore])

  const triggerEngine = useMemo(() => {
    const trigger = rainfall > rainThreshold && ordersDropPct >= 40 && userActive
    return trigger
  }, [ordersDropPct, rainfall, rainThreshold, userActive])

  const fraudBlocked = useMemo(() => {
    // UX fairness layer:
    // Trusted: rarely blocked
    // Suspicious: can be delayed
    // Fraud: likely blocked unless signals look good.
    if (tier === 'Fraud') return fraudScore >= 0.35
    if (tier === 'Suspicious') return fraudScore >= 0.62
    return fraudScore >= 0.8
  }, [fraudScore, tier])

  const expectedHourly = useMemo(() => computeExpectedHourly(wrs, platform, ordersDropPct), [platform, wrs, ordersDropPct])
  const expectedHourlyComp = expectedHourly * coveragePercent
  const payout = useMemo(() => (triggerEngine && !fraudBlocked ? expectedHourlyComp * lostHours : 0), [
    coveragePercent,
    expectedHourlyComp,
    fraudBlocked,
    lostHours,
    triggerEngine,
  ])

  const simulationLabel = useMemo(() => buildScenarioLabel({ rainfall, rainThreshold, ordersDropPct, userActive }), [
    ordersDropPct,
    rainfall,
    rainThreshold,
    userActive,
  ])

  useEffect(() => {
    // When inputs change, keep it feeling "live": if not running, reset statuses.
    if (runStatus === 'running') return
    // If a claim outcome is already shown, don't wipe it while live signals drift.
    if (runStatus !== 'idle') return
    setRunStatus('idle')
    setSteps(['idle', 'idle', 'idle', 'idle', 'idle'])
    setSelectedClaimId(null)
  }, [ordersDropPct, rainfall, rainThreshold, runStatus, userActive, wrs])

  useEffect(() => {
    if (!liveMode) return
    if (runStatus === 'running') return

    const interval = window.setInterval(() => {
      // Drift rainfall and demand slightly to simulate real-time disruption signals.
      setRainfall((v) => clamp(Math.round(v + (Math.random() - 0.5) * 3), 0, 80))
      setOrdersDropPct((v) => clamp(Math.round(v + (Math.random() - 0.5) * 6), 0, 70))
      // Nudge heat marker toward areas of higher risk visually.
      setHeatX((hx) => (hx + (Math.random() > 0.6 ? 1 : 0)) % 10)
      setHeatY((hy) => (hy + (Math.random() > 0.6 ? 1 : 0)) % 10)
    }, 950)

    return () => window.clearInterval(interval)
  }, [liveMode, runStatus])

  const runSimulation = async () => {
    claimFinalizeLockRef.current = false
    setRunStatus('running')
    setSelectedClaimId(null)
    setSteps(['idle', 'idle', 'idle', 'idle', 'idle'])

    const next = (idx: number, st: 'idle' | 'running' | 'done' | 'fail') => {
      setSteps((prev) => {
        const clone = [...prev]
        clone[idx] = st
        return clone
      })
    }

    next(0, 'running')
    await new Promise((r) => setTimeout(r, 450))
    next(0, triggerEngine ? 'done' : 'fail')

    next(1, 'running')
    await new Promise((r) => setTimeout(r, 520))
    const tierOk = tier !== 'Fraud'
    next(1, tierOk ? 'done' : 'fail')

    next(2, 'running')
    await new Promise((r) => setTimeout(r, 560))
    const fraudTierState = fraudBlocked ? 'fail' : 'done'
    next(2, fraudTierState)

    next(3, 'running')
    await new Promise((r) => setTimeout(r, 520))
    next(3, triggerEngine ? 'done' : 'fail')

    next(4, 'running')
    await new Promise((r) => setTimeout(r, 520))

    if (!triggerEngine) {
      setRunStatus('none')
      next(4, 'fail')
      return
    }

    if (fraudBlocked) {
      setRunStatus('blocked')
      next(4, 'fail')
    } else {
      // Suspicious tier might show "processing" briefly.
      if (tier === 'Suspicious') {
        next(4, 'done')
        setRunStatus('processing')
        // auto-approve in demo to keep it punchy
        await new Promise((r) => setTimeout(r, 450))
        setRunStatus('paid')
        next(4, 'done')
      } else {
        setRunStatus('paid')
        next(4, 'done')
      }
    }
  }

  const ensureRazorpayLoaded = async (): Promise<boolean> => {
    if ((window as any).Razorpay) return true
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const triggerRazorpayCheckout = async (amountInr: number, claimId: string) => {
    const ok = await ensureRazorpayLoaded()
    if (!ok || !(window as any).Razorpay) {
      window.alert('Could not load Razorpay checkout. Check your network or ad-blockers.')
      return
    }
    const amount = Math.max(1, Math.round(amountInr))
    try {
      const { data } = await axios.post(
        'http://localhost:5000/payment/create-order',
        { amount },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      const key = data.key
      if (!key || !data.id) {
        window.alert('Invalid order response from server.')
        return
      }
      const options = {
        key,
        currency: data.currency || 'INR',
        name: 'EarnKavach Protect',
        description: `Micro-Payout for Claim #${claimId}`,
        order_id: data.id,
        handler: function () {
          /* Demo micro-payout: server verification route can be added when claim_payout uses same flow */
        },
        prefill: {
          name: user?.name,
          email: user?.email || 'worker@earnkavach.com',
          contact: '9999999999',
        },
        theme: {
          color: '#f97316',
        },
      }
      const rzp = new (window as any).Razorpay(options)
      rzp.on('payment.failed', function (response: any) {
        const desc = response?.error?.description || 'Payment failed'
        window.alert(desc)
      })
      rzp.open()
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Could not start payment'
      console.error('Razorpay Error:', e)
      window.alert(msg)
    }
  }

  const finalizeClaimToStorage = async () => {
    if (runStatus !== 'paid' && runStatus !== 'blocked' && runStatus !== 'none') return
    if (claimFinalizeLockRef.current) return
    claimFinalizeLockRef.current = true
    try {
      const response = await axios.post('http://localhost:5000/claim', {
        fraud_data: [1, heatX, heatY, rainfall, ordersDropPct, userActive ? 1 : 0],
        income_data: [expectedHourly, lostHours, userActive ? 1 : 0],
        actual_income: 0,
        coverage: coveragePercent,
        scenario: simulationLabel,
        platform: platform,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const claimDbId = response.data.claim_id?.substring(response.data.claim_id.length - 8).toUpperCase() || createId();
      setSelectedClaimId(claimDbId)

      if (runStatus === 'paid' && payout > 0) {
        void triggerRazorpayCheckout(Math.round(payout), claimDbId)
      }
    } catch (err) {
      claimFinalizeLockRef.current = false
      console.error('Failed to save claim to API:', err)
      setSelectedClaimId(createId())
    }
  }

  // When run ends (runStatus not running), persist record once.
  useEffect(() => {
    if (runStatus === 'paid' || runStatus === 'blocked' || runStatus === 'none') {
      void finalizeClaimToStorage()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runStatus])

  // Chart data: "Predicted vs Recovered"
  const barData = useMemo(() => {
    // Make it look like "EarnKavach compensation" by subtracting from predicted.
    const predicted = expectedHourly * Math.max(1, lostHours)
    const recovered = payout
    const other = Math.max(0, predicted - recovered)
    return [
      { label: 'Predicted', value: predicted, color: '#a855f7' },
      { label: 'Recovered', value: recovered, color: '#34d399' },
      { label: 'Gap', value: other, color: '#f97316' },
    ]
  }, [expectedHourly, lostHours, payout])

  const uiStatus = runStatus === 'idle' ? 'Ready' : runStatus === 'running' ? 'Simulating...' : runStatus === 'none' ? 'No claim' : runStatus

  const applyPreset = (preset: 'trusted' | 'suspicious' | 'fraud') => {
    if (preset === 'trusted') {
      setPlatform('Zomato')
      setUserActive(true)
      setWrs(88)
      setRainThreshold(30)
      setRainfall(52)
      setOrdersDropPct(55)
      setLostHours(3)
      setHeatX(2)
      setHeatY(6)
      return
    }
    if (preset === 'suspicious') {
      setPlatform('Swiggy')
      setUserActive(true)
      setWrs(66)
      setRainThreshold(35)
      setRainfall(44)
      setOrdersDropPct(48)
      setLostHours(2)
      setHeatX(5)
      setHeatY(3)
      return
    }
    // Fraud / Blocked demo
    setPlatform('Zomato')
    setUserActive(true)
    setWrs(38)
    setRainThreshold(28)
    setRainfall(58)
    setOrdersDropPct(60)
    setLostHours(4)
    setHeatX(7)
    setHeatY(1)
  }

  const syncLiveWeather = async () => {
    const fetchWeatherForCoords = async (lat: number, lon: number) => {
      try {
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation`);
        const weatherData = await weatherRes.json();
        const { temperature_2m, precipitation } = weatherData.current;
        
        setRainfall(Math.round(precipitation > 0 ? precipitation * 20 : 0));
        setHeatX(Math.min(10, Math.round(temperature_2m / 5)));
        setOrdersDropPct(precipitation > 0 ? 65 : 25);
      } catch (e) {
        console.error("Weather Sync Error:", e);
      }
    };

    if ('geolocation' in navigator) {
       navigator.geolocation.getCurrentPosition(
         (pos) => {
           fetchWeatherForCoords(pos.coords.latitude, pos.coords.longitude);
         },
         async () => {
           // Fallback to IP-based city coordinate detection if GPS permission is denied
           try {
             const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${locationCity}&count=1&format=json`);
             const geoData = await geoRes.json();
             if (geoData.results?.length) {
               fetchWeatherForCoords(geoData.results[0].latitude, geoData.results[0].longitude);
             }
           } catch (err) {}
         }
       );
    } else {
       // Browser doesn't support geolocation at all, use IP fallback
       try {
         const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${locationCity}&count=1&format=json`);
         const geoData = await geoRes.json();
         if (geoData.results?.length) {
           fetchWeatherForCoords(geoData.results[0].latitude, geoData.results[0].longitude);
         }
       } catch (err) {}
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16 overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/3 w-[520px] h-[520px] rounded-full bg-orange-500/8 blur-[130px] animate-orb" />
        <div className="absolute top-80 right-1/4 w-[420px] h-[420px] rounded-full bg-purple-600/8 blur-[120px] animate-orb2" />
        <div className="absolute inset-0 grid-bg opacity-25" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 mb-8">
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-orange mb-5">
              <Zap className="w-4 h-4 text-orange-400" />
              <span className="text-orange-300 text-xs font-semibold tracking-wide uppercase">Live Claim Simulator</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-[1.05] mb-3">
              Run the <span className="gradient-text">Trigger Engine</span>.
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl">
              Tune weather + orders drop + WRS, then preview how EarnKavach predicts, validates fraud signals, and computes micro-payout.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-6">
              <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2">
                <Shield className="w-4 h-4 text-orange-400" />
                <span className="text-white text-sm font-bold">{uiStatus}</span>
              </div>
              <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2">
                <Gauge className="w-4 h-4 text-purple-400" />
                <span className="text-white text-sm font-bold">{wrs}</span>
                <span className="text-slate-500 text-sm">WRS</span>
              </div>
              <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2">
                <StarPill tier={tier} />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="lg:w-[420px]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
          >
            <div className="glass rounded-3xl p-5 mb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center shadow-lg shadow-orange-500/20">
                    <Bike className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-bold">{user?.name || 'Rahul Sharma'}</div>
                    <div className="text-slate-500 text-xs">{user?.platform || 'Zomato'} Partner · {locationCity || 'India'} · {zone}</div>
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${userActive ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
                  <span className="text-[11px] font-bold text-emerald-300">{userActive ? 'ACTIVE' : 'INACTIVE'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="glass-orange rounded-2xl p-3.5">
                  <div className="text-slate-500 text-[10px] font-semibold mb-1">Rainfall</div>
                  <div className="text-white text-2xl font-black">{rainfall}mm</div>
                  <div className="text-red-400 text-[11px] mt-1">Threshold {rainThreshold}mm</div>
                </div>
                <div className="glass-purple rounded-2xl p-3.5">
                  <div className="text-slate-500 text-[10px] font-semibold mb-1">Orders Drop</div>
                  <div className="text-white text-2xl font-black">{ordersDropPct}%</div>
                    <div className="text-emerald-400 text-[11px] mt-1">{ordersDropPct >= 40 ? 'Demand drop is severe' : 'Demand drop needs to be stronger'}</div>
                </div>
              </div>
            </div>

            <div className="glass rounded-3xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <CalendarClock className="w-4 h-4 text-purple-400" />
                <div className="text-white font-bold text-sm">Claim Outcome</div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-slate-500 text-xs">Tier Coverage</div>
                  <div className="text-white text-2xl font-black">{Math.round(coveragePercent * 100)}%</div>
                  <div className="text-slate-500 text-[11px] mt-1">
                    {tier === 'Trusted' ? 'Instant payout path' : tier === 'Suspicious' ? 'Verification path' : 'Fraud block path'}
                  </div>
                </div>
                <div className="w-[140px]">
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-3.5">
                    <div className="flex items-center gap-2">
                      <TriangleAlert className="w-4 h-4 text-red-400" />
                      <div className="text-xs font-bold text-white">Fraud Score</div>
                    </div>
                    <div className="text-white text-2xl font-black mt-1">{Math.round(fraudScore * 100)}%</div>
                    <div className={`text-[11px] font-semibold mt-1 ${fraudBlocked ? 'text-red-300' : 'text-emerald-300'}`}>
                      {fraudBlocked ? 'Will be flagged' : 'Likely safe'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-slate-500 text-xs">Micro payout</div>
                  <div className="text-slate-400 text-[11px]">Lost hours: {lostHours}h</div>
                </div>
                <div className="flex items-end gap-3">
                  <div className="text-white text-4xl font-black gradient-text-green leading-none">
                    <CountUp value={payout} />
                  </div>
                  <div className="text-slate-500 pb-1 font-bold">INR</div>
                </div>
                <div className="text-slate-500 text-[11px] mt-2 flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  {triggerEngine ? `Expected hourly: ${formatINR(expectedHourlyComp)}` : 'Trigger conditions not satisfied'}
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  className="flex-1 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm py-3 px-4 transition-colors shadow-lg shadow-orange-500/20"
                  onClick={runSimulation}
                  disabled={runStatus === 'running'}
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4" />
                    {runStatus === 'running' ? 'Running...' : 'Simulate Claim'}
                  </span>
                </button>
                <Link to="/claims" className="flex-shrink-0">
                  <button
                    type="button"
                    className="rounded-xl glass px-4 py-3 text-sm font-bold border border-white/10 hover:bg-white/5 transition-colors"
                    onClick={() => {
                      // no-op; user navigation
                    }}
                  >
                    View
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass rounded-3xl p-5">
              <div className="flex items-center justify-between mb-5 gap-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="text-white font-bold text-sm">Control Panel</div>
                    <div className="text-slate-500 text-[11px]">Adjust parameters to force trigger outcomes.</div>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-slate-500 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-orange-400" />
                  Trigger:
                  <span className="font-bold text-white">
                    Rain above threshold, demand drop severe, and worker is active
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => applyPreset('trusted')}
                  className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold hover:bg-emerald-500/15 transition-colors"
                >
                  Trusted Payout
                </button>
                <button
                  type="button"
                  onClick={syncLiveWeather}
                  className="px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-bold hover:bg-blue-500/15 transition-colors flex items-center gap-1.5 ml-auto"
                >
                  <CloudRain className="w-3.5 h-3.5" />
                  Sync Live Weather
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('suspicious')}
                  className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold hover:bg-amber-500/15 transition-colors"
                >
                  Suspicious Verify
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('fraud')}
                  className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-bold hover:bg-red-500/15 transition-colors"
                >
                  Fraud Block
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-slate-300 text-xs font-semibold">Platform Activity</div>
                    <div className="text-slate-500 text-[11px]">{platform}</div>
                  </div>
                  <div className="flex gap-2">
                    {(['Zomato', 'Swiggy'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPlatform(p)}
                        className={`flex-1 rounded-xl px-3 py-2 border transition-colors text-sm font-bold ${
                          platform === p
                            ? 'bg-orange-500 border-orange-400 text-white'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-slate-300 text-xs font-semibold">Worker Active</div>
                    <div className="text-slate-500 text-[11px]">{userActive ? 'TRUE' : 'FALSE'}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-slate-300 text-xs font-semibold">Live Signal Stream</div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${liveMode ? 'bg-emerald-400' : 'bg-white/20'}`} />
                      <span className="text-slate-500 text-[11px] font-bold">{liveMode ? 'ON' : 'OFF'}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setLiveMode(true)}
                      className={`flex-1 rounded-xl px-3 py-2 border transition-colors text-sm font-bold ${
                        liveMode ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      ON
                    </button>
                    <button
                      type="button"
                      onClick={() => setLiveMode(false)}
                      className={`flex-1 rounded-xl px-3 py-2 border transition-colors text-sm font-bold ${
                        !liveMode ? 'bg-white/10 border-white/30 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      OFF
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setUserActive(true)}
                      className={`flex-1 rounded-xl px-3 py-2 border transition-colors text-sm font-bold ${
                        userActive ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      TRUE
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserActive(false)}
                      className={`flex-1 rounded-xl px-3 py-2 border transition-colors text-sm font-bold ${
                        !userActive ? 'bg-amber-500/15 border-amber-400/40 text-amber-300' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      FALSE
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-slate-300 text-xs font-semibold">Worker Reliability Score (WRS)</div>
                    <div className="text-white text-sm font-black">{wrs}/100</div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={wrs}
                    onChange={(e) => setWrs(Number(e.target.value))}
                    className="w-full accent-orange-500"
                  />
                  <div className="text-slate-500 text-[11px]">
                    Tier: <span className="text-white font-bold">{tier}</span> · Coverage {Math.round(coveragePercent * 100)}%
                  </div>
                </div>
              </div>

              <div className="mt-6 grid sm:grid-cols-3 gap-4">
                <SliderCard
                  icon={<CloudRain className="w-4 h-4 text-orange-400" />}
                  title="Rainfall (mm)"
                  value={rainfall}
                  min={0}
                  max={80}
                  step={1}
                  onChange={setRainfall}
                />
                <SliderCard
                  icon={<Timer className="w-4 h-4 text-purple-400" />}
                  title="Rain Threshold (mm)"
                  value={rainThreshold}
                  min={5}
                  max={70}
                  step={1}
                  onChange={setRainThreshold}
                />
                <SliderCard
                  icon={<Wind className="w-4 h-4 text-emerald-400" />}
                  title="Orders Drop (%)"
                  value={ordersDropPct}
                  min={0}
                  max={70}
                  step={1}
                  onChange={setOrdersDropPct}
                />
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <div className="text-slate-300 text-xs font-semibold">Lost Hours (Micro-Payout)</div>
                  <div className="text-slate-500 text-[11px]">{lostHours}h</div>
                </div>
                <input
                  type="range"
                  min={1}
                  max={6}
                  value={lostHours}
                  onChange={(e) => setLostHours(Number(e.target.value))}
                  className="w-full accent-emerald-400"
                />
              </div>
            </div>

            <RiskHeatmap
              rainfall={rainfall}
              ordersDropPct={ordersDropPct}
              x={heatX}
              y={heatY}
              onPick={(nx, ny) => {
                setHeatX(nx)
                setHeatY(ny)
              }}
            />
          </div>

          <div className="space-y-6">
            <div className="glass rounded-3xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-4 h-4 text-emerald-400" />
                <div className="text-white font-bold text-sm">Trigger Engine Timeline</div>
              </div>

              <div className="space-y-4">
                <Step
                  title="Trigger Conditions"
                  subtitle={triggerEngine ? 'Rainfall, orders drop, and active status align.' : 'Conditions mismatch: no claim triggered.'}
                  icon={<Zap className="w-4 h-4" />}
                  state={steps[0] === 'idle' ? 'idle' : steps[0] === 'running' ? 'running' : steps[0] === 'done' ? 'done' : 'fail'}
                />
                <Step
                  title="Reliability Scoring (WRS)"
                  subtitle={`Reliability tier is ${tier}, based on recent activity and delivery signals.`}
                  icon={<Brain className="w-4 h-4" />}
                  state={steps[1]}
                />
                <Step
                  title="Fraud Detection Signals"
                  subtitle={
                    fraudBlocked
                      ? `Fraud shield flagged anomalies (score ${Math.round(fraudScore * 100)}%).`
                      : `Signals clean (score ${Math.round(fraudScore * 100)}%).`
                  }
                  icon={<TriangleAlert className="w-4 h-4" />}
                  state={steps[2]}
                />
                <Step
                  title="Micro-Payout Computation"
                  subtitle={triggerEngine ? `Expected hourly recovered: ${formatINR(expectedHourlyComp)} · Lost hours: ${lostHours}h` : 'Skip payout calculation.'}
                  icon={<DollarSign className="w-4 h-4" />}
                  state={steps[3]}
                />
                <Step
                  title="UX Fairness Layer"
                  subtitle={
                    !triggerEngine
                      ? 'Claim rejected due to trigger mismatch.'
                      : fraudBlocked
                        ? 'Fraud tier blocks instant payout; verification required.'
                        : tier === 'Suspicious'
                          ? 'Suspicious tier: approval after verification.'
                          : 'Trusted tier: instant approval.'
                  }
                  icon={runStatus === 'paid' ? <CheckCircle2 className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                  state={steps[4]}
                />
              </div>

              <div className="mt-5 pt-4 border-t border-white/[0.06]">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-slate-500 text-xs">Scenario snapshot</div>
                  <div className="text-slate-500 text-[11px]">{new Date().toLocaleDateString('en-IN')}</div>
                </div>
                <div className="text-white text-sm font-bold mt-2 line-clamp-2">{simulationLabel}</div>
                <div className="text-slate-500 text-xs mt-1 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-orange-400" />
                  Platform {platform} · Zone {zone}
                </div>
              </div>
            </div>

            <div className="glass rounded-3xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <div className="text-white font-bold text-sm">Prediction Gap (Viz)</div>
                </div>
                <div className="text-slate-500 text-[11px]">Predicted vs Recovered</div>
              </div>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={barData} barSize={28} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${Math.round(v / 100) * 100}`} />
                    <Tooltip
                      contentStyle={{ background: 'rgba(13,13,26,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, backdropFilter: 'blur(20px)' }}
                      labelStyle={{ color: '#94a3b8' }}
                      formatter={(val: any) => [`₹${Math.round(Number(val)).toLocaleString('en-IN')}`, 'value']}
                    />
                    <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#f97316" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-slate-500 text-xs mt-3">
                If fraud tier blocks, recovered amount drops to zero (demo UX).
              </div>
            </div>

            <AnimatePresence>
              {selectedClaimId && runStatus !== 'idle' && (
                <motion.div
                  className="glass-emerald rounded-3xl p-5"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.35 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <div className="text-white font-bold text-sm">Claim Saved</div>
                  </div>
                  <div className="text-slate-400 text-xs">ID: <span className="text-white font-bold">{selectedClaimId}</span></div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="text-slate-500 text-xs">Status</div>
                    <div className={`text-xs font-bold px-2 py-1 rounded-full border ${
                      runStatus === 'paid'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : runStatus === 'blocked'
                          ? 'bg-red-500/10 border-red-500/20 text-red-400'
                          : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                    }`}>
                      {runStatus === 'paid' ? 'Paid' : runStatus === 'blocked' ? 'Blocked' : 'Processing'}
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link to="/claims" className="inline-flex items-center gap-2 text-orange-400 text-sm font-bold hover:text-orange-300 transition-colors">
                      Open Claims <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

function SliderCard({
  icon,
  title,
  value,
  min,
  max,
  step,
  onChange,
}: {
  icon: ReactNode
  title: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
}) {
  return (
    <div className="glass rounded-3xl p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {icon}
          <div className="text-white text-xs font-bold truncate">{title}</div>
        </div>
        <div className="text-white text-sm font-black">{value}</div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full mt-3 accent-orange-400"
      />
      <div className="text-slate-500 text-[10px] mt-1">Range {min}..{max}</div>
    </div>
  )
}

function StarPill({ tier }: { tier: CoverageTier }) {
  const map: Record<CoverageTier, { label: string; cls: string }> = {
    Trusted: { label: 'Trusted tier', cls: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
    Suspicious: { label: 'Suspicious tier', cls: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
    Fraud: { label: 'Fraud tier', cls: 'bg-red-500/10 border-red-500/20 text-red-400' },
  }

  return (
    <div className={`px-3 py-2 rounded-xl border flex items-center gap-2 ${map[tier].cls}`}>
      <Shield className="w-4 h-4" />
      <span className="text-[11px] font-bold">{map[tier].label}</span>
    </div>
  )
}

