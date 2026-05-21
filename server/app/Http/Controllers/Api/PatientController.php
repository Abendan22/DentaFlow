<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PatientController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = $request->query('search');

        $patients = Patient::query()
            ->with('gender:id,name')
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get()
            ->map(fn (Patient $patient) => $this->formatPatient($patient));

        return response()->json($patients);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'middle_name' => ['nullable', 'string', 'max:100'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'gender_id' => ['nullable', 'exists:genders,id'],
            'birth_date' => ['nullable', 'date'],
            'photo' => ['nullable', 'image', 'max:2048'],
        ]);

        $patient = Patient::create([
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'middle_name' => $data['middle_name'] ?? null,
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
            'gender_id' => $data['gender_id'] ?? null,
            'birth_date' => $data['birth_date'] ?? null,
            'photo' => $this->storePhoto($request),
        ]);

        return response()->json($this->formatPatient($patient->load('gender')), 201);
    }

    public function update(Request $request, Patient $patient): JsonResponse
    {
        $data = $request->validate([
            'first_name' => ['sometimes', 'string', 'max:100'],
            'last_name' => ['sometimes', 'string', 'max:100'],
            'middle_name' => ['nullable', 'string', 'max:100'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'gender_id' => ['nullable', 'exists:genders,id'],
            'birth_date' => ['nullable', 'date'],
            'photo' => ['nullable', 'image', 'max:2048'],
            'remove_photo' => ['nullable', 'boolean'],
        ]);

        if ($request->boolean('remove_photo') && $patient->photo) {
            Storage::disk('public')->delete($patient->photo);
            $patient->photo = null;
        }

        if ($request->hasFile('photo')) {
            if ($patient->photo) {
                Storage::disk('public')->delete($patient->photo);
            }
            $patient->photo = $this->storePhoto($request);
        }

        $patient->fill(collect($data)->except(['photo', 'remove_photo'])->toArray());
        $patient->save();

        return response()->json($this->formatPatient($patient->load('gender')));
    }

    public function destroy(Patient $patient): JsonResponse
    {
        $patient->delete();

        return response()->json([
            'message' => 'Patient record removed from the list. The record is kept in the database.',
        ]);
    }

    public function options(): JsonResponse
    {
        $patients = Patient::query()
            ->orderBy('last_name')
            ->get(['id', 'first_name', 'last_name', 'middle_name'])
            ->map(fn (Patient $patient) => [
                'id' => $patient->id,
                'full_name' => $patient->full_name,
            ]);

        return response()->json($patients);
    }

    private function storePhoto(Request $request): ?string
    {
        if (! $request->hasFile('photo')) {
            return null;
        }

        return $request->file('photo')->store('photos', 'public');
    }

    private function formatPatient(Patient $patient): array
    {
        return [
            'id' => $patient->id,
            'role' => 'patient',
            'first_name' => $patient->first_name,
            'last_name' => $patient->last_name,
            'middle_name' => $patient->middle_name,
            'full_name' => $patient->full_name,
            'initials' => $patient->initials,
            'photo' => $patient->photo,
            'photo_url' => $patient->photo_url,
            'email' => $patient->email,
            'phone' => $patient->phone,
            'birth_date' => $patient->birth_date?->format('Y-m-d'),
            'age' => $patient->age,
            'gender_id' => $patient->gender_id,
            'gender' => $patient->gender?->name,
        ];
    }
}
