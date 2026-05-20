/**
 * Tools Page – 1RM Calculator + Muscle Volume Tracker + Bodyweight Progression Tracker.
 * Styled with sleek premium dark accents and responsive layout containers.
 */
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchVolumeStats, selectVolume } from '../features/history/historySlice'
import { addBodyweightLog, deleteBodyweightLog, selectBodyweightLogs } from '../features/bodyweight/bodyweightSlice'
import { Calculator, PieChart, Dumbbell, Scale, Plus, Trash2, Calendar, LineChart, Camera } from 'lucide-react'
import clsx from 'clsx'

// ─── 1RM Calculator (Brzycki formula) ────────────────────────────────
function OneRepMaxCalc() {
  const [weight, setWeight] = useState('')
  const [reps, setReps]     = useState('')
  const w = parseFloat(weight)
  const r = parseInt(reps, 10)
  const oneRM = w > 0 && r > 0 && r <= 30 ? Math.round(w * (36 / (37 - r))) : null

  const percentages = oneRM ? [
    { pct: 100, label: '1RM',  kg: oneRM },
    { pct: 95,  label: '~2r',  kg: Math.round(oneRM * 0.95) },
    { pct: 90,  label: '~4r',  kg: Math.round(oneRM * 0.90) },
    { pct: 85,  label: '~6r',  kg: Math.round(oneRM * 0.85) },
    { pct: 80,  label: '~8r',  kg: Math.round(oneRM * 0.80) },
    { pct: 75,  label: '~10r', kg: Math.round(oneRM * 0.75) },
    { pct: 70,  label: '~12r', kg: Math.round(oneRM * 0.70) },
  ] : []

  return (
    <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-5 md:p-6 shadow-2xl transition-all duration-300 hover:border-lime-500/30">
      <div className="flex items-center gap-2 mb-4">
        <Calculator size={18} className="text-lime-400" />
        <h2 className="text-base font-bold text-white uppercase tracking-wider">1RM Calculator</h2>
      </div>
      <p className="text-xs text-zinc-500 mb-6">Estimate your absolute theoretical one-rep maximum strength capacity using the Brzycki index.</p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1.5 block">Weight (kg)</label>
          <input
            type="number" inputMode="decimal" placeholder="80"
            value={weight} onChange={(e) => setWeight(e.target.value)}
            onFocus={(e) => e.target.select()}
            className="w-full bg-zinc-950 border border-zinc-850 text-zinc-200 placeholder-zinc-800 rounded-xl px-4 py-3 text-center text-base font-mono focus:outline-none focus:border-lime-400 focus:ring-0 focus:ring-transparent transition-all"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1.5 block">Reps</label>
          <input
            type="number" inputMode="numeric" placeholder="8"
            value={reps} onChange={(e) => setReps(e.target.value)}
            onFocus={(e) => e.target.select()}
            className="w-full bg-zinc-950 border border-zinc-850 text-zinc-200 placeholder-zinc-800 rounded-xl px-4 py-3 text-center text-base font-mono focus:outline-none focus:border-lime-400 focus:ring-0 focus:ring-transparent transition-all"
          />
        </div>
      </div>

      {oneRM && (
        <div className="animate-fade-in space-y-4">
          <div className="text-center py-5 rounded-xl bg-lime-500/10 border border-lime-500/35 shadow-[0_0_25px_rgba(163,255,18,0.08)]">
            <p className="text-[10px] font-bold text-lime-400 uppercase tracking-widest font-mono">Estimated 1RM</p>
            <p className="text-4xl font-black text-lime-400 font-mono mt-1.5">{oneRM}<span className="text-lg text-lime-400/60 ml-1 font-sans">kg</span></p>
          </div>
          <div className="space-y-1 bg-zinc-950/20 rounded-xl p-3 border border-zinc-900/40">
            {percentages.map(({ pct, label, kg }) => (
              <div key={pct} className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-zinc-950/40 border border-zinc-900/35">
                <span className="text-zinc-500 w-8 font-mono font-bold">{pct}%</span>
                <div className="flex-1 mx-4 h-1 bg-zinc-950 rounded-full overflow-hidden">
                  <div className="h-full bg-lime-500/60 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="font-mono font-bold text-zinc-300 w-12 text-right">{kg}kg</span>
                <span className="text-zinc-600 w-8 text-right font-bold uppercase text-[9px]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Volume Pie Chart (SVG) ──────────────────────────────────────────
const MUSCLE_COLORS = {
  Chest: '#a3e635',     // lime-400
  Back: '#10b981',      // emerald-500
  Shoulders: '#06b6d4',  // cyan-500
  Triceps: '#d946ef',    // fuchsia-500
  Biceps: '#ec4899',     // pink-500
  Quads: '#84cc16',      // lime-500
  Hamstrings: '#059669', // emerald-600
  Glutes: '#0891b2',     // cyan-600
  Calves: '#c084fc',     // purple-400
  Abs: '#f43f5e',        // rose-500
}

function VolumePieChart() {
  const dispatch = useDispatch()
  const volumeData = useSelector(selectVolume)

  useEffect(() => { dispatch(fetchVolumeStats()) }, [dispatch])

  const entries = Object.entries(volumeData).filter(([, v]) => v > 0)
  const total = entries.reduce((s, [, v]) => s + v, 0)

  if (entries.length === 0) {
    return (
      <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 shadow-2xl transition-all duration-300 hover:border-lime-500/30">
        <div className="flex items-center gap-2 mb-4">
          <PieChart size={18} className="text-lime-400" />
          <h2 className="text-base font-bold text-white uppercase tracking-wider">Weekly Volume</h2>
        </div>
        <div className="flex flex-col items-center py-16 text-zinc-700">
          <Dumbbell size={40} strokeWidth={1.5} className="mb-4 text-zinc-800" />
          <p className="text-sm font-bold text-zinc-400">No data yet this week</p>
          <p className="text-xs text-zinc-650 mt-1.5 text-center max-w-[200px]">Complete workouts and log your sets to populate weekly volume distribution.</p>
        </div>
      </div>
    )
  }

  let cumAngle = 0
  const arcs = entries.map(([muscle, sets]) => {
    const pct = sets / total
    const startAngle = cumAngle
    cumAngle += pct * 360
    const endAngle = cumAngle
    const largeArc = pct > 0.5 ? 1 : 0
    const r = 80, cx = 100, cy = 100
    const s = { x: cx + r * Math.cos((Math.PI / 180) * (startAngle - 90)), y: cy + r * Math.sin((Math.PI / 180) * (startAngle - 90)) }
    const e = { x: cx + r * Math.cos((Math.PI / 180) * (endAngle - 90)),   y: cy + r * Math.sin((Math.PI / 180) * (endAngle - 90)) }
    const path = `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y} Z`
    return { muscle, sets, pct, path, color: MUSCLE_COLORS[muscle] || '#64748b' }
  })

  return (
    <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-5 md:p-6 shadow-2xl transition-all duration-300 hover:border-lime-500/30">
      <div className="flex items-center gap-2 mb-6">
        <PieChart size={18} className="text-lime-400" />
        <h2 className="text-base font-bold text-white uppercase tracking-wider">Weekly Volume</h2>
        <span className="ml-auto bg-lime-500/10 text-lime-400 border border-lime-500/20 px-2.5 py-0.5 rounded font-mono text-[10px] font-bold tracking-wider">{total} total sets</span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-8">
        <div className="relative w-36 h-36 flex-shrink-0">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {arcs.map((a) => (
              <path key={a.muscle} d={a.path} fill={a.color} stroke="#000000" strokeWidth="2.5" opacity="0.9" className="transition-all duration-300 hover:opacity-100" />
            ))}
            <circle cx="100" cy="100" r="45" fill="#000000" />
            <text x="100" y="96" textAnchor="middle" className="text-[10px] font-bold fill-zinc-550 uppercase tracking-widest">Sets</text>
            <text x="100" y="116" textAnchor="middle" className="text-2xl font-black fill-white font-mono leading-none">{total}</text>
          </svg>
        </div>

        <div className="flex-1 space-y-1.5 w-full">
          {arcs.map((a) => (
            <div key={a.muscle} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-950/40 border border-zinc-900/40">
              <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: a.color }} />
              <span className="text-[11px] font-bold text-zinc-400 flex-1 truncate">{a.muscle}</span>
              <span className="text-[11px] font-mono font-bold text-zinc-350">{a.sets} sets</span>
              <span className="text-[10px] text-zinc-600 w-8 text-right font-semibold">{Math.round(a.pct * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Bodyweight Tracker ──────────────────────────────────────────────
function BodyweightTracker() {
  const dispatch = useDispatch()
  const logs = useSelector(selectBodyweightLogs)
  const [weight, setWeight] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [confirmDelId, setConfirmDelId] = useState(null)

  const handleAdd = (e) => {
    e.preventDefault()
    if (!weight) return
    dispatch(addBodyweightLog({ weight, photoUrl }))
    setWeight('')
    setPhotoUrl('')
  }

  // Calculate Averages
  const now = Date.now()
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000
  const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000

  const last7Days = logs.filter((l) => new Date(l.date).getTime() >= oneWeekAgo)
  const last30Days = logs.filter((l) => new Date(l.date).getTime() >= oneMonthAgo)

  const avg7 = last7Days.length > 0 ? (last7Days.reduce((sum, l) => sum + l.weight, 0) / last7Days.length).toFixed(1) : '—'
  const avg30 = last30Days.length > 0 ? (last30Days.reduce((sum, l) => sum + l.weight, 0) / last30Days.length).toFixed(1) : '—'

  // SVG Chart
  const renderChart = () => {
    if (logs.length < 2) {
      return (
        <div className="flex flex-col items-center justify-center h-28 text-[10px] text-zinc-650 font-bold border border-dashed border-zinc-800 rounded-xl bg-zinc-950/20">
          LOG BODYWEIGHT AT LEAST TWICE TO INITIATE GRAPH
        </div>
      )
    }

    const sortedLogs = [...logs].reverse()
    const weights = sortedLogs.map((l) => l.weight)
    const minW = Math.min(...weights) * 0.98
    const maxW = Math.max(...weights) * 1.02
    const range = maxW - minW || 1

    const width = 450
    const height = 120
    const padding = 15

    const points = sortedLogs
      .map((l, i) => {
        const x = padding + (i / (sortedLogs.length - 1)) * (width - padding * 2)
        const y = height - padding - ((l.weight - minW) / range) * (height - padding * 2)
        return `${x},${y}`
      })
      .join(' ')

    return (
      <div className="bg-zinc-950/60 border border-zinc-900 p-3 rounded-xl">
        <svg className="w-full h-28 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <linearGradient id="bodyweight-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#A3FF12" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#A3FF12" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <polygon
            points={`${padding},${height - padding} ${points} ${width - padding},${height - padding}`}
            fill="url(#bodyweight-grad)"
          />
          <polyline
            fill="none"
            stroke="#A3FF12"
            strokeWidth="2.5"
            points={points}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-[0_0_6px_rgba(163,255,18,0.35)]"
          />
          {sortedLogs.map((l, i) => {
            const x = padding + (i / (sortedLogs.length - 1)) * (width - padding * 2)
            const y = height - padding - ((l.weight - minW) / range) * (height - padding * 2)
            return (
              <g key={l.id} className="group/bw-node">
                <circle cx={x} cy={y} r="3.5" className="fill-black stroke-lime-400 stroke-2 cursor-pointer hover:r-5 transition-all" />
                <text x={x} y={y - 8} textAnchor="middle" className="hidden group-hover/bw-node:block text-[8px] font-mono font-black fill-white">{l.weight}kg</text>
              </g>
            )
          })}
        </svg>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Log Form */}
      <form onSubmit={handleAdd} className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 shadow-2xl flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="text-[10px] font-bold text-zinc-550 uppercase mb-1.5 block">Log Weight (kg)</label>
          <div className="relative">
            <Scale className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-650" size={15} />
            <input
              type="number" inputMode="decimal" step="0.1" placeholder="78.5"
              value={weight} onChange={(e) => setWeight(e.target.value)} required
              onFocus={(e) => e.target.select()}
              className="w-full bg-zinc-950 border border-zinc-850 text-zinc-200 placeholder-zinc-800 rounded-xl pl-10 pr-4 py-2.5 font-mono focus:outline-none focus:border-lime-400 focus:ring-0 focus:ring-transparent text-sm transition-all"
            />
          </div>
        </div>
        <div className="flex-1 w-full">
          <label className="text-[10px] font-bold text-zinc-550 uppercase mb-1.5 block">Photo URL (Optional)</label>
          <div className="relative">
            <Camera className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-650" size={15} />
            <input
              type="url" placeholder="https://..."
              value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-850 text-zinc-200 placeholder-zinc-800 rounded-xl pl-10 pr-4 py-2.5 font-medium text-xs focus:outline-none focus:border-lime-400 focus:ring-0 focus:ring-transparent transition-all"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full sm:w-auto bg-lime-400 hover:bg-lime-300 text-black font-black uppercase tracking-widest text-[10px] px-5 py-3 rounded-xl shadow-[0_0_15px_rgba(163,230,53,0.15)] transition-all flex items-center justify-center gap-1.5 flex-shrink-0 active:scale-95"
        >
          <Plus size={13} strokeWidth={3} /> Log
        </button>
      </form>

      {/* Averages display */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-900/20 border border-zinc-850/60 p-3.5 rounded-xl text-center">
          <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider">7-Day Moving Avg</p>
          <p className="text-xl font-black text-white font-mono mt-1">{avg7 !== '—' ? `${avg7}kg` : avg7}</p>
        </div>
        <div className="bg-zinc-900/20 border border-zinc-850/60 p-3.5 rounded-xl text-center">
          <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider">30-Day Moving Avg</p>
          <p className="text-xl font-black text-white font-mono mt-1">{avg30 !== '—' ? `${avg30}kg` : avg30}</p>
        </div>
      </div>

      {/* Line Graph */}
      <div className="space-y-1.5">
        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
          <LineChart size={13} className="text-lime-400" /> Progression Curve
        </p>
        {renderChart()}
      </div>

      {/* Logs Table */}
      <div className="space-y-2">
        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">History timeline</p>
        <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
          {logs.map((log) => {
            const isConfirming = confirmDelId === log.id
            return (
              <div key={log.id} className="bg-zinc-900/20 border border-zinc-900/60 p-3 rounded-xl flex items-center justify-between hover:border-zinc-850 transition-colors">
                <div className="flex items-center gap-3.5">
                  {log.photoUrl && (
                    <img
                      src={log.photoUrl}
                      alt="Progress weight log entry snapshot"
                      className="w-8 h-8 rounded object-cover border border-zinc-800"
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  )}
                  <div>
                    <p className="text-xs font-black text-white font-mono">{log.weight}kg</p>
                    <p className="text-[8px] text-zinc-550 font-bold uppercase mt-0.5 flex items-center gap-1">
                      <Calendar size={9} />
                      {new Date(log.date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (isConfirming) {
                      dispatch(deleteBodyweightLog(log.id))
                      setConfirmDelId(null)
                    } else {
                      setConfirmDelId(log.id)
                      setTimeout(() => setConfirmDelId((prev) => prev === log.id ? null : prev), 3000)
                    }
                  }}
                  className={clsx(
                    "p-1.5 rounded-lg border transition-all duration-205",
                    isConfirming
                      ? "bg-red-500 border-red-500 text-white animate-pulse"
                      : "bg-zinc-950 border-zinc-900 text-zinc-550 hover:text-red-400 hover:border-red-500/20"
                  )}
                  title={isConfirming ? "Confirm Delete" : "Delete Log"}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )
          })}
          {logs.length === 0 && (
            <p className="text-[10px] text-zinc-650 font-bold text-center py-6 border border-dashed border-zinc-900 rounded-xl">No logs found. Enter bodyweight above to track progression.</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Tools Layout ───────────────────────────────────────────────
export default function Tools() {
  const [activeTab, setActiveTab] = useState('calculator') // 'calculator' | 'volume' | 'bodyweight'

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in w-full max-w-[800px] mx-auto">
      <div className="border-b border-zinc-900/40 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">Pro Tools</h1>
          <p className="text-xs text-zinc-500 mt-1.5 font-medium">Strength index formulas, weekly muscle loads, and physical metrics logs</p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-zinc-950 border border-zinc-900 rounded-xl p-1 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('calculator')}
            className={clsx(
              "px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all active:scale-95",
              activeTab === 'calculator' ? "bg-lime-400 text-black shadow-[0_0_10px_rgba(163,255,18,0.25)]" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            1RM
          </button>
          <button
            onClick={() => setActiveTab('volume')}
            className={clsx(
              "px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all active:scale-95",
              activeTab === 'volume' ? "bg-lime-400 text-black shadow-[0_0_10px_rgba(163,255,18,0.25)]" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            Volume
          </button>
          <button
            onClick={() => setActiveTab('bodyweight')}
            className={clsx(
              "px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all active:scale-95",
              activeTab === 'bodyweight' ? "bg-lime-400 text-black shadow-[0_0_10px_rgba(163,255,18,0.25)]" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            Weight
          </button>
        </div>
      </div>

      <div className="w-full">
        {activeTab === 'calculator' && <OneRepMaxCalc />}
        {activeTab === 'volume' && <VolumePieChart />}
        {activeTab === 'bodyweight' && <BodyweightTracker />}
      </div>
    </div>
  )
}
