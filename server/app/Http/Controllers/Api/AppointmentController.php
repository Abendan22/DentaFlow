<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AppointmentController extends Controller
{
    private const STATUSES = ['pending', 'approved', 'rejected', 'completed', 'cancelled'];

    public function index(Request $request): JsonResponse
    {
        $from = $request->query('from');
        $to = $request->query('to');
        $status = $request->query('status');

        $appointments = Appointment::query()
            ->with([
                'patient:id,first_name,last_name,middle_name',
                'service:id,name',
                'doctor:id,title,first_name,last_name',
            ])
            ->when($from, fn ($q) => $q->whereDate('appointment_date', '>=', $from))
            ->when($to, fn ($q) => $q->whereDate('appointment_date', '<=', $to))
            ->when($status, fn ($q) => $q->where('status', $status))
            ->orderByDesc('appointment_date')
            ->orderBy('appointment_time')
            ->limit(500)
            ->get()
            ->map(fn (Appointment $a) => $this->formatAppointment($a));

        return response()->json($appointments);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'patient_id' => ['required', 'exists:patients,id'],
            'service_id' => ['nullable', 'exists:services,id'],
            'doctor_id' => ['nullable', 'exists:dental_doctors,id'],
            'appointment_date' => ['required', 'date'],
            'appointment_time' => ['required', 'date_format:H:i'],
            'status' => ['nullable', Rule::in(self::STATUSES)],
            'notes' => ['nullable', 'string'],
        ]);

        $appointment = Appointment::create([
            'patient_id' => $data['patient_id'],
            'service_id' => $data['service_id'] ?? null,
            'dental_doctor_id' => $data['doctor_id'] ?? null,
            'appointment_date' => $data['appointment_date'],
            'appointment_time' => $data['appointment_time'],
            'status' => $data['status'] ?? 'approved',
            'source' => 'clinic',
            'notes' => $data['notes'] ?? null,
        ]);

        return response()->json(
            $this->formatAppointment($appointment->load(['patient', 'service', 'doctor'])),
            201
        );
    }

    public function update(Request $request, Appointment $appointment): JsonResponse
    {
        $data = $request->validate([
            'patient_id' => ['sometimes', 'exists:patients,id'],
            'service_id' => ['nullable', 'exists:services,id'],
            'doctor_id' => ['nullable', 'exists:dental_doctors,id'],
            'appointment_date' => ['sometimes', 'date'],
            'appointment_time' => ['sometimes', 'date_format:H:i'],
            'status' => ['nullable', Rule::in(self::STATUSES)],
            'notes' => ['nullable', 'string'],
        ]);

        $payload = collect($data)->except('doctor_id')->toArray();
        if (array_key_exists('doctor_id', $data)) {
            $payload['dental_doctor_id'] = $data['doctor_id'];
        }

        $appointment->update($payload);

        return response()->json(
            $this->formatAppointment($appointment->load(['patient', 'service', 'doctor']))
        );
    }

    public function approve(Appointment $appointment): JsonResponse
    {
        $data = request()->validate([
            'doctor_id' => ['nullable', 'exists:dental_doctors,id'],
        ]);

        $appointment->update([
            'status' => 'approved',
            'dental_doctor_id' => $data['doctor_id'] ?? $appointment->dental_doctor_id,
        ]);

        return response()->json([
            'message' => 'Appointment approved.',
            'appointment' => $this->formatAppointment($appointment->load(['patient', 'service', 'doctor'])),
        ]);
    }

    public function reject(Appointment $appointment): JsonResponse
    {
        $appointment->update(['status' => 'rejected']);

        return response()->json([
            'message' => 'Appointment rejected.',
            'appointment' => $this->formatAppointment($appointment->load(['patient', 'service', 'doctor'])),
        ]);
    }

    public function destroy(Appointment $appointment): JsonResponse
    {
        $appointment->delete();

        return response()->json(['message' => 'Appointment deleted.']);
    }

    private function formatAppointment(Appointment $appointment): array
    {
        $time = $appointment->appointment_time;
        if (is_string($time) && strlen($time) > 5) {
            $time = substr($time, 0, 5);
        }

        return [
            'id' => $appointment->id,
            'patient_id' => $appointment->patient_id,
            'patient_name' => $appointment->patient?->full_name,
            'service_id' => $appointment->service_id,
            'service_name' => $appointment->service?->name,
            'doctor_id' => $appointment->dental_doctor_id,
            'doctor_name' => $appointment->doctor?->full_name,
            'appointment_date' => $appointment->appointment_date->format('Y-m-d'),
            'appointment_time' => $time,
            'status' => $appointment->status,
            'source' => $appointment->source,
            'notes' => $appointment->notes,
        ];
    }
}
