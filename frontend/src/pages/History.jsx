/**
 * History Page – Past workout logs in a timeline.
 */
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchHistory, selectHistory, selectHistoryStatus } from '../features/history/historySlice'
import { PROGRAM } from '../data/program'
import { Clock, Dumbbell, TrendingUp } from 'lucide-react'

function getDayName(dayId) {
  return PROGRAM.find((d) => d.id === dayId)?.name || `Day ${dayId}`
}

function getDayEmoji(dayId) {
  return PROGRAM.find((d) => d.id === dayId)?.emoji || '💪'
}

export default function History() {
  const dispatch = useDispatch()
  const logs = useSelector(selectHistory)
  const status = useSelector(selectHistoryStatus)

  useEffect(() => { dispatch(fetchHistory()) }, [dispatch])

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in w-full">
      <div className="border-b border-zinc-900/40 pb-4">
        <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">Workout History</h1>
        <p className="text-xs text-zinc-500 mt-1.5 font-medium">Timeline of past workouts, completed sets, and volume output</p>
      </div>

      {status === 'loading' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-6 backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.7)] animate-pulse h-32">
              <div className="h-4 bg-zinc-800 rounded w-32 mb-3" />
              <div className="h-3 bg-zinc-800 rounded w-48 mb-2" />
              <div className="h-3 bg-zinc-800 rounded w-24" />
            </div>
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-700 max-w-md mx-auto bg-zinc-900/10 border border-zinc-850 rounded-2xl p-6">
          <Clock size={44} strokeWidth={1.5} className="mb-4 text-zinc-800" />
          <p className="text-base font-bold text-zinc-400">No workouts recorded yet</p>
          <p className="text-xs text-zinc-650 mt-1.5 text-center">Your logged workout stats will show up here once finished.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {logs.map((log, idx) => (
            <div
              key={log.id || idx}
              className="bg-zinc-900/40 border border-zinc-850/80 rounded-2xl p-5 md:p-6 backdrop-blur-xl shadow-2xl hover:border-lime-500/30 hover:shadow-[0_0_20px_rgba(132,204,22,0.04)] transition-all duration-300 animate-slide-up-normal flex flex-col justify-between"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 bg-zinc-950/80 border border-zinc-850 rounded-xl leading-none flex items-center justify-center">
                      {getDayEmoji(log.day_id)}
                    </span>
                    <div>
                      <h3 className="text-sm md:text-base font-bold text-white uppercase tracking-wide leading-tight">{getDayName(log.day_id)}</h3>
                      <p className="text-[10px] text-zinc-500 font-mono mt-1">
                        {new Date(log.created_at).toLocaleDateString('en', {
                          weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-500 bg-zinc-950/50 border border-zinc-850/50 px-2.5 py-1.5 rounded-lg font-mono">
                    <span className="flex items-center gap-1">
                      <Dumbbell size={10} className="text-lime-400" /> {log.total_sets || '—'} sets
                    </span>
                    <span className="text-zinc-800">|</span>
                    <span className="flex items-center gap-1">
                      <TrendingUp size={10} className="text-lime-400" /> {log.total_volume ? `${log.total_volume}kg` : '—'} vol
                    </span>
                  </div>
                </div>

                {/* Exercise summary tags */}
                {log.exercises && (
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-zinc-900/60">
                    {log.exercises.map((ex, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-lime-500/10 text-lime-400 font-semibold border border-lime-500/10">
                        {ex.name}: <span className="font-mono">{ex.sets_count}×</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
