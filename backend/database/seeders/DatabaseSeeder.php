<?php
namespace Database\Seeders;

use App\Models\Exercise;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $program = [
            1 => [ // Push
                ['Flat Barbell Bench Press', 'Chest', 4, '8-10'],
                ['Incline Dumbbell Press', 'Chest', 3, '10-12'],
                ['Cable Fly (Low to High)', 'Chest', 3, '12-15'],
                ['Seated Overhead Press', 'Shoulders', 4, '8-10'],
                ['Lateral Raises', 'Shoulders', 3, '12-15'],
                ['Tricep Rope Pushdown', 'Triceps', 3, '12-15'],
                ['Overhead Tricep Extension', 'Triceps', 3, '10-12'],
            ],
            2 => [ // Pull
                ['Barbell Bent-Over Row', 'Back', 4, '8-10'],
                ['Seated Cable Row', 'Back', 3, '10-12'],
                ['T-Bar Row', 'Back', 3, '8-10'],
                ['Lat Pulldown', 'Back', 3, '10-12'],
                ['Face Pulls', 'Back', 3, '15-20'],
                ['Barbell Curl', 'Biceps', 3, '10-12'],
                ['Hammer Curls', 'Biceps', 3, '10-12'],
            ],
            3 => [ // Legs
                ['Leg Press', 'Quads', 4, '10-12'],
                ['Leg Extension', 'Quads', 3, '12-15'],
                ['Walking Lunges (DB)', 'Quads', 3, '12/leg'],
                ['Lying Leg Curl', 'Hamstrings', 4, '10-12'],
                ['Romanian DL (Light)', 'Hamstrings', 3, '10-12'],
                ['Hip Thrust (Machine)', 'Glutes', 3, '10-12'],
            ],
            4 => [ // Upper Hypertrophy
                ['Dumbbell Bench Press', 'Chest', 4, '10-12'],
                ['Pec Deck Machine', 'Chest', 3, '12-15'],
                ['Arnold Press', 'Shoulders', 3, '10-12'],
                ['Cable Lateral Raise', 'Shoulders', 3, '12-15'],
                ['Rear Delt Fly (Machine)', 'Shoulders', 3, '12-15'],
                ['Chest-Supported Row', 'Back', 4, '10-12'],
                ['Single-Arm DB Row', 'Back', 3, '10-12'],
            ],
            5 => [ // Lower + Core
                ['Hack Squat (Machine)', 'Quads', 4, '10-12'],
                ['Bulgarian Split Squat', 'Quads', 3, '10/leg'],
                ['Seated Leg Curl', 'Hamstrings', 3, '12-15'],
                ['Standing Calf Raise', 'Calves', 4, '15-20'],
                ['Seated Calf Raise', 'Calves', 3, '15-20'],
                ['Cable Crunch', 'Abs', 3, '15-20'],
                ['Hanging Leg Raise', 'Abs', 3, '12-15'],
            ],
        ];

        foreach ($program as $dayId => $exercises) {
            foreach ($exercises as $order => [$name, $muscle, $sets, $reps]) {
                Exercise::create([
                    'name'         => $name,
                    'muscle'       => $muscle,
                    'day_id'       => $dayId,
                    'order'        => $order + 1,
                    'default_sets' => $sets,
                    'default_reps' => $reps,
                ]);
            }
        }

        $this->command->info('✅ 5-day workout program seeded with ' . Exercise::count() . ' exercises.');
    }
}
