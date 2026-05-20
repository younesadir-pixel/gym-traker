/**
 * ExerciseCard – Premium, highly interactive logging card.
 * Handles:
 * - Enter-key navigation for fast keypad entry.
 * - Warm-up sets (WU) vs Working sets (W).
 * - Real-time PR flashing highlights.
 * - Quick muscle group alternative replacements.
 * - Slide-over interactive history graph & statistics drawer.
 * - Collapsible exercise cues/notes.
 */
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  updateSet,
  markSetDone,
  unlockSet,
  deleteSet,
  addSet,
  toggleSetType,
  replaceExercise,
  updateExerciseNote,
  selectSets,
  selectLastWeek,
  selectBestEver,
  selectExerciseNotes
} from '../../features/workout/workoutSlice'
import { startTimer } from '../../features/timer/timerSlice'
import {
  Check,
  Plus,
  TrendingUp,
  Edit2,
  Trash2,
  AlertOctagon,
  Minus,
  Shuffle,
  FileText,
  BarChart2,
  X,
  Sparkles
} from 'lucide-react'
import clsx from 'clsx'

const ALTERNATIVES = {
  'Chest': [
    { id: 101, name: 'Flat Barbell Bench Press', muscle: 'Chest', type: 'compound' },
    { id: 102, name: 'Incline Dumbbell Press', muscle: 'Chest', type: 'compound' },
    { id: 401, name: 'Incline Barbell Press', muscle: 'Chest', type: 'compound' },
    { id: 402, name: 'Dumbbell Flat Press', muscle: 'Chest', type: 'compound' },
    { id: 405, name: 'Pec Deck Flyes', muscle: 'Chest', type: 'isolation' },
  ],
  'Back': [
    { id: 201, name: 'Barbell Bent-Over Row', muscle: 'Back', type: 'compound' },
    { id: 202, name: 'Lat Pulldown (Wide Grip)', muscle: 'Back', type: 'compound' },
    { id: 203, name: 'Seated Cable Row', muscle: 'Back', type: 'compound' },
    { id: 501, name: 'Lat Pulldown (Neutral Grip)', muscle: 'Back', type: 'compound' },
    { id: 502, name: 'Single-Arm Dumbbell Row', muscle: 'Back', type: 'compound' },
  ],
  'Shoulders': [
    { id: 103, name: 'Seated Overhead Press', muscle: 'Shoulders', type: 'compound' },
    { id: 104, name: 'Dumbbell Lateral Raises', muscle: 'Shoulders', type: 'isolation' },
    { id: 204, name: 'Face Pulls', muscle: 'Shoulders', type: 'isolation' },
    { id: 403, name: 'Arnold Press', muscle: 'Shoulders', type: 'compound' },
    { id: 404, name: 'Cable Lateral Raise', muscle: 'Shoulders', type: 'isolation' },
    { id: 503, name: 'Rear Delt Fly (Machine)', muscle: 'Shoulders', type: 'isolation' },
  ],
  'Triceps': [
    { id: 105, name: 'Tricep Rope Pushdown', muscle: 'Triceps', type: 'isolation' },
    { id: 406, name: 'Overhead Tricep Extension', muscle: 'Triceps', type: 'isolation' },
  ],
  'Biceps': [
    { id: 205, name: 'Barbell Bicep Curl', muscle: 'Biceps', type: 'isolation' },
    { id: 206, name: 'Incline Hammer Curls', muscle: 'Biceps', type: 'isolation' },
    { id: 504, name: 'Incline Dumbbell Curl', muscle: 'Biceps', type: 'isolation' },
    { id: 505, name: 'Cable Bicep Curl', muscle: 'Biceps', type: 'isolation' },
  ],
  'Quads': [
    { id: 301, name: 'Leg Press', muscle: 'Quads', type: 'compound' },
    { id: 303, name: 'Leg Extension', muscle: 'Quads', type: 'isolation' },
  ],
  'Hamstrings': [
    { id: 302, name: 'Lying Leg Curl', muscle: 'Hamstrings', type: 'isolation' },
    { id: 304, name: 'Romanian Deadlift (Light)', muscle: 'Hamstrings', type: 'compound' },
  ],
  'Calves': [
    { id: 106, name: 'Standing Calf Raise', muscle: 'Calves', type: 'isolation' },
    { id: 305, name: 'Seated Calf Raise', muscle: 'Calves', type: 'isolation' },
    { id: 506, name: 'Calf Press on Leg Press', muscle: 'Calves', type: 'isolation' },
  ],
  'Glutes': [
    { id: 304, name: 'Romanian Deadlift (Light)', muscle: 'Hamstrings', type: 'compound' },
  ],
}

export default function ExerciseCard({ exercise, isFocusMode = false }) {
  const dispatch = useDispatch()
  const allSets = useSelector(selectSets)
  const lastWeek = useSelector(selectLastWeek)
  const bestEver = useSelector(selectBestEver)
  const allNotes = useSelector(selectExerciseNotes)

  const sets = allSets[exercise.id] || []
  const previousData = lastWeek[exercise.id]
  const recordData = bestEver[exercise.id]
  const notesText = allNotes[exercise.id] || ''

  // UI state overlays
  const [confirmDeleteIdx, setConfirmDeleteIdx] = useState(null)
  const [showReplacements, setShowReplacements] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showNotesField, setShowNotesField] = useState(false)

  // Auto rest timer mapping: compound (2 mins / 120s) vs isolation (90s)
  const handleDone = (idx) => {
    dispatch(markSetDone({ exerciseId: exercise.id, setIndex: idx }))
    const duration = exercise.type === 'compound' ? 120 : 90
    dispatch(startTimer(duration))

    // Fast shift to next set row
    setTimeout(() => {
      const nextWeightInput = document.getElementById(`weight-${exercise.id}-${idx + 1}`)
      if (nextWeightInput) nextWeightInput.focus()
    }, 50)
  }

  const handleDelete = (idx) => {
    if (sets.length <= 1) return
    if (confirmDeleteIdx === idx) {
      dispatch(deleteSet({ exerciseId: exercise.id, setIndex: idx }))
      setConfirmDeleteIdx(null)
    } else {
      setConfirmDeleteIdx(idx)
      setTimeout(() => setConfirmDeleteIdx((prev) => (prev === idx ? null : prev)), 3000)
    }
  }

  const handleChange = (idx, field, value) => {
    dispatch(updateSet({ exerciseId: exercise.id, setIndex: idx, field, value }))
  }

  // Keypad shifting triggers
  const handleKeyDown = (e, idx, field) => {
    if (e.key === 'Enter') {
      if (field === 'weight') {
        const repsInput = document.getElementById(`reps-${exercise.id}-${idx}`)
        if (repsInput) repsInput.focus()
      } else if (field === 'reps') {
        if (sets[idx]?.weight && sets[idx]?.reps) {
          handleDone(idx)
        }
      }
    }
  }

  const completedCount = sets.filter((s) => s.done).length

  // Build local history for the graph
  const getExerciseLogs = () => {
    try {
      const historyData = localStorage.getItem('gymtracker_history')
      if (!historyData) return []
      const history = JSON.parse(historyData)
      const logs = []
      history.forEach((log) => {
        const match = log.exercises?.find((e) => e.exercise_id === exercise.id)
        if (match && match.sets?.length > 0) {
          // calculate max weight
          let maxW = 0
          let totVol = 0
          match.sets.forEach((s) => {
            if (s.type === 'WU') return
            const w = parseFloat(s.weight) || 0
            const r = parseInt(s.reps, 10) || 0
            if (w > maxW) maxW = w
            totVol += w * r
          })
          if (maxW > 0) {
            logs.push({
              date: new Date(log.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
              maxWeight: maxW,
              volume: totVol,
              sets: match.sets,
            })
          }
        }
      })
      return logs.reverse() // chronological order for graph
    } catch (e) {
      return []
    }
  }

  const historicalLogs = getExerciseLogs()

  // Custom SVG Line Graph
  const renderSVGGraph = () => {
    if (historicalLogs.length < 2) {
      return (
        <div className="flex flex-col items-center justify-center h-20 text-[10px] text-zinc-600 font-bold border border-dashed border-zinc-800/80 rounded-xl bg-zinc-950/20">
          Not enough sessions logged to map graph yet
        </div>
      )
    }
    const weights = historicalLogs.map((h) => h.maxWeight)
    const minW = Math.min(...weights) * 0.92
    const maxW = Math.max(...weights) * 1.08
    const range = maxW - minW || 1

    const width = 360
    const height = 100
    const padding = 15

    const points = historicalLogs
      .map((h, i) => {
        const x = padding + (i / (historicalLogs.length - 1)) * (width - padding * 2)
        const y = height - padding - ((h.maxWeight - minW) / range) * (height - padding * 2)
        return `${x},${y}`
      })
      .join(' ')

    return (
      <div className="relative bg-zinc-950/60 border border-zinc-850/80 p-3 rounded-xl">
        <div className="absolute top-2 right-3 text-[8px] font-mono font-bold text-lime-400 uppercase tracking-widest bg-lime-500/10 px-1.5 py-0.5 rounded border border-lime-500/20">Max Weight (kg)</div>
        <svg className="w-full h-24 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <linearGradient id={`grad-${exercise.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#A3FF12" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#A3FF12" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <polygon
            points={`${padding},${height - padding} ${points} ${width - padding},${height - padding}`}
            fill={`url(#grad-${exercise.id})`}
          />
          <polyline
            fill="none"
            stroke="#A3FF12"
            strokeWidth="2.5"
            points={points}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-[0_0_6px_rgba(163,255,18,0.4)]"
          />
          {historicalLogs.map((h, i) => {
            const x = padding + (i / (historicalLogs.length - 1)) * (width - padding * 2)
            const y = height - padding - ((h.maxWeight - minW) / range) * (height - padding * 2)
            return (
              <g key={i} className="group/node">
                <circle
                  cx={x}
                  cy={y}
                  r="3.5"
                  className="fill-black stroke-lime-400 stroke-2 cursor-pointer hover:r-5 transition-all"
                />
                <text
                  x={x}
                  y={y - 8}
                  textAnchor="middle"
                  className="hidden group-hover/node:block text-[8px] font-mono font-black fill-white bg-black px-1"
                >
                  {h.maxWeight}kg
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    )
  }

  // Get matching swap list
  const muscleAlts = ALTERNATIVES[exercise.muscle] || []

  if (isFocusMode) {
    return (
      <div className="space-y-6 animate-fade-in w-full max-w-md mx-auto">
        {/* Giant Exercise Details */}
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-tight">
            {exercise.name}
          </h3>
          <div className="flex items-center justify-center gap-2">
            <span className="text-[10px] font-black text-lime-400 uppercase tracking-widest bg-lime-500/10 px-2.5 py-1 rounded-full border border-lime-500/20">
              {exercise.muscle}
            </span>
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-full">
              {exercise.type || 'isolation'}
            </span>
          </div>
        </div>

        {/* Swipeable/Scrollable Set Cards for focus */}
        <div className="space-y-3">
          {sets.map((set, idx) => {
            const isWarmup = set.type === 'WU'
            return (
              <div 
                key={idx}
                className={clsx(
                  "border rounded-2xl p-4 transition-all duration-300 relative overflow-hidden",
                  set.done 
                    ? "bg-lime-500/5 border-lime-500/20 shadow-[0_0_20px_rgba(163,255,18,0.03)]" 
                    : "bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-750"
                )}
              >
                {/* Top header of set card */}
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <span className={clsx(
                      "text-[10px] font-black font-mono w-6 h-6 rounded-full flex items-center justify-center border",
                      set.done 
                        ? "bg-lime-500/10 text-lime-400 border-lime-500/20" 
                        : isWarmup
                          ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                          : "bg-zinc-950 border-zinc-800 text-zinc-400"
                    )}>
                      {isWarmup ? 'WU' : set.setNum}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400">
                      {isWarmup ? 'Warm-up Set' : `Set ${set.setNum}`}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {/* Toggle Warmup */}
                    {!set.done && (
                      <button 
                        onClick={() => dispatch(toggleSetType({ exerciseId: exercise.id, setIndex: idx }))}
                        className={clsx(
                          "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider border transition-colors active:scale-95",
                          isWarmup 
                            ? "bg-yellow-500/15 text-yellow-500 border-yellow-500/30" 
                            : "bg-zinc-950 border-zinc-850 text-zinc-500 hover:text-zinc-400"
                        )}
                      >
                        Warmup
                      </button>
                    )}
                    {/* Delete Set */}
                    {sets.length > 1 && (
                      <button 
                        onClick={() => handleDelete(idx)}
                        className="p-1 rounded-md bg-zinc-950 border border-zinc-850 text-zinc-500 hover:text-red-400 transition-colors active:scale-95"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Big input groups */}
                <div className="grid grid-cols-2 gap-3.5 items-center">
                  {/* Weight Input */}
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block font-mono">Weight (KG)</label>
                    <input 
                      id={`weight-${exercise.id}-${idx}`}
                      type="number"
                      inputMode="decimal"
                      placeholder="0"
                      value={set.weight}
                      onChange={(e) => handleChange(idx, 'weight', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, idx, 'weight')}
                      onFocus={(e) => e.target.select()}
                      disabled={set.done}
                      className={clsx(
                        "w-full bg-zinc-950 border text-center font-mono font-black text-lg rounded-xl py-3 px-3 focus:ring-2 focus:ring-lime-400/30 focus:border-lime-400 transition-all text-white",
                        set.done ? "border-transparent text-lime-400 opacity-60 bg-zinc-950/20" : "border-zinc-800 focus:bg-zinc-950"
                      )}
                    />
                  </div>

                  {/* Reps Input */}
                  <div className="space-y-1 relative">
                    <label className="text-[8px] font-black text-zinc-500 uppercase tracking-widest block font-mono">Reps</label>
                    <input 
                      id={`reps-${exercise.id}-${idx}`}
                      type="number"
                      inputMode="numeric"
                      placeholder="0"
                      value={set.reps}
                      onChange={(e) => handleChange(idx, 'reps', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, idx, 'reps')}
                      onFocus={(e) => e.target.select()}
                      disabled={set.done}
                      className={clsx(
                        "w-full bg-zinc-950 border text-center font-mono font-black text-lg rounded-xl py-3 px-3 focus:ring-2 focus:ring-lime-400/30 focus:border-lime-400 transition-all text-white",
                        set.done ? "border-transparent text-lime-400 opacity-60 bg-zinc-950/20" : "border-zinc-800 focus:bg-zinc-950"
                      )}
                    />
                    {set.done && set.isPR && (
                      <span className="absolute right-2 top-0 px-1 bg-lime-400 text-black text-[7px] font-black rounded-sm uppercase tracking-wider animate-bounce shadow-[0_0_10px_rgba(163,255,18,0.6)]">PR</span>
                    )}
                  </div>
                </div>

                {/* Big Action Button for Log Set / Unlock */}
                <div className="mt-3">
                  {!set.done ? (
                    <button
                      onClick={() => handleDone(idx)}
                      disabled={!set.weight || !set.reps}
                      className="w-full py-3 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 text-lime-400 hover:border-lime-400/40 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-20 flex items-center justify-center gap-2 shadow-inner"
                    >
                      <Check size={14} strokeWidth={3} /> Log Set
                    </button>
                  ) : (
                    <button
                      onClick={() => dispatch(unlockSet({ exerciseId: exercise.id, setIndex: idx }))}
                      className="w-full py-3 bg-zinc-900/20 border border-zinc-850 hover:border-zinc-700 text-zinc-400 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Edit2 size={12} /> Unlock Set
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Add Set in Focus Mode */}
        <button
          onClick={() => dispatch(addSet({ exerciseId: exercise.id }))}
          className="w-full bg-lime-400 hover:bg-lime-300 text-black font-black uppercase tracking-widest text-[10px] py-3 rounded-xl shadow-[0_0_20px_rgba(163,230,53,0.2)] transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-1.5"
        >
          <Plus size={14} strokeWidth={3} /> Add Set
        </button>
      </div>
    )
  }

  return (
    <div className={clsx(
      "bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-4 md:p-5 shadow-2xl transition-all duration-300",
      completedCount === sets.length && sets.length > 0 ? "border-l-2 border-l-lime-400 hover:border-lime-500/30" : "border-l-2 border-l-zinc-700 hover:border-zinc-700/60"
    )}>
      {/* Header Info */}
      <div className="flex items-start justify-between mb-3.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3
              onClick={() => setShowHistory(true)}
              className="text-sm font-black text-white leading-tight uppercase cursor-pointer hover:text-lime-400 transition-colors flex items-center gap-1.5 group"
            >
              {exercise.name}
              <BarChart2 size={13} className="text-zinc-500 group-hover:text-lime-400 transition-colors" />
            </h3>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-black text-lime-400 uppercase tracking-wider">{exercise.muscle}</span>
            <span className="text-[10px] text-zinc-750">·</span>
            <span className="text-[9px] font-mono font-semibold text-zinc-500 uppercase">{exercise.type || 'isolation'}</span>
          </div>
        </div>

        {/* Toolbar buttons */}
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
          <button
            onClick={() => setShowNotesField(!showNotesField)}
            className={clsx(
              "p-2 rounded-lg border transition-all duration-200 active:scale-90",
              notesText ? "bg-lime-500/10 text-lime-400 border-lime-500/20" : "bg-zinc-950 border-zinc-850 text-zinc-500 hover:text-zinc-300"
            )}
            title="Exercise Cues / Notes"
          >
            <FileText size={13} />
          </button>
          <button
            onClick={() => setShowReplacements(!showReplacements)}
            className="p-2 rounded-lg bg-zinc-950 border border-zinc-850 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 transition-all duration-200 active:scale-90"
            title="Swap Exercise"
          >
            <Shuffle size={13} />
          </button>
          <span className={clsx(
            'px-2 py-1 rounded-lg text-[10px] font-mono font-bold tracking-wider border',
            completedCount === sets.length && sets.length > 0
              ? 'bg-lime-500/10 text-lime-400 border-lime-500/20'
              : 'bg-zinc-950 text-zinc-500 border-zinc-850'
          )}>
            {completedCount}/{sets.length}
          </span>
        </div>
      </div>

      {/* Static cues / Quick Stats bar */}
      <div className="flex flex-wrap gap-2 mb-3.5 items-center">
        {previousData && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-950 border border-zinc-850">
            <span className="text-[9px] font-bold text-zinc-500 uppercase font-mono">Last:</span>
            <span className="text-[9px] font-mono font-black text-zinc-300">{previousData.weight}kg × {previousData.reps}</span>
          </div>
        )}
        {recordData && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-lime-500/5 border border-lime-500/10 shadow-[0_0_10px_rgba(163,255,18,0.02)]">
            <span className="text-[9px] font-bold text-lime-400 uppercase font-mono">Best:</span>
            <span className="text-[9px] font-mono font-black text-lime-300">{recordData.weight}kg × {recordData.reps}</span>
          </div>
        )}
      </div>

      {/* Exercise Cue field */}
      {showNotesField && (
        <div className="mb-3.5">
          <textarea
            value={notesText}
            onChange={(e) => dispatch(updateExerciseNote({ exerciseId: exercise.id, note: e.target.value }))}
            placeholder="Focus cues: slower eccentric, elbows tucked, chest up..."
            className="w-full bg-zinc-950/80 border border-zinc-850 hover:border-zinc-800 focus:border-lime-500/30 text-xs text-zinc-350 p-2.5 rounded-xl font-medium focus:ring-0 focus:outline-none transition-all placeholder-zinc-700 min-h-[50px] resize-y"
          />
        </div>
      )}

      {/* Column Headers */}
      <div className="grid grid-cols-[40px_1fr_1fr_44px_44px] gap-2 mb-1.5 px-1">
        <span className="text-[8px] font-black text-zinc-650 uppercase tracking-widest text-center">Type</span>
        <span className="text-[8px] font-black text-zinc-650 uppercase tracking-widest text-center">Weight</span>
        <span className="text-[8px] font-black text-zinc-650 uppercase tracking-widest text-center">Reps</span>
        <span className="text-[8px] font-black text-zinc-650 uppercase tracking-widest text-center">Log</span>
        <span className="text-[8px] font-black text-zinc-650 uppercase tracking-widest text-center">Del</span>
      </div>

      {/* Set rows */}
      <div className="space-y-1">
        {sets.map((set, idx) => {
          const isConfirming = confirmDeleteIdx === idx
          const canDelete = sets.length > 1
          const isWarmup = set.type === 'WU'

          return (
            <div
              key={idx}
              className={clsx(
                'grid grid-cols-[40px_1fr_1fr_44px_44px] gap-2 items-center border rounded-xl px-1 py-1 transition-all duration-200 animate-row-in relative overflow-hidden',
                set.done
                  ? 'bg-lime-500/5 border-lime-500/10'
                  : isWarmup
                    ? 'bg-zinc-900/10 border-zinc-900 opacity-60'
                    : 'bg-zinc-950/20 border-transparent hover:bg-zinc-950/30'
              )}
            >
              {/* Type selector (Working vs Warm-up) */}
              <button
                onClick={() => dispatch(toggleSetType({ exerciseId: exercise.id, setIndex: idx }))}
                disabled={set.done}
                className={clsx(
                  "text-[9px] font-black font-mono text-center rounded-lg py-1 transition-colors",
                  set.done
                    ? isWarmup
                      ? 'text-yellow-600'
                      : 'text-lime-400'
                    : isWarmup
                      ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                      : 'bg-zinc-900 text-zinc-550 border border-zinc-850 hover:border-zinc-800'
                )}
                title={isWarmup ? "Warm-up Set. Click to toggle Working set." : "Working Set. Click to toggle Warm-up set."}
              >
                {isWarmup ? 'W/U' : set.setNum}
              </button>

              {/* Weight Input */}
              <div className="relative">
                <input
                  id={`weight-${exercise.id}-${idx}`}
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  value={set.weight}
                  onChange={(e) => handleChange(idx, 'weight', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, idx, 'weight')}
                  onFocus={(e) => e.target.select()}
                  disabled={set.done}
                  className={clsx(
                    'w-full bg-zinc-950 border border-zinc-850 focus:border-lime-400 text-center text-white font-mono rounded-lg py-1.5 px-2 focus:ring-0 focus:outline-none transition-all text-sm',
                    set.done && 'opacity-65 border-transparent text-lime-400 bg-zinc-950/10'
                  )}
                />
              </div>

              {/* Reps Input */}
              <div className="relative flex items-center justify-center">
                <input
                  id={`reps-${exercise.id}-${idx}`}
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={set.reps}
                  onChange={(e) => handleChange(idx, 'reps', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, idx, 'reps')}
                  onFocus={(e) => e.target.select()}
                  disabled={set.done}
                  className={clsx(
                    'w-full bg-zinc-950 border border-zinc-850 focus:border-lime-400 text-center text-white font-mono rounded-lg py-1.5 px-2 focus:ring-0 focus:outline-none transition-all text-sm',
                    set.done && 'opacity-65 border-transparent text-lime-400 bg-zinc-950/10'
                  )}
                />
                {/* PR Highlighting Badge */}
                {set.done && set.isPR && (
                  <span className="absolute -right-1 -top-1 px-1 bg-lime-400 text-black text-[7px] font-black rounded-sm tracking-tighter uppercase animate-bounce shadow-[0_0_8px_rgba(163,255,18,0.6)]">
                    PR
                  </span>
                )}
              </div>

              {/* Done Check/Unlock Toggle */}
              <div>
                {!set.done ? (
                  <button
                    onClick={() => handleDone(idx)}
                    disabled={!set.weight || !set.reps}
                    className="w-full h-8 rounded-lg flex items-center justify-center bg-zinc-950 border border-zinc-850 text-zinc-550 hover:border-lime-500/50 hover:text-lime-400 active:scale-95 disabled:opacity-30 transition-all duration-200"
                    title="Complete Set"
                  >
                    <Check size={13} strokeWidth={2.5} />
                  </button>
                ) : (
                  <button
                    onClick={() => dispatch(unlockSet({ exerciseId: exercise.id, setIndex: idx }))}
                    className="w-full h-8 rounded-lg flex items-center justify-center bg-zinc-900 border border-zinc-850 text-zinc-450 hover:text-lime-400 hover:border-lime-500/20 active:scale-95 transition-all duration-200"
                    title="Unlock & Edit"
                  >
                    <Edit2 size={11} />
                  </button>
                )}
              </div>

              {/* Row Deletion Action */}
              <div>
                <button
                  onClick={() => handleDelete(idx)}
                  disabled={!canDelete}
                  className={clsx(
                    'w-full h-8 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-95 border',
                    !canDelete
                      ? 'bg-zinc-950/10 border-zinc-900/30 text-zinc-750 cursor-not-allowed opacity-20'
                      : isConfirming
                        ? 'bg-red-500 border-red-500 text-white animate-pulse'
                        : 'bg-zinc-950 border-zinc-850 text-zinc-550 hover:border-red-500/50 hover:text-red-400'
                  )}
                  title={isConfirming ? "Confirm Delete" : "Delete Set"}
                >
                  {isConfirming ? <AlertOctagon size={11} /> : <Trash2 size={11} />}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Set buttons footer */}
      <div className="flex gap-2.5 mt-3.5">
        <button
          onClick={() => dispatch(addSet({ exerciseId: exercise.id }))}
          className="flex-1 bg-lime-400 hover:bg-lime-300 text-black font-black uppercase tracking-widest text-[10px] py-2.5 rounded-xl shadow-[0_0_15px_rgba(163,230,53,0.2)] transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-1.5"
        >
          <Plus size={13} strokeWidth={3} /> Add Set
        </button>
        {sets.length > 1 && (
          <button
            onClick={() => handleDelete(sets.length - 1)}
            className="flex-1 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 text-red-500/80 font-black uppercase tracking-widest text-[10px] py-2.5 rounded-xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-1.5"
            title="Remove Last Set"
          >
            <Minus size={13} strokeWidth={3} /> - Set
          </button>
        )}
      </div>

      {/* Swap/Alternatives Modal Overlay */}
      {showReplacements && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[90] p-4">
          <div className="w-full max-w-sm bg-zinc-950 border border-zinc-850 p-5 rounded-2xl shadow-2xl relative animate-slide-up-normal">
            <button
              onClick={() => setShowReplacements(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              <X size={16} />
            </button>
            <h4 className="text-xs font-black text-lime-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Shuffle size={14} /> Swap: {exercise.name}
            </h4>
            <p className="text-[10px] text-zinc-500 mb-4 font-semibold">Select an alternative targeting your **{exercise.muscle}** group. Your completed sets structural alignment will be preserved.</p>
            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
              {muscleAlts
                .filter(alt => alt.name !== exercise.name)
                .map((alt) => (
                  <button
                    key={alt.id}
                    onClick={() => {
                      dispatch(replaceExercise({ exerciseId: exercise.id, newExercise: alt }))
                      setShowReplacements(false)
                    }}
                    className="w-full text-left bg-zinc-900/60 border border-zinc-850 hover:border-lime-500/30 hover:bg-zinc-900 p-3 rounded-xl text-xs font-bold text-zinc-200 hover:text-lime-400 transition-all flex justify-between items-center"
                  >
                    <span>{alt.name}</span>
                    <span className="text-[8px] bg-zinc-950 text-zinc-500 px-1.5 py-0.5 rounded font-mono font-bold uppercase border border-zinc-850">{alt.type}</span>
                  </button>
                ))}
              {muscleAlts.filter(alt => alt.name !== exercise.name).length === 0 && (
                <p className="text-[10px] text-zinc-650 font-bold text-center py-4">No alternative exercises configured for this muscle group.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Slide-over Exercise History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-end z-[90]">
          <div className="w-full max-w-md bg-zinc-950 border-l border-zinc-850 h-full flex flex-col p-5 md:p-6 shadow-2xl relative animate-slide-left">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-zinc-900/60 pb-4 mb-4">
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-wider">{exercise.name}</h4>
                <p className="text-[10px] font-bold text-lime-400 uppercase tracking-widest mt-1">Analytics & Historical Trends</p>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="w-8 h-8 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-5 pr-1 pb-4">
              {/* Graphs Section */}
              <div className="space-y-1">
                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">Weight Overload Trend</p>
                {renderSVGGraph()}
              </div>

              {/* PR stats highlights */}
              <div className="bg-zinc-900/20 border border-zinc-850/80 rounded-xl p-3.5">
                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Sparkles size={11} className="text-lime-400" /> Progression Milestones
                </p>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-zinc-950/60 border border-zinc-900/80 p-2.5 rounded-lg">
                    <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider">Weight Record</p>
                    <p className="text-lg font-black text-white font-mono mt-0.5">{recordData?.weight ? `${recordData.weight}kg` : '—'}</p>
                  </div>
                  <div className="bg-zinc-950/60 border border-zinc-900/80 p-2.5 rounded-lg">
                    <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider">Volume Record</p>
                    <p className="text-lg font-black text-white font-mono mt-0.5">{recordData?.volume ? `${recordData.volume}kg` : '—'}</p>
                  </div>
                </div>
              </div>

              {/* History Timeline Logs list */}
              <div className="space-y-2">
                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">Workout Log Timeline</p>
                <div className="space-y-1.5">
                  {historicalLogs.slice().reverse().map((log, i) => (
                    <div key={i} className="bg-zinc-900/30 border border-zinc-900 hover:border-zinc-850 p-3 rounded-xl flex items-center justify-between transition-colors">
                      <div>
                        <p className="text-xs font-black text-white font-mono">{log.date}</p>
                        <p className="text-[8px] text-zinc-650 font-bold uppercase mt-0.5">Volume: {log.volume.toLocaleString()}kg</p>
                      </div>
                      <div className="flex gap-1.5 flex-wrap justify-end">
                        {log.sets.map((s, idx) => (
                          <span
                            key={idx}
                            className={clsx(
                              "text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border",
                              s.type === 'WU'
                                ? "bg-yellow-500/5 text-yellow-500 border-yellow-500/10"
                                : "bg-zinc-950 text-zinc-300 border-zinc-850"
                            )}
                          >
                            {s.weight}×{s.reps}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                  {historicalLogs.length === 0 && (
                    <p className="text-[10px] text-zinc-650 font-bold text-center py-6">No historical entries found for this exercise.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
