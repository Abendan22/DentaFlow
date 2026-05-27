<?php

namespace Database\Seeders;

use App\Models\Doctor;
use App\Models\Gender;
use App\Models\Patient;
use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $genders = ['Male', 'Female', 'Prefer not to say'];
        foreach ($genders as $name) {
            Gender::firstOrCreate(['name' => $name]);
        }

        $male = Gender::where('name', 'Male')->first();

        User::updateOrCreate(
            ['username' => 'admin'],
            [
                'name' => 'System Admin',
                'email' => 'admin@dentaflow.local',
                'password' => 'admin123',
                'role' => 'admin',
                'first_name' => 'System',
                'last_name' => 'Admin',
                'gender_id' => $male?->id,
                'birth_date' => '1990-01-01',
            ]
        );

        $demoUser = User::updateOrCreate(
            ['username' => 'user'],
            [
                'name' => 'Demo Patient',
                'email' => 'user@dentaflow.local',
                'password' => 'user123',
                'role' => 'user',
                'first_name' => 'Demo',
                'last_name' => 'Patient',
                'gender_id' => $male?->id,
                'birth_date' => '1998-05-15',
                'phone' => '09170000001',
            ]
        );

        Patient::updateOrCreate(
            ['user_id' => $demoUser->id],
            [
                'first_name' => 'Demo',
                'last_name' => 'Patient',
                'email' => 'user@dentaflow.local',
                'phone' => '09170000001',
                'gender_id' => $male?->id,
                'birth_date' => '1998-05-15',
            ]
        );

        $doctors = [
            ['title' => 'Dr.', 'first_name' => 'Andre', 'last_name' => 'Adams DDS', 'phone' => '09171234501'],
            ['title' => 'Dr.', 'first_name' => 'Mayra', 'last_name' => 'Altenwerth DDS', 'phone' => '09171234502'],
            ['title' => 'Dr.', 'first_name' => 'Alex', 'last_name' => 'Smith DDS', 'phone' => '09171234503'],
        ];

        foreach ($doctors as $row) {
            Doctor::updateOrCreate(
                ['first_name' => $row['first_name'], 'last_name' => $row['last_name']],
                $row
            );
        }

        $this->call(PatientTestSeeder::class);

        $services = [
            ['name' => 'Dental Cleaning', 'description' => 'Routine teeth cleaning and polishing', 'price' => 1500, 'is_active' => true],
            ['name' => 'Tooth Extraction', 'description' => 'Simple tooth removal', 'price' => 2500, 'is_active' => true],
            ['name' => 'Dental Filling', 'description' => 'Cavity restoration', 'price' => 2000, 'is_active' => true],
            ['name' => 'Root Canal', 'description' => 'Endodontic treatment', 'price' => 8000, 'is_active' => true],
            ['name' => 'Teeth Whitening', 'description' => 'Cosmetic whitening session', 'price' => 5000, 'is_active' => false],
        ];

        foreach ($services as $row) {
            Service::updateOrCreate(['name' => $row['name']], $row);
        }
    }
}
