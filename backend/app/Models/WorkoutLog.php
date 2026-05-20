<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class WorkoutLog extends Model {
    protected $fillable = ['day_id', 'started_at', 'finished_at'];
    protected $casts = ['started_at' => 'datetime', 'finished_at' => 'datetime'];

    public function sets() {
        return $this->hasMany(WorkoutSet::class);
    }
}
