<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;

class ActivityLogger
{
    public static function record(
        ?User $user,
        string $activity,
        ?Request $request = null,
        ?string $username = null,
    ): ActivityLog {
        $resolvedUsername = $username ?? $user?->username;

        return ActivityLog::create([
            'user_id' => $user?->id,
            'username' => $resolvedUsername,
            'activity' => $activity,
            'ip_address' => $request?->ip(),
            'logged_at' => now(),
        ]);
    }
}
