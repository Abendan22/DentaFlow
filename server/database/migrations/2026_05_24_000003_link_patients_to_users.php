<?php

use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->unique()->after('id')->constrained('users')->nullOnDelete();
        });

        foreach (Patient::query()->whereNotNull('username')->whereNotNull('password')->get() as $patient) {
            $existingUser = User::where('username', $patient->username)->first();

            if ($existingUser) {
                $patient->update(['user_id' => $existingUser->id]);

                continue;
            }

            $userId = DB::table('users')->insertGetId([
                'username' => $patient->username,
                'name' => trim("{$patient->first_name} {$patient->last_name}"),
                'email' => $patient->email,
                'password' => $patient->password,
                'role' => 'user',
                'first_name' => $patient->first_name,
                'last_name' => $patient->last_name,
                'middle_name' => $patient->middle_name,
                'gender_id' => $patient->gender_id,
                'birth_date' => $patient->birth_date,
                'phone' => $patient->phone,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $patient->update(['user_id' => $userId]);
        }
    }

    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
        });
    }
};
