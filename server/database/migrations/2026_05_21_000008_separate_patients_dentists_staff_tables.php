<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('middle_name')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->foreignId('gender_id')->nullable()->constrained('genders')->nullOnDelete();
            $table->date('birth_date')->nullable();
            $table->string('photo')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('dentists', function (Blueprint $table) {
            $table->id();
            $table->string('title', 20)->nullable();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('phone')->nullable();
            $table->string('photo')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('staff', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('middle_name')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->foreignId('gender_id')->nullable()->constrained('genders')->nullOnDelete();
            $table->string('photo')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        foreach (DB::table('users')->where('role', 'patient')->get() as $row) {
            DB::table('patients')->insert([
                'id' => $row->id,
                'first_name' => $row->first_name ?? '',
                'last_name' => $row->last_name ?? '',
                'middle_name' => $row->middle_name,
                'email' => $row->email,
                'phone' => $row->phone,
                'gender_id' => $row->gender_id,
                'birth_date' => $row->birth_date,
                'photo' => $row->photo,
                'created_at' => $row->created_at,
                'updated_at' => $row->updated_at,
                'deleted_at' => $row->deleted_at,
            ]);
        }

        foreach (DB::table('users')->where('role', 'dentist')->get() as $row) {
            DB::table('dentists')->insert([
                'id' => $row->id,
                'title' => $row->title,
                'first_name' => $row->first_name ?? '',
                'last_name' => $row->last_name ?? '',
                'phone' => $row->phone,
                'photo' => $row->photo,
                'created_at' => $row->created_at,
                'updated_at' => $row->updated_at,
                'deleted_at' => $row->deleted_at,
            ]);
        }

        foreach (DB::table('users')->where('role', 'staff')->get() as $row) {
            DB::table('staff')->insert([
                'id' => $row->id,
                'first_name' => $row->first_name ?? '',
                'last_name' => $row->last_name ?? '',
                'middle_name' => $row->middle_name,
                'email' => $row->email,
                'phone' => $row->phone,
                'gender_id' => $row->gender_id,
                'photo' => $row->photo,
                'created_at' => $row->created_at,
                'updated_at' => $row->updated_at,
                'deleted_at' => $row->deleted_at,
            ]);
        }

        Schema::table('appointments', function (Blueprint $table) {
            $table->foreignId('patient_id')->nullable()->after('id')->constrained('patients')->nullOnDelete();
            $table->foreignId('dentist_id')->nullable()->after('patient_id')->constrained('dentists')->nullOnDelete();
        });

        foreach (DB::table('appointments')->get() as $appointment) {
            DB::table('appointments')
                ->where('id', $appointment->id)
                ->update([
                    'patient_id' => $appointment->customer_id,
                    'dentist_id' => $appointment->staff_id,
                ]);
        }

        Schema::table('appointments', function (Blueprint $table) {
            $table->dropForeign(['customer_id']);
            $table->dropForeign(['staff_id']);
            $table->dropColumn(['customer_id', 'staff_id']);
        });

        DB::table('users')->whereIn('role', ['patient', 'dentist', 'staff', 'customer'])->delete();
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->foreignId('customer_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->foreignId('staff_id')->nullable()->constrained('users')->nullOnDelete();
        });

        foreach (DB::table('appointments')->get() as $appointment) {
            DB::table('appointments')
                ->where('id', $appointment->id)
                ->update([
                    'customer_id' => $appointment->patient_id,
                    'staff_id' => $appointment->dentist_id,
                ]);
        }

        Schema::table('appointments', function (Blueprint $table) {
            $table->dropForeign(['patient_id']);
            $table->dropForeign(['dentist_id']);
            $table->dropColumn(['patient_id', 'dentist_id']);
        });

        Schema::dropIfExists('staff');
        Schema::dropIfExists('dentists');
        Schema::dropIfExists('patients');
    }
};
