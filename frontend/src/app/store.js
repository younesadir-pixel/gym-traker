import { configureStore } from '@reduxjs/toolkit'
import workoutReducer from '../features/workout/workoutSlice'
import timerReducer from '../features/timer/timerSlice'
import historyReducer from '../features/history/historySlice'
import bodyweightReducer from '../features/bodyweight/bodyweightSlice'

export const store = configureStore({
  reducer: {
    workout: workoutReducer,
    timer: timerReducer,
    history: historyReducer,
    bodyweight: bodyweightReducer,
  },
})
