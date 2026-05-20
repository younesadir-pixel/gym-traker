<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        // A single workout session (one day performed on a date)
        Schema::create('workout_logs', function (Blueprint $table) {
            $table->id();
            $table->integer('day_id');           // which program day (1-5)
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->timestamps();
            $table->index(['day_id', 'created_at']);
        });

        // Individual sets performed within a workout log
        Schema::create('workout_sets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workout_log_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('exercise_id');
            $table->integer('set_number');
            $table->decimal('weight', 6, 2)->default(0);  // kg
            $table->integer('reps')->default(0);
            $table->timestamps();
            $table->index(['workout_log_id', 'exercise_id']);
            $table->index(['exercise_id', 'created_at']);
            $table->foreign('exercise_id')->references('id')->on('exercises')->cascadeOnDelete();
        });
    }
    public function down(): void {
        Schema::dropIfExists('workout_sets');
        Schema::dropIfExists('workout_logs');
    }
};
