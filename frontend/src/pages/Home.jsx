import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { startWorkout } from '../features/workout/workoutSlice'
import { PROGRAM } from '../data/program'
import { Dumbbell, ChevronRight, Zap, Calendar, Sparkles } from 'lucide-react'
import clsx from 'clsx'

const DAY_COLORS = [
  'from-rose-950/20 to-zinc-900/10 border-zinc-800/80 hover:border-rose-500/40',
  'from-lime-950/20 to-zinc-900/10 border-zinc-800/80 hover:border-lime-500/40',
  'from-amber-950/20 to-zinc-900/10 border-zinc-800/80 hover:border-amber-500/40',
  'from-violet-950/20 to-zinc-900/10 border-zinc-800/80 hover:border-violet-500/40',
  'from-emerald-950/20 to-zinc-900/10 border-zinc-800/80 hover:border-emerald-500/40',
]

export default function Home() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [confirmStartDay, setConfirmStartDay] = useState(null)
  const today = new Date().toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in relative z-10 w-full">
      {/* Greeting Header with User Avatar */}
      <div className="flex items-center justify-between border-b border-zinc-900/40 pb-4">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Zap size={12} className="text-lime-400 animate-pulse" />
            <span className="text-[9px] font-black text-lime-400 uppercase tracking-widest">Nova AI Sync Connected</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight leading-none">Younes Sadir</h1>
          <div className="flex items-center gap-1.5 mt-2">
            <Calendar size={11} className="text-zinc-500" />
            <span className="text-[10px] text-zinc-500 font-mono">{today}</span>
          </div>
        </div>
        <div className="relative">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-lime-400/40 p-0.5 shadow-[0_0_15px_rgba(163,255,18,0.15)] bg-zinc-950 flex items-center justify-center overflow-hidden">
            <span className="text-xs md:text-sm font-black text-lime-400 font-mono">YS</span>
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-lime-400 border-2 border-black" />
        </div>
      </div>

      {/* Top dashboard section: Metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Recovery Ring Card */}
        <div className="relative overflow-hidden bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-5 shadow-2xl transition-all duration-300 hover:border-lime-500/20">
          <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-lime-500/5 blur-xl pointer-events-none" />
          <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-3">Recovery Index</p>
          <div className="flex items-center gap-4">
            {/* Circular SVG Ring */}
            <div className="relative w-12 h-12 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-zinc-950"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-lime-400"
                  strokeWidth="3.5"
                  strokeDasharray="94, 100"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-black text-white">94%</span>
            </div>
            <div>
              <p className="text-xs font-bold text-lime-400">Peak Capacity</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">Optimal muscle state</p>
            </div>
          </div>
        </div>

        {/* Streak & Watch Sync card */}
        <div className="grid grid-cols-2 gap-3">
          {/* Streak Card */}
          <div className="relative overflow-hidden bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-4 shadow-2xl flex flex-col justify-between hover:border-zinc-700/50 transition-colors">
            <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider">Workout Streak</p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm font-black text-white font-mono leading-none">12 Days</p>
              <span className="text-lg filter drop-shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-bounce">🔥</span>
            </div>
          </div>

          {/* Watch Sync Card */}
          <div className="relative overflow-hidden bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-4 shadow-2xl flex flex-col justify-between hover:border-zinc-700/50 transition-colors">
            <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider">Apple Watch</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-1 leading-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Connected
              </span>
              <span className="text-xs leading-none">⌚</span>
            </div>
          </div>
        </div>

        {/* AI Coach Nova insight card */}
        <div className="relative overflow-hidden bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-5 shadow-2xl hover:border-lime-500/20 transition-all duration-300">
          <div className="absolute -left-6 -top-6 w-16 h-16 rounded-full bg-lime-500/5 blur-xl pointer-events-none" />
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-lime-500/10 border border-lime-500/20 flex items-center justify-center text-lime-400 flex-shrink-0 shadow-[0_0_10px_rgba(163,255,18,0.15)]">
              <Sparkles size={14} className="animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-mono font-bold text-lime-400 uppercase tracking-wider">Coach Nova recommendation</p>
                <span className="text-[8px] bg-lime-500/20 text-lime-400 border border-lime-500/30 px-1 py-0.2 rounded font-mono font-bold">LIVE</span>
              </div>
              <p className="text-xs text-zinc-300 mt-2 leading-relaxed font-medium">
                "Your chest recovery is at <span className="text-lime-450 font-bold">98%</span>. Today's Push session is optimal for progression. Target <span className="text-white font-bold">100kg for 6 reps</span>."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Program Section */}
      <div className="space-y-4 pt-2">
        {/* Program Header */}
        <div className="relative overflow-hidden bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-5 shadow-2xl transition-all duration-300 hover:border-lime-500/30 hover:shadow-[0_0_20px_rgba(132,204,22,0.05)]">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-lime-500/10 blur-2xl pointer-events-none" />
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-lime-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-lime-500/25 flex-shrink-0">
              <Dumbbell size={20} className="text-black" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-bold text-white uppercase tracking-wide">5-Day Split Program</p>
              <p className="text-xs text-zinc-400 mt-0.5 font-medium flex gap-2">
                <span>Push 1</span>
                <span>•</span>
                <span>Pull</span>
                <span>•</span>
                <span>Legs</span>
                <span>•</span>
                <span>Push 2</span>
                <span>•</span>
                <span>Pull 2</span>
              </p>
            </div>
          </div>
        </div>

        {/* Day cards responsive grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {PROGRAM.map((day, idx) => (
            <button
              key={day.id}
              onClick={() => setConfirmStartDay(day)}
              className={clsx(
                'w-full text-left p-6 rounded-2xl border bg-gradient-to-r backdrop-blur-xl shadow-2xl transition-all duration-300 hover:shadow-[0_0_25px_rgba(163,255,18,0.08)] hover:-translate-y-1',
                'active:scale-[0.98] group flex flex-col justify-between h-48',
                DAY_COLORS[idx]
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wide">Day {day.id}</span>
                  <span className="bg-lime-500/10 text-lime-400 border border-lime-500/20 px-2 py-0.5 rounded font-mono text-[9px] font-bold tracking-wider">
                    {day.exercises.length} EXERCISES
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{day.emoji}</span>
                  <h3 className="text-lg font-black text-white group-hover:text-lime-400 transition-colors uppercase tracking-tight">{day.name}</h3>
                </div>
              </div>
              <div className="w-full pt-4 border-t border-zinc-900 flex items-center justify-between">
                <span className="text-[11px] text-zinc-450 truncate font-semibold pr-2">{day.subtitle}</span>
                <div className="w-7 h-7 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-lime-400 group-hover:border-lime-500/20 transition-all flex-shrink-0">
                  <ChevronRight size={14} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Start Session Modal Overlay */}
      {confirmStartDay && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-zinc-950 border border-zinc-850 p-6 rounded-2xl shadow-2xl relative animate-slide-up-normal">
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">
              Start Workout: {confirmStartDay.name}
            </h3>
            <p className="text-[11px] text-zinc-400 mb-6 leading-relaxed font-semibold">
              Would you like to preload your previous weight, reps, and set configurations from last week's session?
            </p>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => {
                  dispatch(startWorkout({ dayId: confirmStartDay.id, preloadStats: true }))
                  navigate(`/workout/${confirmStartDay.id}`)
                  setConfirmStartDay(null)
                }}
                className="w-full bg-lime-400 hover:bg-lime-300 text-black font-black uppercase tracking-widest text-xs py-3.5 rounded-xl shadow-[0_0_20px_rgba(163,230,53,0.3)] transition-all duration-200"
              >
                Load Previous Stats
              </button>
              <button
                onClick={() => {
                  dispatch(startWorkout({ dayId: confirmStartDay.id, preloadStats: false }))
                  navigate(`/workout/${confirmStartDay.id}`)
                  setConfirmStartDay(null)
                }}
                className="w-full bg-zinc-900 hover:bg-zinc-850 border border-zinc-800/80 text-zinc-300 font-bold uppercase tracking-wider text-xs py-3.5 rounded-xl transition-all duration-200"
              >
                Start Fresh (Empty Template)
              </button>
              <button
                onClick={() => setConfirmStartDay(null)}
                className="w-full text-center text-[10px] text-zinc-500 hover:text-zinc-400 font-semibold uppercase tracking-wider mt-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
