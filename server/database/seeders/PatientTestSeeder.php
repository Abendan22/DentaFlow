<?php

namespace Database\Seeders;

use App\Models\Gender;
use App\Models\Patient;
use Illuminate\Database\Seeder;

class PatientTestSeeder extends Seeder
{
    public const COUNT = 500;

    public function run(): void
    {
        $genderIds = Gender::query()->pluck('id')->all();

        if ($genderIds === []) {
            $this->command?->warn('No genders found. Seed genders first (DatabaseSeeder).');
            return;
        }

        for ($i = 1; $i <= self::COUNT; $i++) {
            fake()->seed(10_000 + $i);
            $num = str_pad((string) $i, 3, '0', STR_PAD_LEFT);
            $email = "patient.test.{$num}@dentaflow.local";

            $firstName = fake()->firstName();
            $lastName = preg_replace('/\d+/', '', (string) fake()->lastName());
            $lastName = trim($lastName ?? '') !== '' ? $lastName : fake()->lastName();

            Patient::updateOrCreate(
                ['email' => $email],
                [
                    'user_id' => null,
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'middle_name' => fake()->optional(0.35)->passthrough(
                        strtoupper(fake()->randomLetter())
                    ),
                    'phone' => '09'.fake()->numerify('#########'),
                    'gender_id' => $genderIds[($i - 1) % count($genderIds)],
                    'birth_date' => fake()->dateTimeBetween('-70 years', '-18 years')->format('Y-m-d'),
                ]
            );
        }

        $this->command?->info('Seeded '.self::COUNT.' test patients.');
    }
}