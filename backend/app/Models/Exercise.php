<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Exercise extends Model {
    protected $fillable = ['name', 'muscle', 'day_id', 'order', 'default_sets', 'default_reps'];

    public function workoutSets() {
        return $this->hasMany(WorkoutSet::class);
    }
}
