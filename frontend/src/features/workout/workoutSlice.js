/**
 * Workout Slice – manages the active workout session state.
 * Tracks dynamic exercise configurations, sets, PR highlights, and personal notes.
 * Integrates LocalStorage for offline robustness and seamless sync.
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/client'
import { PROGRAM } from '../../data/program'

/** Save a completed workout session (supports backend sync & local storage backup) */
export const saveWorkout = createAsyncThunk(
  'workout/save',
  async (workoutData, { rejectWithValue }) => {
    try {
      const response = await api.post('/workouts', workoutData)
      saveLocalWorkoutLog({ ...workoutData, synced: true })
      return response
    } catch (e) {
      console.warn('Backend sync failed, saving workout locally:', e.message)
      saveLocalWorkoutLog({ ...workoutData, synced: false })
      return { data: workoutData, message: 'Workout saved locally!' }
    }
  }
)

/** Sync local unsynced workouts to the backend when connection is restored */
export const syncOfflineWorkouts = createAsyncThunk(
  'workout/syncOffline',
  async (_, { rejectWithValue }) => {
    try {
      const historyData = localStorage.getItem('gymtracker_history')
      if (!historyData) return []
      
      const history = JSON.parse(historyData)
      const unsyncedLogs = history.filter(log => log.synced === false)
      if (unsyncedLogs.length === 0) return []
      
      console.log(`Found ${unsyncedLogs.length} unsynced workouts. Syncing...`)
      const syncedIds = []
      
      for (const log of unsyncedLogs) {
        try {
          await api.post('/workouts', {
            day_id: log.day_id,
            exercises: log.exercises
          })
          syncedIds.push(log.id)
        } catch (err) {
          console.error(`Failed to sync log ${log.id}:`, err.message)
        }
      }
      
      if (syncedIds.length > 0) {
        const updatedHistory = history.map(log => {
          if (syncedIds.includes(log.id)) {
            return { ...log, synced: true }
          }
          return log
        })
        localStorage.setItem('gymtracker_history', JSON.stringify(updatedHistory))
        console.log(`Successfully synced ${syncedIds.length} offline workouts.`)
      }
      return syncedIds
    } catch (e) {
      return rejectWithValue(e.message)
    }
  }
)

/** Fetch last week's best sets for a day from backend */
export const fetchLastWeek = createAsyncThunk(
  'workout/fetchLastWeek',
  async (dayId, { rejectWithValue }) => {
    try {
      return await api.get(`/workouts/last-week/${dayId}`)
    } catch (e) {
      return rejectWithValue(e.message)
    }
  }
)

/** Save active session to localStorage to prevent data loss on refresh */
const saveActiveSessionToLocalStorage = (state) => {
  try {
    localStorage.setItem('gymtracker_active_session', JSON.stringify({
      activeDayId: state.activeDayId,
      activeExercises: state.activeExercises,
      sets: state.sets,
      startTime: state.startTime,
      lastWeek: state.lastWeek,
      bestEver: state.bestEver,
    }))
  } catch (e) {
    console.error('Error saving active session:', e)
  }
}

/** Retrieve active session on startup */
const getInitialActiveSession = () => {
  try {
    const data = localStorage.getItem('gymtracker_active_session')
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('Error parsing active session:', e)
  }
  return null
}

const getLocalExerciseNotes = () => {
  try {
    const data = localStorage.getItem('gymtracker_exercise_notes')
    return data ? JSON.parse(data) : {}
  } catch (e) {
    return {}
  }
}

const saveLocalExerciseNotes = (notes) => {
  try {
    localStorage.setItem('gymtracker_exercise_notes', JSON.stringify(notes))
  } catch (e) {}
}

/** Save log to local history database */
const saveLocalWorkoutLog = (workoutData) => {
  try {
    const historyData = localStorage.getItem('gymtracker_history')
    const history = historyData ? JSON.parse(historyData) : []
    const newLog = {
      id: Date.now(),
      day_id: workoutData.day_id,
      started_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
      exercises: workoutData.exercises,
      created_at: new Date().toISOString(),
      synced: workoutData.synced || false,
    }
    history.unshift(newLog)
    localStorage.setItem('gymtracker_history', JSON.stringify(history))
  } catch (e) {
    console.error('Error saving workout log:', e)
  }
}

const activeSession = getInitialActiveSession()

const workoutSlice = createSlice({
  name: 'workout',
  initialState: {
    activeDayId: activeSession?.activeDayId || null,
    activeExercises: activeSession?.activeExercises || [],
    sets: activeSession?.sets || {},
    lastWeek: activeSession?.lastWeek || {},
    bestEver: activeSession?.bestEver || {},
    startTime: activeSession?.startTime || null,
    notes: getLocalExerciseNotes(),
    status: 'idle',
    saveStatus: 'idle',
    error: null,
  },
  reducers: {
    startWorkout(state, action) {
      const { dayId, preloadStats } = action.payload
      state.activeDayId = dayId
      state.startTime = new Date().toISOString()
      state.saveStatus = 'idle'
      state.error = null

      const day = PROGRAM.find((d) => d.id === dayId)
      if (!day) return

      // Populate exercises dynamically
      state.activeExercises = JSON.parse(JSON.stringify(day.exercises))

      // Load history database to find performance indicators & PR metrics
      let history = []
      try {
        const historyData = localStorage.getItem('gymtracker_history')
        if (historyData) history = JSON.parse(historyData)
      } catch (e) {
        console.error(e)
      }

      const lastWeekBest = {}
      const bestEverValues = {}

      state.activeExercises.forEach((ex) => {
        // Find best ever values
        let maxWeight = 0
        let maxReps = 0
        let maxVolume = 0

        history.forEach((log) => {
          const loggedEx = log.exercises?.find((e) => e.exercise_id === ex.id)
          if (loggedEx) {
            loggedEx.sets?.forEach((s) => {
              if (s.type === 'WU') return
              const w = parseFloat(s.weight) || 0
              const r = parseInt(s.reps, 10) || 0
              const vol = w * r
              if (w > maxWeight || (w === maxWeight && r > maxReps)) {
                maxWeight = w
                maxReps = r
              }
              if (vol > maxVolume) {
                maxVolume = vol
              }
            })
          }
        })

        if (maxWeight > 0) {
          bestEverValues[ex.id] = { weight: maxWeight, reps: maxReps, volume: maxVolume }
        }

        // Find last session values
        const lastSession = history.find((log) =>
          log.exercises?.some((e) => e.exercise_id === ex.id)
        )
        if (lastSession) {
          const loggedEx = lastSession.exercises.find((e) => e.exercise_id === ex.id)
          if (loggedEx && loggedEx.sets?.length > 0) {
            let maxW = 0
            let maxR = 0
            loggedEx.sets.forEach((s) => {
              if (s.type === 'WU') return
              const w = parseFloat(s.weight) || 0
              const r = parseInt(s.reps, 10) || 0
              if (w > maxW || (w === maxW && r > maxR)) {
                maxW = w
                maxR = r
              }
            })
            lastWeekBest[ex.id] = { weight: maxW, reps: maxR, setsCount: loggedEx.sets.length, rawSets: loggedEx.sets }
          }
        }
      })

      state.lastWeek = lastWeekBest
      state.bestEver = bestEverValues

      // Initialize sets structure
      state.sets = {}
      state.activeExercises.forEach((ex) => {
        const lastExInfo = lastWeekBest[ex.id]
        if (preloadStats && lastExInfo && lastExInfo.rawSets?.length > 0) {
          state.sets[ex.id] = lastExInfo.rawSets.map((s, i) => ({
            setNum: i + 1,
            weight: String(s.weight),
            reps: String(s.reps),
            type: s.type || 'W',
            done: false,
          }))
        } else {
          state.sets[ex.id] = Array.from({ length: ex.sets }, (_, i) => ({
            setNum: i + 1,
            weight: '',
            reps: '',
            type: 'W',
            done: false,
          }))
        }
      })

      saveActiveSessionToLocalStorage(state)
    },
    updateSet(state, action) {
      const { exerciseId, setIndex, field, value } = action.payload
      if (state.sets[exerciseId]?.[setIndex]) {
        state.sets[exerciseId][setIndex][field] = value
        saveActiveSessionToLocalStorage(state)
      }
    },
    markSetDone(state, action) {
      const { exerciseId, setIndex } = action.payload
      if (state.sets[exerciseId]?.[setIndex]) {
        const set = state.sets[exerciseId][setIndex]
        set.done = true

        // Detect Personal Records (PR)
        if (set.type !== 'WU') {
          const w = parseFloat(set.weight) || 0
          const r = parseInt(set.reps, 10) || 0
          const vol = w * r
          const best = state.bestEver[exerciseId] || { weight: 0, reps: 0, volume: 0 }

          const isWeightPR = w > best.weight
          const isRepPR = w === best.weight && r > best.reps
          const isVolumePR = vol > best.volume

          if (isWeightPR || isRepPR || isVolumePR) {
            set.isPR = true
            set.prTypes = { weight: isWeightPR, reps: isRepPR, volume: isVolumePR }

            // Update live session peak
            state.bestEver[exerciseId] = {
              weight: Math.max(best.weight, w),
              reps: w === Math.max(best.weight, w) ? Math.max(best.reps, r) : best.reps,
              volume: Math.max(best.volume, vol),
            }
          }
        }

        saveActiveSessionToLocalStorage(state)
      }
    },
    unlockSet(state, action) {
      const { exerciseId, setIndex } = action.payload
      if (state.sets[exerciseId]?.[setIndex]) {
        state.sets[exerciseId][setIndex].done = false
        // Remove PR tags on unlock
        delete state.sets[exerciseId][setIndex].isPR
        delete state.sets[exerciseId][setIndex].prTypes
        saveActiveSessionToLocalStorage(state)
      }
    },
    deleteSet(state, action) {
      const { exerciseId, setIndex } = action.payload
      if (state.sets[exerciseId]) {
        state.sets[exerciseId].splice(setIndex, 1)
        state.sets[exerciseId].forEach((set, i) => {
          set.setNum = i + 1
        })
        saveActiveSessionToLocalStorage(state)
      }
    },
    addSet(state, action) {
      const { exerciseId } = action.payload
      if (state.sets[exerciseId]) {
        const len = state.sets[exerciseId].length
        state.sets[exerciseId].push({ setNum: len + 1, weight: '', reps: '', type: 'W', done: false })
        saveActiveSessionToLocalStorage(state)
      }
    },
    toggleSetType(state, action) {
      const { exerciseId, setIndex } = action.payload
      if (state.sets[exerciseId]?.[setIndex]) {
        const currentType = state.sets[exerciseId][setIndex].type || 'W'
        state.sets[exerciseId][setIndex].type = currentType === 'W' ? 'WU' : 'W'
        saveActiveSessionToLocalStorage(state)
      }
    },
    reorderExercises(state, action) {
      const { sourceIndex, targetIndex } = action.payload
      const exercises = [...state.activeExercises]
      const [removed] = exercises.splice(sourceIndex, 1)
      exercises.splice(targetIndex, 0, removed)
      state.activeExercises = exercises
      saveActiveSessionToLocalStorage(state)
    },
    replaceExercise(state, action) {
      const { exerciseId, newExercise } = action.payload
      const idx = state.activeExercises.findIndex((ex) => ex.id === exerciseId)
      if (idx !== -1) {
        const oldEx = state.activeExercises[idx]
        state.activeExercises[idx] = {
          ...oldEx,
          id: newExercise.id,
          name: newExercise.name,
          muscle: newExercise.muscle,
          type: newExercise.type || 'isolation',
        }
        state.sets[newExercise.id] = state.sets[exerciseId]
        delete state.sets[exerciseId]

        if (state.lastWeek[exerciseId]) {
          state.lastWeek[newExercise.id] = state.lastWeek[exerciseId]
          delete state.lastWeek[exerciseId]
        }
        if (state.bestEver[exerciseId]) {
          state.bestEver[newExercise.id] = state.bestEver[exerciseId]
          delete state.bestEver[exerciseId]
        }
        saveActiveSessionToLocalStorage(state)
      }
    },
    updateExerciseNote(state, action) {
      const { exerciseId, note } = action.payload
      state.notes[exerciseId] = note
      saveLocalExerciseNotes(state.notes)
    },
    resetWorkout(state) {
      state.activeDayId = null
      state.activeExercises = []
      state.sets = {}
      state.lastWeek = {}
      state.bestEver = {}
      state.startTime = null
      state.saveStatus = 'idle'
      try {
        localStorage.removeItem('gymtracker_active_session')
      } catch (e) {
        console.error(e)
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveWorkout.pending, (state) => { state.saveStatus = 'loading' })
      .addCase(saveWorkout.fulfilled, (state) => {
        state.saveStatus = 'succeeded'
        state.activeDayId = null
        state.activeExercises = []
        state.sets = {}
        state.lastWeek = {}
        state.bestEver = {}
        state.startTime = null
        try {
          localStorage.removeItem('gymtracker_active_session')
        } catch (e) {
          console.error(e)
        }
      })
      .addCase(saveWorkout.rejected, (state, action) => {
        state.saveStatus = 'failed'; state.error = action.payload
      })
      .addCase(fetchLastWeek.fulfilled, (state, action) => {
        if (action.payload?.data) {
          state.lastWeek = { ...state.lastWeek, ...action.payload.data }
          saveActiveSessionToLocalStorage(state)
        }
      })
  },
})

export const {
  startWorkout,
  updateSet,
  markSetDone,
  unlockSet,
  deleteSet,
  addSet,
  toggleSetType,
  reorderExercises,
  replaceExercise,
  updateExerciseNote,
  resetWorkout,
} = workoutSlice.actions

export const selectSets = (state) => state.workout.sets
export const selectActiveExercises = (state) => state.workout.activeExercises
export const selectActiveDayId = (state) => state.workout.activeDayId
export const selectLastWeek = (state) => state.workout.lastWeek
export const selectBestEver = (state) => state.workout.bestEver
export const selectExerciseNotes = (state) => state.workout.notes
export const selectSaveStatus = (state) => state.workout.saveStatus
export const selectWorkoutStartTime = (state) => state.workout.startTime

export default workoutSlice.reducer
