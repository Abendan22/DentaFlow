<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats(Request $request): JsonResponse
    {
        $date = $request->query('date');

        $appointmentQuery = Appointment::query();
        if ($date) {
            $appointmentQuery->whereDate('appointment_date', $date);
        }

        $totalAppointments = (clone $appointmentQuery)->count();
        $totalActiveServices = Service::query()->where('is_active', true)->count();
        $totalDoctors = Doctor::query()->count();
        $totalPatients = Patient::query()->count();
        $totalClinics = 1;

        $visitedQuery = Appointment::query()->where('status', 'completed');
        if ($date) {
            $visitedQuery->whereDate('appointment_date', $date);
        }

        $totalPatientsVisited = (int) (clone $visitedQuery)
            ->select('patient_id')
            ->distinct()
            ->count('patient_id');

        if ($totalPatientsVisited === 0) {
            $anyQuery = Appointment::query();
            if ($date) {
                $anyQuery->whereDate('appointment_date', $date);
            }
            $totalPatientsVisited = (int) (clone $anyQuery)
                ->select('patient_id')
                ->distinct()
                ->count('patient_id');
        }

        return response()->json([
            'total_clinics' => $totalClinics,
            'total_active_services' => $totalActiveServices,
            'total_appointments' => $totalAppointments,
            'total_doctors' => $totalDoctors,
            'total_patients' => $totalPatients,
            'total_patients_visited' => $totalPatientsVisited,
            'patients_by_age' => $this->visitedPatientsByAge($date),
            'filter_date' => $date,
        ]);
    }

    /**
     * @return array<int, array{label: string, count: int}>
     */
    private function visitedPatientsByAge(?string $date): array
    {
        $buckets = [
            ['label' => '0-25 age', 'min' => 0, 'max' => 25],
            ['label' => '26-50 age', 'min' => 26, 'max' => 50],
            ['label' => '50+ age', 'min' => 51, 'max' => 200],
        ];

        $appointmentQuery = Appointment::query();
        if ($date) {
            $appointmentQuery->whereDate('appointment_date', $date);
        }

        $patientIds = $appointmentQuery
            ->where('status', 'completed')
            ->distinct()
            ->pluck('patient_id');

        if ($patientIds->isEmpty()) {
            $patientIds = $appointmentQuery->distinct()->pluck('patient_id');
        }

        $patients = Patient::query()
            ->whereIn('id', $patientIds)
            ->whereNotNull('birth_date')
            ->get(['birth_date']);

        $counts = array_fill(0, count($buckets), 0);

        foreach ($patients as $patient) {
            $age = $patient->birth_date->age;
            foreach ($buckets as $i => $bucket) {
                if ($age >= $bucket['min'] && $age <= $bucket['max']) {
                    $counts[$i]++;
                    break;
                }
            }
        }

        $result = [];
        foreach ($buckets as $i => $bucket) {
            $result[] = [
                'label' => $bucket['label'],
                'count' => $counts[$i],
            ];
        }

        return $result;
    }
}
