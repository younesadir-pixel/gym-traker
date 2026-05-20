<?php
use App\Http\Controllers\Api\WorkoutController;
use Illuminate\Support\Facades\Route;

Route::get('/exercises',             [WorkoutController::class, 'exercises']);
Route::post('/workouts',             [WorkoutController::class, 'store']);
Route::get('/workouts/history',      [WorkoutController::class, 'history']);
Route::get('/workouts/last-week/{dayId}', [WorkoutController::class, 'lastWeek']);
Route::get('/workouts/volume',       [WorkoutController::class, 'volume']);
