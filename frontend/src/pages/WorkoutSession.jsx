/**
 * WorkoutSession – Live workout logger for a single day.
 * Implements:
 * - Fullscreen Focus Mode with horizontal swiping.
 * - Live Volume & Intensity Counters in sticky header.
 * - Fatigue & Performance Trend Alerts comparing to last week.
 * - Drag-and-drop and manual arrow-based exercise reordering.
 */
import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  startWorkout,
  selectActiveDayId,
  selectSets,
  selectSaveStatus,
  selectActiveExercises,
  selectLastWeek,
  selectWorkoutStartTime,
  saveWorkout,
  resetWorkout,
  fetchLastWeek,
  reorderExercises,
} from '../features/workout/workoutSlice'
import { selectTimer, pauseTimer, resumeTimer, dismissTimer, resetTimer } from '../features/timer/timerSlice'
import { PROGRAM } from '../data/program'
import ExerciseCard from '../components/workout/ExerciseCard'
import RestTimer from '../components/workout/RestTimer'
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  Loader2,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Activity,
  Play,
  Pause,
  RotateCcw,
  Timer as TimerIcon,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import clsx from 'clsx'

export default function WorkoutSession() {
  const { dayId } = useParams()
  const dayIdNum = Number(dayId)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const activeDayId = useSelector(selectActiveDayId)
  const activeExercises = useSelector(selectActiveExercises)
  const sets = useSelector(selectSets)
  const saveStatus = useSelector(selectSaveStatus)
  const lastWeek = useSelector(selectLastWeek)
  const startTime = useSelector(selectWorkoutStartTime)
  const timer = useSelector(selectTimer)

  const day = useMemo(() => PROGRAM.find((d) => d.id === dayIdNum), [dayIdNum])

  // Focus Mode state
  const [isFocusMode, setIsFocusMode] = useState(false)
  const [focusIdx, setFocusIdx] = useState(0)

  // Drag and Drop State
  const [draggedIdx, setDraggedIdx] = useState(null)

  // Trigger workout startup
  useEffect(() => {
    if (day && activeDayId !== dayIdNum) {
      // Prompt selection modal is handled in Home.jsx, here we start default if none active
      dispatch(startWorkout({ dayId: dayIdNum, preloadStats: true }))
      dispatch(fetchLastWeek(dayIdNum))
    }
  }, [day, dayIdNum, activeDayId, dispatch])

  if (!day) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh px-4 text-center bg-black">
        <p className="text-lg font-bold text-white mb-2">Workout not found</p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-3 rounded-xl border border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-lime-500/40 hover:text-lime-400 active:scale-95 transition-all duration-200 text-sm"
        >
          Go Home
        </button>
      </div>
    )
  }

  // Active exercises fall back to day config if Redux not populated yet
  const exerciseList = activeExercises?.length > 0 ? activeExercises : day.exercises

  // Compute live session stats
  const totalSets = Object.values(sets).flat()
  const doneSets = totalSets.filter((s) => s.done).length
  const workingSets = totalSets.filter((s) => s.type !== 'WU')
  const doneWorkingSets = workingSets.filter((s) => s.done).length

  // Live session volume (working sets only)
  const liveVolume = exerciseList.reduce((accVolume, ex) => {
    const exSets = sets[ex.id] || []
    const exVolume = exSets
      .filter((s) => s.done && s.type !== 'WU')
      .reduce((sVol, s) => sVol + (parseFloat(s.weight) || 0) * (parseInt(s.reps, 10) || 0), 0)
    return accVolume + exVolume
  }, 0)

  // Live session intensity (average completed rep weight relative to last week)
  const intensityIndicator = useMemo(() => {
    let completedSetsCount = 0
    let totalPct = 0
    exerciseList.forEach((ex) => {
      const exSets = sets[ex.id] || []
      const lastEx = lastWeek[ex.id]
      if (lastEx && lastEx.weight > 0) {
        exSets.forEach((s) => {
          if (s.done && s.type !== 'WU') {
            const w = parseFloat(s.weight) || 0
            if (w > 0) {
              totalPct += (w / lastEx.weight) * 100
              completedSetsCount++
            }
          }
        })
      }
    })
    if (completedSetsCount === 0) return 'Optimal'
    const avg = totalPct / completedSetsCount
    if (avg >= 100) return `High Intensity (${avg.toFixed(0)}%)`
    if (avg >= 90) return `Moderate Intensity (${avg.toFixed(0)}%)`
    return `Low Intensity (${avg.toFixed(0)}%)`
  }, [exerciseList, sets, lastWeek])

  // Fatigue & Performance trend indicator
  const fatigueTrend = useMemo(() => {
    let compareCount = 0
    let totalVolumeDiff = 0

    exerciseList.forEach((ex) => {
      const exSets = sets[ex.id] || []
      const lastEx = lastWeek[ex.id]
      if (lastEx && lastEx.rawSets?.length > 0) {
        const lastExVol = lastEx.rawSets
          .filter((s) => s.type !== 'WU')
          .reduce((sum, s) => sum + (parseFloat(s.weight) || 0) * (parseInt(s.reps, 10) || 0), 0)

        const currentExVol = exSets
          .filter((s) => s.done && s.type !== 'WU')
          .reduce((sum, s) => sum + (parseFloat(s.weight) || 0) * (parseInt(s.reps, 10) || 0), 0)

        // Only compare if user logged sets today
        if (currentExVol > 0 && lastExVol > 0) {
          const diff = ((currentExVol - lastExVol) / lastExVol) * 100
          totalVolumeDiff += diff
          compareCount++
        }
      }
    })

    if (compareCount === 0) return null
    const avgDiff = totalVolumeDiff / compareCount

    if (avgDiff < -5) {
      return {
        status: 'fatigue',
        message: `Fatigue Alert: Working volume down ${Math.abs(avgDiff).toFixed(0)}% today. Consider extending rests.`,
      }
    }
    if (avgDiff > 5) {
      return {
        status: 'peak',
        message: `Performance Peak: Volume up ${avgDiff.toFixed(0)}%! Progressive overload active.`,
      }
    }
    return {
      status: 'neutral',
      message: `Stable Performance: Volume matching last week within ${avgDiff.toFixed(1)}%.`,
    }
  }, [exerciseList, sets, lastWeek])

  const workoutProgress = exerciseList.length > 0 ? (exerciseList.filter(ex => {
    const exSets = sets[ex.id] || []
    return exSets.length > 0 && exSets.every(s => s.done)
  }).length / exerciseList.length) * 100 : 0

  const handleFinish = () => {
    const workoutData = {
      day_id: dayIdNum,
      exercises: exerciseList.map((ex) => ({
        exercise_id: ex.id,
        sets: (sets[ex.id] || [])
          .filter((s) => s.done)
          .map((s) => ({
            weight: parseFloat(s.weight) || 0,
            reps: parseInt(s.reps, 10) || 0,
            type: s.type || 'W',
          })),
      })).filter((e) => e.sets.length > 0),
    }
    dispatch(saveWorkout(workoutData))
  }

  const handleExit = () => {
    dispatch(resetWorkout())
    navigate('/')
  }

  // Drag and Drop Handlers
  const handleDragStart = (e, index) => {
    setDraggedIdx(index)
  }

  const handleDrop = (e, index) => {
    if (draggedIdx !== null && draggedIdx !== index) {
      dispatch(reorderExercises({ sourceIndex: draggedIdx, targetIndex: index }))
    }
    setDraggedIdx(null)
  }

  const handleMove = (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex >= 0 && targetIndex < exerciseList.length) {
      dispatch(reorderExercises({ sourceIndex: index, targetIndex }))
    }
  }

  // Render Focus Mode full-overlay view
  if (isFocusMode && exerciseList.length > 0) {
    const activeEx = exerciseList[focusIdx]
    const timerMins = Math.floor(timer.secondsLeft / 60)
    const timerSecs = timer.secondsLeft % 60

    return (
      <div className="fixed inset-0 bg-black z-50 overflow-y-auto flex flex-col justify-between p-4 md:p-6 animate-fade-in">
        {/* Focus Mode Header */}
        <header className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFocusMode(false)}
              className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-850 text-zinc-400 hover:text-white transition-all active:scale-95"
            >
              <Minimize2 size={16} />
            </button>
            <div>
              <p className="text-[9px] font-black text-lime-400 uppercase tracking-widest leading-none">Focus Mode Active</p>
              <h2 className="text-xs font-bold text-zinc-400 uppercase font-mono tracking-wider mt-1">{day.name}</h2>
            </div>
          </div>

          {/* Integrated Timer inside Focus mode */}
          {(timer.isRunning || timer.isFinished) && (
            <div className={clsx(
              "flex items-center gap-3 border px-3 py-1.5 rounded-xl",
              timer.isFinished ? "bg-red-500/10 border-red-500/30 text-red-400 animate-pulse" : "bg-zinc-950 border-zinc-850 text-white"
            )}>
              <TimerIcon size={14} className={timer.isFinished ? "text-red-400" : "text-lime-400"} />
              <span className="text-xs font-mono font-black">{timerMins}:{timerSecs.toString().padStart(2, '0')}</span>
              <button
                onClick={() => dispatch(timer.isRunning ? pauseTimer() : resumeTimer())}
                className="text-[9px] font-black uppercase text-zinc-400 hover:text-white"
              >
                {timer.isRunning ? 'Pause' : 'Play'}
              </button>
            </div>
          )}

          {/* Progress gauge */}
          <span className="text-[10px] text-zinc-500 font-mono font-bold">{focusIdx + 1} / {exerciseList.length} Exercises</span>
        </header>

        {/* Focus Mode Active Exercise Card */}
        <div className="flex-1 flex items-center justify-center py-4">
          <div className="w-full max-w-lg">
            <ExerciseCard key={activeEx.id} exercise={activeEx} isFocusMode={true} />
          </div>
        </div>

        {/* Focus Mode Controls & Stats Footer */}
        <footer className="border-t border-zinc-900 pt-4 mt-4 space-y-4">
          {/* Live Volume & Intensity readout */}
          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-zinc-500 bg-zinc-950/60 border border-zinc-900 p-2.5 rounded-xl">
            <span>Volume: <strong className="text-white">{liveVolume.toLocaleString()}kg</strong></span>
            <span>Intensity: <strong className="text-white">{intensityIndicator}</strong></span>
          </div>

          {/* Pagination Controls */}
          <div className="flex gap-4">
            <button
              onClick={() => setFocusIdx(prev => Math.max(0, prev - 1))}
              disabled={focusIdx === 0}
              className="flex-1 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-20 flex items-center justify-center gap-1.5"
            >
              <ChevronLeft size={16} /> Back
            </button>
            {focusIdx < exerciseList.length - 1 ? (
              <button
                onClick={() => setFocusIdx(prev => Math.min(exerciseList.length - 1, prev + 1))}
                className="flex-1 bg-lime-400 hover:bg-lime-300 text-black py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(163,230,53,0.2)] transition-all flex items-center justify-center gap-1.5"
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={doneSets === 0 || saveStatus === 'loading'}
                className="flex-1 bg-lime-400 hover:bg-lime-300 text-black py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(163,230,53,0.3)] transition-all flex items-center justify-center gap-1.5"
              >
                {saveStatus === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> Finish Session</>}
              </button>
            )}
          </div>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-black text-white w-full">
      {/* Sticky Premium Header with Stats Counter */}
      <header className="sticky top-0 z-45 bg-black/95 backdrop-blur-md border-b border-zinc-900 px-4 md:px-8 py-3 md:py-4">
        <div className="max-w-[1200px] mx-auto space-y-3">
          <div className="flex items-center justify-between gap-6">
            {/* Back action */}
            <button
              onClick={handleExit}
              className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors active:scale-95 flex-shrink-0"
            >
              <ArrowLeft size={18} />
              <span className="text-[10px] font-black uppercase tracking-wider hidden sm:inline">Exit Session</span>
            </button>

            {/* Central Progress Metrics */}
            <div className="flex-1 max-w-sm">
              <div className="flex items-center justify-between mb-1.5">
                <div>
                  <span className="text-[8px] font-black text-lime-400 uppercase tracking-widest leading-none">Active split</span>
                  <h2 className="text-sm font-black text-white leading-none mt-0.5 uppercase tracking-wide">{day.name}</h2>
                </div>
                <span className="text-[10px] font-bold text-zinc-400 font-mono tracking-wider">{doneWorkingSets} / {workingSets.length} working sets</span>
              </div>
              <div className="h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-lime-400 shadow-[0_0_12px_rgba(163,230,53,0.5)] transition-all duration-500"
                  style={{ width: `${workoutProgress}%` }}
                />
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => {
                  setFocusIdx(0)
                  setIsFocusMode(true)
                }}
                className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-850 text-zinc-400 hover:text-white transition-all active:scale-95 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
                title="Distraction-Free Mode"
              >
                <Maximize2 size={13} />
                <span className="hidden md:inline">Focus</span>
              </button>

              {doneSets > 0 && saveStatus !== 'succeeded' && (
                <button
                  onClick={handleFinish}
                  disabled={saveStatus === 'loading'}
                  className="bg-lime-400 hover:bg-lime-300 text-black font-black uppercase tracking-widest text-xs px-4 py-2.5 rounded-xl shadow-[0_0_20px_rgba(163,230,53,0.2)] transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center gap-1.5"
                >
                  {saveStatus === 'loading' ? (
                    <><Loader2 size={13} className="animate-spin" /> Saving</>
                  ) : (
                    <><Save size={13} /> Finish</>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Sticky live stats metrics panel */}
          <div className="flex flex-wrap items-center justify-between border-t border-zinc-950 pt-2.5 text-[9px] font-mono font-bold text-zinc-500 gap-3">
            <div className="flex items-center gap-4">
              <span>Volume: <strong className="text-zinc-200">{liveVolume.toLocaleString()} kg</strong></span>
              <span className="text-zinc-800">|</span>
              <span>Est. Intensity: <strong className="text-zinc-200">{intensityIndicator}</strong></span>
            </div>

            {/* Fatigue Indicators */}
            {fatigueTrend && (
              <div className={clsx(
                "flex items-center gap-1 px-2.5 py-0.5 rounded-lg border",
                fatigueTrend.status === 'fatigue'
                  ? "bg-red-500/10 border-red-500/20 text-red-400"
                  : fatigueTrend.status === 'peak'
                    ? "bg-lime-500/10 border-lime-500/20 text-lime-400"
                    : "bg-zinc-900 border-zinc-850 text-zinc-400"
              )}>
                <Activity size={10} className="animate-pulse" />
                <span>{fatigueTrend.message}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main workout tracking canvas */}
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 py-6 md:py-8 pb-16 safe-bottom">
        {saveStatus === 'succeeded' ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16 animate-fade-in max-w-md mx-auto bg-zinc-900/20 border border-zinc-800/60 rounded-3xl p-8 backdrop-blur-md">
            <div className="w-16 h-16 rounded-full bg-lime-500/10 border border-lime-500/20 flex items-center justify-center animate-pulse">
              <CheckCircle2 size={32} className="text-lime-400" />
            </div>
            <p className="text-xl font-black text-lime-400 uppercase tracking-wide text-center">Workout Saved! 🎉</p>
            <p className="text-xs text-zinc-400 text-center font-medium leading-relaxed">
              Splits data synchronized with progression log. Keep maintaining the overload pattern next session.
            </p>
            <button
              onClick={handleExit}
              className="mt-4 w-full bg-lime-400 hover:bg-lime-300 text-black font-black uppercase tracking-widest text-xs py-3 rounded-xl shadow-[0_0_20px_rgba(163,230,53,0.3)] active:scale-95 transition-all duration-200"
            >
              Return to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Exercise list: dynamic drag & drop grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exerciseList.map((ex, idx) => (
                <div
                  key={ex.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, idx)}
                  className={clsx(
                    "animate-slide-up-normal relative group border border-transparent rounded-2xl",
                    draggedIdx === idx && "opacity-30 border-dashed border-lime-500"
                  )}
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  {/* Manual Arrow-based reordering buttons for touch screen/mobile */}
                  <div className="absolute top-2 right-12 z-20 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-950/90 border border-zinc-800 rounded-lg p-0.5">
                    <button
                      onClick={() => handleMove(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 text-zinc-500 hover:text-lime-400 disabled:opacity-20 transition-colors"
                      title="Move Exercise Up"
                    >
                      <ArrowUp size={11} />
                    </button>
                    <button
                      onClick={() => handleMove(idx, 'down')}
                      disabled={idx === exerciseList.length - 1}
                      className="p-1 text-zinc-500 hover:text-lime-400 disabled:opacity-20 transition-colors"
                      title="Move Exercise Down"
                    >
                      <ArrowDown size={11} />
                    </button>
                  </div>

                  <ExerciseCard exercise={ex} />
                </div>
              ))}
            </div>

            {/* Mobile / fallback bottom saving banner */}
            {doneSets > 0 && (
              <div className="pt-4 md:hidden">
                <button
                  onClick={handleFinish}
                  disabled={saveStatus === 'loading'}
                  className="w-full bg-lime-400 hover:bg-lime-300 text-black font-black uppercase tracking-widest text-xs py-3.5 rounded-xl shadow-[0_0_20px_rgba(163,230,53,0.3)] transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saveStatus === 'loading' ? (
                    <><Loader2 size={18} className="animate-spin" /> Saving...</>
                  ) : (
                    <><Save size={18} /> Finish Workout ({doneSets} sets logged)</>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating rest timer */}
      <RestTimer />
    </div>
  )
}
