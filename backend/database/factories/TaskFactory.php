<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TaskFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'title' => fake()->sentence(4),
            'description' => fake()->optional(0.7)->paragraph(),
            'due_date' => fake()->optional(0.8)->dateTimeBetween('-5 days', '+30 days'),
            'status' => fake()->randomElement(['pending', 'in_progress', 'completed']),
        ];
    }
}
