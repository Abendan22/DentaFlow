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
            $table->dropForeign(['dentist_id']);
        });

        Schema::rename('dentists', 'doctors');

        DB::statement('ALTER TABLE appointments CHANGE dentist_id doctor_id BIGINT UNSIGNED NULL');

        Schema::table('appointments', function (Blueprint $table) {
            $table->foreign('doctor_id')->references('id')->on('doctors')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropForeign(['doctor_id']);
        });

        DB::statement('ALTER TABLE appointments CHANGE doctor_id dentist_id BIGINT UNSIGNED NULL');

        Schema::rename('doctors', 'dentists');

        Schema::table('appointments', function (Blueprint $table) {
            $table->foreign('dentist_id')->references('id')->on('dentists')->nullOnDelete();
        });
    }
};
