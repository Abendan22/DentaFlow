<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Patient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerAppointmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var Patient $patient */
        $patient = $request->attributes->get('patient');

        $appointments = Appointment::query()
            ->where('patient_id', $patient->id)
            ->with(['service:id,name', 'doctor:id,title,first_name,last_name'])
            ->orderByDesc('appointment_date')
            ->orderByDesc('appointment_time')
            ->get()
            ->map(fn (Appointment $a) => $this->formatAppointment($a));

        return response()->json($appointments);
    }

    public function store(Request $request): JsonResponse
    {
        /** @var Patient $patient */
        $patient = $request->attributes->get('patient');

        $data = $request->validate([
            'service_id' => ['required', 'exists:services,id'],
            'appointment_date' => ['required', 'date', 'after_or_equal:today'],
            'appointment_time' => ['required', 'date_format:H:i'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $appointment = Appointment::create([
            'patient_id' => $patient->id,
            'service_id' => $data['service_id'],
            'appointment_date' => $data['appointment_date'],
            'appointment_time' => $data['appointment_time'],
            'notes' => $data['notes'] ?? null,
            'status' => 'pending',
            'source' => 'online',
        ]);

        return response()->json(
            $this->formatAppointment($appointment->load(['service:id,name', 'doctor:id,title,first_name,last_name'])),
            201
        );
    }

    private function formatAppointment(Appointment $appointment): array
    {
        $time = $appointment->appointment_time;
        if (is_string($time) && strlen($time) > 5) {
            $time = substr($time, 0, 5);
        }

        return [
            'id' => $appointment->id,
            'service_id' => $appointment->service_id,
            'service_name' => $appointment->service?->name,
            'doctor_name' => $appointment->doctor?->full_name,
            'appointment_date' => $appointment->appointment_date->format('Y-m-d'),
            'appointment_time' => $time,
            'status' => $appointment->status,
            'notes' => $appointment->notes,
            'source' => $appointment->source,
        ];
    }
}
