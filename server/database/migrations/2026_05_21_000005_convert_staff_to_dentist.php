<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('users')->where('role', 'staff')->update(['role' => 'dentist']);
    }

    public function down(): void
    {
        DB::table('users')->where('role', 'dentist')->update(['role' => 'staff']);
    }
};
