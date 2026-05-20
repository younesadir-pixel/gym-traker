<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class WorkoutSet extends Model {
    protected $fillable = ['workout_log_id', 'exercise_id', 'set_number', 'weight', 'reps'];
    protected $casts = ['weight' => 'decimal:2', 'reps' => 'integer', 'set_number' => 'integer'];

    public function workoutLog() { return $this->belongsTo(WorkoutLog::class); }
    public function exercise()   { return $this->belongsTo(Exercise::class); }
}
