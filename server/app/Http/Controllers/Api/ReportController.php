<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Patient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function appointments(Request $request): JsonResponse
    {
        $from = $request->query('from', now()->startOfMonth()->toDateString());
        $to = $request->query('to', now()->endOfMonth()->toDateString());
        $status = $request->query('status');

        $query = Appointment::with([
            'patient:id,first_name,last_name,middle_name',
            'doctor:id,title,first_name,last_name',
        ])
            ->whereDate('appointment_date', '>=', $from)
            ->whereDate('appointment_date', '<=', $to);

        if ($status) {
            $query->where('status', $status);
        }

        $records = $query
            ->orderBy('appointment_date')
            ->orderBy('appointment_time')
            ->get();

        $summary = [
            'total' => $records->count(),
            'scheduled' => $records->where('status', 'scheduled')->count(),
            'completed' => $records->where('status', 'completed')->count(),
            'cancelled' => $records->where('status', 'cancelled')->count(),
        ];

        $appointments = $records->map(function (Appointment $a) {
            $time = $a->appointment_time;
            if (is_string($time) && strlen($time) > 5) {
                $time = substr($time, 0, 5);
            }

            return [
                'date' => $a->appointment_date->format('Y-m-d'),
                'time' => $time,
                'patient' => $a->patient?->full_name,
                'dentist' => $a->doctor?->full_name ?? '—',
                'status' => ucfirst($a->status),
                'notes' => $a->notes ?? '',
            ];
        });

        return response()->json([
            'title' => 'Appointment Report',
            'from' => $from,
            'to' => $to,
            'generated_at' => now()->format('Y-m-d H:i'),
            'summary' => $summary,
            'rows' => $appointments,
        ]);
    }

    public function patients(): JsonResponse
    {
        $patients = Patient::query()
            ->with('gender')
            ->orderBy('last_name')
            ->get()
            ->map(fn (Patient $patient) => [
                'full_name' => $patient->full_name,
                'gender' => $patient->gender?->name ?? '—',
                'birth_date' => $patient->birth_date?->format('Y-m-d') ?? '—',
                'age' => $patient->age ?? '—',
                'phone' => $patient->phone ?? '—',
                'email' => $patient->email ?? '—',
            ]);

        return response()->json([
            'title' => 'Patient Record Report',
            'generated_at' => now()->format('Y-m-d H:i'),
            'summary' => ['total' => $patients->count()],
            'rows' => $patients,
        ]);
    }
}
