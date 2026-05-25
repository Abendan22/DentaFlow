<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = $request->query('search');

        $logs = ActivityLog::query()
            ->with('user')
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('activity', 'like', "%{$search}%")
                        ->orWhere('username', 'like', "%{$search}%")
                        ->orWhere('ip_address', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($userQuery) use ($search) {
                            $userQuery->where('username', 'like', "%{$search}%")
                                ->orWhere('first_name', 'like', "%{$search}%")
                                ->orWhere('last_name', 'like', "%{$search}%")
                                ->orWhere('name', 'like', "%{$search}%");
                        });
                });
            })
            ->orderByDesc('logged_at')
            ->orderByDesc('id')
            ->limit(500)
            ->get()
            ->map(fn (ActivityLog $log) => [
                'id' => $log->id,
                'user_id' => $log->user_id,
                'username' => $log->username ?? $log->user?->username ?? '—',
                'user_name' => $log->user?->full_name ?? $log->user?->name ?? '—',
                'role' => $log->user?->role ?? null,
                'activity' => $log->activity,
                'ip_address' => $log->ip_address,
                'timestamp' => $log->logged_at?->toIso8601String(),
            ]);

        return response()->json($logs);
    }
}
