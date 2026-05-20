/**
 * History Slice – fetches past workout logs for history and volume tracking.
 * Integrates LocalStorage offline fallbacks and metrics calculations.
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/client'
import { PROGRAM } from '../../data/program'

/** Helper to map local storage history records to the API schema */
function mapLocalHistoryToApi(localHistory) {
  return localHistory.map((log) => {
    let totalSets = 0
    let totalVolume = 0
    
    const exercises = log.exercises.map((ex) => {
      let name = 'Unknown'
      let muscle = 'Unknown'
      
      PROGRAM.forEach((day) => {
        const found = day.exercises.find((e) => e.id === ex.exercise_id)
        if (found) {
          name = found.name
          muscle = found.muscle
        }
      })
      
      const setsCount = ex.sets?.length || 0
      totalSets += setsCount
      
      ex.sets?.forEach((s) => {
        totalVolume += (parseFloat(s.weight) || 0) * (parseInt(s.reps, 10) || 0)
      })
      
      return {
        name,
        muscle,
        sets_count: setsCount,
      }
    })
    
    return {
      id: log.id,
      day_id: log.day_id,
      total_sets: totalSets,
      total_volume: totalVolume,
      exercises,
      created_at: log.created_at || new Date().toISOString(),
    }
  })
}

/** Fetch all workout logs */
export const fetchHistory = createAsyncThunk(
  'history/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/workouts/history')
      return response?.data || []
    } catch (e) {
      console.warn('Backend history fetch failed, reading local storage:', e.message)
      try {
        const historyData = localStorage.getItem('gymtracker_history')
        if (historyData) {
          const rawHistory = JSON.parse(historyData)
          return mapLocalHistoryToApi(rawHistory)
        }
      } catch (err) {
        console.error('Error loading local history:', err)
      }
      return []
    }
  }
)

/** Fetch muscle group volume statistics */
export const fetchVolumeStats = createAsyncThunk(
  'history/fetchVolume',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/workouts/volume')
      return response?.data || {}
    } catch (e) {
      console.warn('Backend volume fetch failed, calculating from local storage:', e.message)
      try {
        const historyData = localStorage.getItem('gymtracker_history')
        if (!historyData) return {}
        
        const history = JSON.parse(historyData)
        
        // Filter history from the last 7 days
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        
        const volume = {}
        history.forEach((log) => {
          const logDate = new Date(log.created_at)
          if (logDate >= oneWeekAgo) {
            log.exercises.forEach((ex) => {
              let muscle = 'Unknown'
              PROGRAM.forEach((day) => {
                const found = day.exercises.find((e) => e.id === ex.exercise_id)
                if (found) muscle = found.muscle
              })
              
              if (muscle !== 'Unknown') {
                volume[muscle] = (volume[muscle] || 0) + (ex.sets?.length || 0)
              }
            })
          }
        })
        return volume
      } catch (err) {
        console.error('Error calculating local volume stats:', err)
      }
      return {}
    }
  }
)

const historySlice = createSlice({
  name: 'history',
  initialState: {
    logs: [],
    volumeByMuscle: {},
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHistory.pending, (state) => { state.status = 'loading' })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.logs = action.payload || []
      })
      .addCase(fetchHistory.rejected, (state, action) => {
        state.status = 'failed'; state.error = action.payload
      })
      .addCase(fetchVolumeStats.fulfilled, (state, action) => {
        state.volumeByMuscle = action.payload || {}
      })
  },
})

export const selectHistory = (state) => state.history.logs
export const selectVolume = (state) => state.history.volumeByMuscle
export const selectHistoryStatus = (state) => state.history.status
export default historySlice.reducer
