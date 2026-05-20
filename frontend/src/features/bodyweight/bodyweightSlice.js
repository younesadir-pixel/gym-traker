/**
 * Bodyweight Slice – logs bodyweight and stores progression history locally.
 */
import { createSlice } from '@reduxjs/toolkit'

const getLocalLogs = () => {
  try {
    const data = localStorage.getItem('gymtracker_bodyweight')
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error('Error parsing bodyweight logs:', e)
  }
  return []
}

const saveLocalLogs = (logs) => {
  try {
    localStorage.setItem('gymtracker_bodyweight', JSON.stringify(logs))
  } catch (e) {
    console.error('Error saving bodyweight logs:', e)
  }
}

const bodyweightSlice = createSlice({
  name: 'bodyweight',
  initialState: {
    logs: getLocalLogs(),
  },
  reducers: {
    addBodyweightLog(state, action) {
      const { weight, photoUrl } = action.payload
      const newLog = {
        id: Date.now(),
        date: new Date().toISOString(),
        weight: parseFloat(weight) || 0,
        photoUrl: photoUrl || null,
      }
      state.logs.unshift(newLog)
      saveLocalLogs(state.logs)
    },
    deleteBodyweightLog(state, action) {
      state.logs = state.logs.filter((log) => log.id !== action.payload)
      saveLocalLogs(state.logs)
    },
  },
})

export const { addBodyweightLog, deleteBodyweightLog } = bodyweightSlice.actions
export const selectBodyweightLogs = (state) => state.bodyweight.logs
export default bodyweightSlice.reducer
