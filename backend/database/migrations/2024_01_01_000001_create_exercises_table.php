<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('exercises', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('muscle');        // e.g. Chest, Back, Quads
            $table->integer('day_id');       // 1-5 mapping to the 5-day split
            $table->integer('order');        // display order within the day
            $table->integer('default_sets')->default(3);
            $table->string('default_reps')->default('10-12'); // text like "8-10"
            $table->timestamps();
            $table->index(['day_id', 'order']);
        });
    }
    public function down(): void { Schema::dropIfExists('exercises'); }
};
