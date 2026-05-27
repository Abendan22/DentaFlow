<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CustomerAuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'username' => ['required', 'string', 'max:50', 'unique:users,username'],
            'password' => ['required', 'string', 'min:6'],
            'email' => ['nullable', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:30'],
            'gender_id' => ['nullable', 'exists:genders,id'],
            'birth_date' => ['nullable', 'date'],
        ]);

        $result = DB::transaction(function () use ($data) {
            $user = User::create([
                'username' => $data['username'],
                'name' => trim("{$data['first_name']} {$data['last_name']}"),
                'email' => $data['email'] ?? null,
                'password' => $data['password'],
                'role' => 'user',
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'gender_id' => $data['gender_id'] ?? null,
                'birth_date' => $data['birth_date'] ?? null,
                'phone' => $data['phone'] ?? null,
                'api_token' => Str::random(80),
            ]);

            $patient = Patient::create([
                'user_id' => $user->id,
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'email' => $data['email'] ?? null,
                'phone' => $data['phone'] ?? null,
                'gender_id' => $data['gender_id'] ?? null,
                'birth_date' => $data['birth_date'] ?? null,
            ]);

            return [$user, $patient];
        });

        [$user, $patient] = $result;

        ActivityLogger::record($user, 'User registered', $request, $data['username']);

        return response()->json([
            'token' => $user->api_token,
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'role' => $user->role,
                'full_name' => $user->full_name,
            ],
            'patient' => $this->formatPatient($patient),
        ], 201);
    }

    public function me(Request $request): JsonResponse
    {
        $patient = $request->attributes->get('patient');

        return response()->json(['patient' => $this->formatPatient($patient)]);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        ActivityLogger::record($user, 'Logged out', $request, $user->username);
        $user->update(['api_token' => null]);

        return response()->json(['message' => 'Logged out.']);
    }

    private function formatPatient(Patient $patient): array
    {
        return [
            'id' => $patient->id,
            'username' => $patient->user?->username,
            'first_name' => $patient->first_name,
            'last_name' => $patient->last_name,
            'full_name' => $patient->full_name,
            'email' => $patient->email,
            'phone' => $patient->phone,
        ];
    }
}
