/**
 * Home Page – Shows the 5-day workout program cards.
 */
import { useNavigate } from 'react-router-dom'
import { PROGRAM } from '../data/program'
import { Dumbbell, ChevronRight, Zap, Calendar } from 'lucide-react'
import clsx from 'clsx'

const DAY_COLORS = [
  'from-rose-500/20 to-rose-900/10 border-rose-500/25',
  'from-blue-500/20 to-blue-900/10 border-blue-500/25',
  'from-amber-500/20 to-amber-900/10 border-amber-500/25',
  'from-violet-500/20 to-violet-900/10 border-violet-500/25',
  'from-emerald-500/20 to-emerald-900/10 border-emerald-500/25',
]

export default function Home() {
  const navigate = useNavigate()
  const today = new Date().toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })

  return (
    <div className="px-4 pt-6 pb-4 max-w-md mx-auto space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Zap size={14} className="text-lime-neon" />
          <span className="text-[10px] font-bold text-lime-neon uppercase tracking-widest">YOUNES GYM</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Your Program</h1>
        <div className="flex items-center gap-1.5 mt-1">
          <Calendar size={12} className="text-slate-500" />
          <p className="text-xs text-slate-500">{today}</p>
        </div>
      </div>

      {/* Motivational banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700/50 p-5">
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-lime-neon/8 blur-2xl" />
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-neon flex items-center justify-center shadow-neon-sm flex-shrink-0">
            <Dumbbell size={20} className="text-slate-900" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-sm font-bold text-white">5-Day Split Program</p>
            <p className="text-xs text-slate-400 mt-0.5">Push · Pull · Legs · Upper · Lower</p>
          </div>
        </div>
      </div>

      {/* Day cards */}
      <div className="space-y-3">
        {PROGRAM.map((day, idx) => (
          <button
            key={day.id}
            onClick={() => navigate(`/workout/${day.id}`)}
            className={clsx(
              'w-full text-left p-4 rounded-2xl border bg-gradient-to-r transition-all duration-200',
              'active:scale-[0.98] hover:shadow-card group',
              DAY_COLORS[idx]
            )}
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-2xl">{day.emoji}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Day {day.id}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5">{day.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">{day.subtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-800/80 px-2 py-1 rounded-lg">
                  {day.exercises.length} exercises
                </span>
                <ChevronRight size={18} className="text-slate-600 group-hover:text-lime-neon transition-colors" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
