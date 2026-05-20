<?php
/**
 * WorkoutController – Handles workout logging, history, last-week data, and volume stats.
 */
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Exercise;
use App\Models\WorkoutLog;
use App\Models\WorkoutSet;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class WorkoutController extends Controller
{
    /** GET /api/exercises?day_id=N – list exercises for a day */
    public function exercises(Request $request): JsonResponse
    {
        $dayId = $request->query('day_id');
        $query = Exercise::orderBy('day_id')->orderBy('order');
        if ($dayId) $query->where('day_id', $dayId);
        return response()->json(['data' => $query->get()]);
    }

    /** POST /api/workouts – save a completed workout session */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'day_id'                => 'required|integer|between:1,5',
            'exercises'             => 'required|array|min:1',
            'exercises.*.exercise_id' => 'required|integer|exists:exercises,id',
            'exercises.*.sets'      => 'required|array|min:1',
            'exercises.*.sets.*.weight' => 'required|numeric|min:0',
            'exercises.*.sets.*.reps'   => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            $log = WorkoutLog::create([
                'day_id'      => $request->input('day_id'),
                'started_at'  => now(),
                'finished_at' => now(),
            ]);

            foreach ($request->input('exercises') as $exercise) {
                foreach ($exercise['sets'] as $idx => $set) {
                    WorkoutSet::create([
                        'workout_log_id' => $log->id,
                        'exercise_id'    => $exercise['exercise_id'],
                        'set_number'     => $idx + 1,
                        'weight'         => $set['weight'],
                        'reps'           => $set['reps'],
                    ]);
                }
            }

            DB::commit();
            return response()->json(['data' => $log->load('sets'), 'message' => 'Workout saved!'], 201);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to save workout', 'error' => $e->getMessage()], 500);
        }
    }

    /** GET /api/workouts/history – list past workouts with summary stats */
    public function history(): JsonResponse
    {
        $logs = WorkoutLog::latest()
            ->limit(50)
            ->get()
            ->map(function (WorkoutLog $log) {
                $sets = WorkoutSet::where('workout_log_id', $log->id)->get();
                $exerciseGroups = $sets->groupBy('exercise_id');

                $exercises = $exerciseGroups->map(function ($group) {
                    $ex = Exercise::find($group->first()->exercise_id);
                    return [
                        'name'       => $ex?->name ?? 'Unknown',
                        'muscle'     => $ex?->muscle ?? '',
                        'sets_count' => $group->count(),
                    ];
                })->values();

                return [
                    'id'           => $log->id,
                    'day_id'       => $log->day_id,
                    'total_sets'   => $sets->count(),
                    'total_volume' => $sets->sum(fn($s) => $s->weight * $s->reps),
                    'exercises'    => $exercises,
                    'created_at'   => $log->created_at,
                ];
            });

        return response()->json(['data' => $logs]);
    }

    /**
     * GET /api/workouts/last-week/{dayId}
     * Returns the best set (heaviest weight) per exercise from the last session of this day type.
     */
    public function lastWeek(int $dayId): JsonResponse
    {
        $lastLog = WorkoutLog::where('day_id', $dayId)
            ->latest()
            ->first();

        if (!$lastLog) {
            return response()->json(['data' => []]);
        }

        $bestSets = WorkoutSet::where('workout_log_id', $lastLog->id)
            ->select('exercise_id', DB::raw('MAX(weight) as weight'), DB::raw('MAX(reps) as reps'))
            ->groupBy('exercise_id')
            ->get()
            ->keyBy('exercise_id')
            ->map(fn($s) => ['weight' => $s->weight, 'reps' => $s->reps]);

        return response()->json(['data' => $bestSets]);
    }

    /**
     * GET /api/workouts/volume
     * Returns total sets per muscle group for the current week.
     */
    public function volume(): JsonResponse
    {
        $weekStart = Carbon::now()->startOfWeek();

        $volume = WorkoutSet::join('exercises', 'workout_sets.exercise_id', '=', 'exercises.id')
            ->join('workout_logs', 'workout_sets.workout_log_id', '=', 'workout_logs.id')
            ->where('workout_logs.created_at', '>=', $weekStart)
            ->select('exercises.muscle', DB::raw('COUNT(*) as total_sets'))
            ->groupBy('exercises.muscle')
            ->pluck('total_sets', 'muscle');

        return response()->json(['data' => $volume]);
    }
}
