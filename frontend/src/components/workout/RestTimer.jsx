/**
 * RestTimer – Premium minimizable floating REST countdown timer.
 * Features circular progress path animations, mobile haptics, and synthesizer tone cues.
 */
import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectTimer, tick, pauseTimer, resumeTimer, dismissTimer, resetTimer } from '../../features/timer/timerSlice'
import { Timer, Pause, Play, X, RotateCcw, Minimize2 } from 'lucide-react'
import clsx from 'clsx'

export default function RestTimer() {
  const dispatch = useDispatch()
  const { isRunning, secondsLeft, totalSeconds, isFinished } = useSelector(selectTimer)
  const [isMinimized, setIsMinimized] = useState(false)
  const intervalRef = useRef(null)

  // Tick every second
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => dispatch(tick()), 1000)
    }
    return () => clearInterval(intervalRef.current)
  }, [isRunning, dispatch])

  // Audio synthesize cue & vibration on completion
  useEffect(() => {
    if (isFinished) {
      setIsMinimized(false) // Force maximize to draw attention
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)()
        for (let i = 0; i < 3; i++) {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.frequency.value = 880
          osc.type = 'sine'
          gain.gain.value = 0.25
          osc.start(ctx.currentTime + i * 0.28)
          osc.stop(ctx.currentTime + i * 0.28 + 0.12)
        }
      } catch (e) {
        console.warn('Audio tone synthesis failed:', e)
      }
      
      // Multi-pulse vibration for heavy in-gym focus
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 300])
      }
    }
  }, [isFinished])

  if (!isRunning && !isFinished) return null

  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60
  const progress = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0
  const isLow = secondsLeft <= 10 && secondsLeft > 0

  // Circular calculations
  const radius = 18
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  // Minimized Circle FAB HUD
  if (isMinimized) {
    return (
      <div 
        onClick={() => setIsMinimized(false)}
        className={clsx(
          "fixed bottom-24 right-4 z-[60] w-14 h-14 rounded-full bg-zinc-950/95 backdrop-blur-md border border-zinc-800 shadow-[0_0_20px_rgba(163,255,18,0.15)] flex items-center justify-center cursor-pointer select-none transition-all duration-300 hover:border-lime-400 active:scale-90 animate-fade-in",
          isFinished && "border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)] bg-red-950/30"
        )}
      >
        <svg className="absolute inset-0 w-full h-full transform -rotate-90 p-0.5" viewBox="0 0 44 44">
          <circle
            cx="22"
            cy="22"
            r={radius}
            className="stroke-zinc-900/60"
            strokeWidth="3.5"
            fill="transparent"
          />
          <circle
            cx="22"
            cy="22"
            r={radius}
            className={clsx(
              "transition-all duration-300 ease-linear",
              isLow ? "stroke-red-500" : "stroke-lime-400"
            )}
            strokeWidth="3.5"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        <span className="text-[10px] font-mono font-black text-white z-10">
          {mins}:{secs.toString().padStart(2, '0')}
        </span>
      </div>
    )
  }

  // Expanded Dashboard Rest Panel
  return (
    <div className={clsx(
      'fixed bottom-20 inset-x-0 z-[60] p-4 animate-slide-up-normal',
      isFinished ? 'animate-pulse' : ''
    )}>
      <div className={clsx(
        'max-w-sm mx-auto rounded-3xl border border-zinc-800/80 p-5 shadow-[0_15px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl relative overflow-hidden transition-all duration-300',
        isFinished
          ? 'bg-red-500/10 border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]'
          : 'bg-zinc-950/90'
      )}>
        {/* Soft neon gradient glow */}
        <div className={clsx(
          "absolute -top-10 -left-10 w-24 h-24 rounded-full blur-[40px] pointer-events-none opacity-30",
          isFinished ? "bg-red-500" : "bg-lime-500"
        )} />

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-14 h-14 flex-shrink-0 flex items-center justify-center bg-zinc-900/60 rounded-full border border-zinc-850">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 44 44">
                <circle
                  cx="22"
                  cy="22"
                  r={radius}
                  className="stroke-zinc-950"
                  strokeWidth="3"
                  fill="transparent"
                />
                <circle
                  cx="22"
                  cy="22"
                  r={radius}
                  className={clsx(
                    "transition-all duration-300 ease-linear",
                    isLow ? "stroke-red-500" : "stroke-lime-400"
                  )}
                  strokeWidth="3"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <Timer size={16} className={isFinished ? 'text-red-500 animate-bounce' : 'text-lime-400'} />
            </div>

            <div>
              <p className={clsx(
                'text-2xl font-black font-mono tracking-tight tabular-nums',
                isFinished ? 'text-red-400' : isLow ? 'text-red-400' : 'text-white'
              )}>
                {mins}:{secs.toString().padStart(2, '0')}
              </p>
              <p className="text-[9px] text-zinc-550 font-black uppercase tracking-wider mt-0.5 block">
                {isFinished ? 'Rest Completed — Push!' : 'Resting Interval'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 z-10">
            {!isFinished && (
              <>
                <button
                  onClick={() => dispatch(isRunning ? pauseTimer() : resumeTimer())}
                  className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-850 flex items-center justify-center text-zinc-450 hover:text-lime-400 hover:border-lime-500/20 transition-all duration-250 active:scale-90"
                  title={isRunning ? "Pause Rest" : "Resume Rest"}
                >
                  {isRunning ? <Pause size={13} /> : <Play size={13} />}
                </button>
                <button
                  onClick={() => setIsMinimized(true)}
                  className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-850 flex items-center justify-center text-zinc-450 hover:text-white transition-all duration-250 active:scale-90"
                  title="Minimize Timer"
                >
                  <Minimize2 size={13} />
                </button>
              </>
            )}
            <button
              onClick={() => dispatch(resetTimer())}
              className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-850 flex items-center justify-center text-zinc-450 hover:text-lime-400 transition-all duration-250 active:scale-90"
              title="Reset Timer"
            >
              <RotateCcw size={13} />
            </button>
            <button
              onClick={() => dispatch(dismissTimer())}
              className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-850 flex items-center justify-center text-zinc-450 hover:text-red-500 transition-all duration-250 active:scale-95"
              title="Dismiss Timer"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
