<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->string('username')->nullable()->unique()->after('id');
            $table->string('password')->nullable()->after('username');
            $table->string('api_token', 80)->nullable()->unique()->after('password');
        });

        Schema::table('appointments', function (Blueprint $table) {
            $table->foreignId('service_id')->nullable()->after('patient_id')->constrained('services')->nullOnDelete();
            $table->string('source', 20)->default('clinic')->after('status');
        });

        DB::table('appointments')->where('status', 'scheduled')->update(['status' => 'approved']);
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropForeign(['service_id']);
            $table->dropColumn(['service_id', 'source']);
        });

        Schema::table('patients', function (Blueprint $table) {
            $table->dropColumn(['username', 'password', 'api_token']);
        });
    }
};
