<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('logs', function (Blueprint $table) {
            $table->string('username', 50)->nullable()->after('user_id');
        });

        foreach (DB::table('logs')->whereNotNull('user_id')->get() as $log) {
            $username = DB::table('users')->where('id', $log->user_id)->value('username');
            if ($username) {
                DB::table('logs')->where('id', $log->id)->update(['username' => $username]);
            }
        }
    }

    public function down(): void
    {
        Schema::table('logs', function (Blueprint $table) {
            $table->dropColumn('username');
        });
    }
};
