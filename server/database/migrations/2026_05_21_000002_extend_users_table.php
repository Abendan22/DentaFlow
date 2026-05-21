<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->nullable()->unique()->after('id');
            $table->string('role')->default('staff')->after('password');
            $table->string('first_name')->nullable()->after('role');
            $table->string('last_name')->nullable()->after('first_name');
            $table->string('middle_name')->nullable()->after('last_name');
            $table->foreignId('gender_id')->nullable()->constrained('genders')->nullOnDelete();
            $table->date('birth_date')->nullable();
            $table->string('phone')->nullable();
            $table->string('api_token', 80)->nullable()->unique();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['gender_id']);
            $table->dropColumn([
                'username', 'role', 'first_name', 'last_name', 'middle_name',
                'gender_id', 'birth_date', 'phone', 'api_token',
            ]);
        });
    }
};
