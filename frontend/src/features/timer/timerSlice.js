/**
 * Timer Slice – rest timer with countdown and notification.
 */
import { createSlice } from '@reduxjs/toolkit'

const DEFAULT_REST = 90 // seconds

const timerSlice = createSlice({
  name: 'timer',
  initialState: {
    isRunning: false,
    totalSeconds: DEFAULT_REST,
    secondsLeft: DEFAULT_REST,
    isFinished: false,
  },
  reducers: {
    startTimer(state, action) {
      const duration = action.payload || DEFAULT_REST
      state.totalSeconds = duration
      state.secondsLeft = duration
      state.isRunning = true
      state.isFinished = false
    },
    tick(state) {
      if (state.isRunning && state.secondsLeft > 0) {
        state.secondsLeft -= 1
        if (state.secondsLeft === 0) {
          state.isRunning = false
          state.isFinished = true
        }
      }
    },
    pauseTimer(state) { state.isRunning = false },
    resumeTimer(state) { if (state.secondsLeft > 0) state.isRunning = true },
    resetTimer(state) {
      state.isRunning = false
      state.secondsLeft = state.totalSeconds
      state.isFinished = false
    },
    dismissTimer(state) {
      state.isRunning = false
      state.isFinished = false
      state.secondsLeft = state.totalSeconds
    },
    setDuration(state, action) {
      state.totalSeconds = action.payload
      if (!state.isRunning) state.secondsLeft = action.payload
    },
  },
})

export const { startTimer, tick, pauseTimer, resumeTimer, resetTimer, dismissTimer, setDuration } = timerSlice.actions
export const selectTimer = (state) => state.timer
export default timerSlice.reducer
