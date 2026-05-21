<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropForeign(['doctor_id']);
        });

        Schema::rename('doctors', 'dental_doctors');

        DB::statement('ALTER TABLE appointments CHANGE doctor_id dental_doctor_id BIGINT UNSIGNED NULL');

        Schema::table('appointments', function (Blueprint $table) {
            $table->foreign('dental_doctor_id')->references('id')->on('dental_doctors')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropForeign(['dental_doctor_id']);
        });

        DB::statement('ALTER TABLE appointments CHANGE dental_doctor_id doctor_id BIGINT UNSIGNED NULL');

        Schema::rename('dental_doctors', 'doctors');

        Schema::table('appointments', function (Blueprint $table) {
            $table->foreign('doctor_id')->references('id')->on('doctors')->nullOnDelete();
        });
    }
};
