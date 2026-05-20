/**
 * 5-Day Workout Program — PPL / PP Bodybuilding Split.
 * Structured for optimized volume distribution, recovery, and hypertrophy.
 * Calves are trained 3x: Push 1, Legs, and Pull 2.
 */
export const PROGRAM = [
  {
    id: 1,
    name: 'Push 1',
    subtitle: 'Chest dominant · Side Delts · Triceps · Calves',
    emoji: '🔥',
    muscles: ['Chest', 'Shoulders', 'Triceps', 'Calves'],
    exercises: [
      { id: 101, name: 'Flat Barbell Bench Press',   sets: 4, reps: '8-10',  muscle: 'Chest', type: 'compound' },
      { id: 102, name: 'Incline Dumbbell Press',     sets: 3, reps: '10-12', muscle: 'Chest', type: 'compound' },
      { id: 103, name: 'Seated Overhead Press',      sets: 3, reps: '8-10',  muscle: 'Shoulders', type: 'compound' },
      { id: 104, name: 'Dumbbell Lateral Raises',    sets: 4, reps: '12-15', muscle: 'Shoulders', type: 'isolation' },
      { id: 105, name: 'Tricep Rope Pushdown',       sets: 3, reps: '12-15', muscle: 'Triceps', type: 'isolation' },
      { id: 106, name: 'Standing Calf Raise',        sets: 4, reps: '12-15', muscle: 'Calves', type: 'isolation' },
    ],
  },
  {
    id: 2,
    name: 'Pull',
    subtitle: 'Lat dominant · Rear Delts · Biceps',
    emoji: '💪',
    muscles: ['Back', 'Shoulders', 'Biceps'],
    exercises: [
      { id: 201, name: 'Barbell Bent-Over Row',      sets: 4, reps: '8-10',  muscle: 'Back', type: 'compound' },
      { id: 202, name: 'Lat Pulldown (Wide Grip)',   sets: 3, reps: '10-12', muscle: 'Back', type: 'compound' },
      { id: 203, name: 'Seated Cable Row',           sets: 3, reps: '10-12', muscle: 'Back', type: 'compound' },
      { id: 204, name: 'Face Pulls',                 sets: 3, reps: '12-15', muscle: 'Shoulders', type: 'isolation' },
      { id: 205, name: 'Barbell Bicep Curl',         sets: 3, reps: '10-12', muscle: 'Biceps', type: 'isolation' },
      { id: 206, name: 'Incline Hammer Curls',       sets: 3, reps: '10-12', muscle: 'Biceps', type: 'isolation' },
    ],
  },
  {
    id: 3,
    name: 'Legs',
    subtitle: 'Quads dominant · Hamstrings · Glutes · Calves',
    emoji: '🦵',
    muscles: ['Quads', 'Hamstrings', 'Glutes', 'Calves'],
    exercises: [
      { id: 301, name: 'Leg Press',                  sets: 4, reps: '10-12', muscle: 'Quads', type: 'compound' },
      { id: 302, name: 'Lying Leg Curl',             sets: 4, reps: '10-12', muscle: 'Hamstrings', type: 'isolation' },
      { id: 303, name: 'Leg Extension',              sets: 3, reps: '12-15', muscle: 'Quads', type: 'isolation' },
      { id: 304, name: 'Romanian Deadlift (Light)',  sets: 3, reps: '10-12', muscle: 'Hamstrings', type: 'compound' },
      { id: 305, name: 'Seated Calf Raise',          sets: 4, reps: '12-15', muscle: 'Calves', type: 'isolation' },
    ],
  },
  {
    id: 4,
    name: 'Push 2',
    subtitle: 'Shoulders dominant · Upper Chest · Triceps',
    emoji: '⚡',
    muscles: ['Chest', 'Shoulders', 'Triceps'],
    exercises: [
      { id: 401, name: 'Incline Barbell Press',      sets: 4, reps: '8-10',  muscle: 'Chest', type: 'compound' },
      { id: 402, name: 'Dumbbell Flat Press',        sets: 3, reps: '10-12', muscle: 'Chest', type: 'compound' },
      { id: 403, name: 'Arnold Press',               sets: 3, reps: '10-12', muscle: 'Shoulders', type: 'compound' },
      { id: 404, name: 'Cable Lateral Raise',        sets: 4, reps: '12-15', muscle: 'Shoulders', type: 'isolation' },
      { id: 405, name: 'Pec Deck Flyes',             sets: 3, reps: '12-15', muscle: 'Chest', type: 'isolation' },
      { id: 406, name: 'Overhead Tricep Extension',   sets: 3, reps: '10-12', muscle: 'Triceps', type: 'isolation' },
    ],
  },
  {
    id: 5,
    name: 'Pull 2',
    subtitle: 'Upper Back dominant · Width · Biceps · Calves',
    emoji: '🏋️',
    muscles: ['Back', 'Shoulders', 'Biceps', 'Calves'],
    exercises: [
      { id: 501, name: 'Lat Pulldown (Neutral Grip)', sets: 4, reps: '8-10',  muscle: 'Back', type: 'compound' },
      { id: 502, name: 'Single-Arm Dumbbell Row',    sets: 3, reps: '10-12', muscle: 'Back', type: 'compound' },
      { id: 503, name: 'Rear Delt Fly (Machine)',    sets: 3, reps: '12-15', muscle: 'Shoulders', type: 'isolation' },
      { id: 504, name: 'Incline Dumbbell Curl',      sets: 3, reps: '10-12', muscle: 'Biceps', type: 'isolation' },
      { id: 505, name: 'Cable Bicep Curl',           sets: 3, reps: '12-15', muscle: 'Biceps', type: 'isolation' },
      { id: 506, name: 'Calf Press on Leg Press',    sets: 4, reps: '12-15', muscle: 'Calves', type: 'isolation' },
    ],
  },
]

/** Get a flat list of all unique muscle groups */
export const ALL_MUSCLES = [...new Set(PROGRAM.flatMap((d) => d.exercises.map((e) => e.muscle)))]
