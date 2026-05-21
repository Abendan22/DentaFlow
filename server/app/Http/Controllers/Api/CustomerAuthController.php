<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CustomerAuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'username' => ['required', 'string', 'max:50', 'unique:patients,username'],
            'password' => ['required', 'string', 'min:6'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'gender_id' => ['nullable', 'exists:genders,id'],
            'birth_date' => ['nullable', 'date'],
        ]);

        $patient = Patient::create([
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'username' => $data['username'],
            'password' => Hash::make($data['password']),
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
            'gender_id' => $data['gender_id'] ?? null,
            'birth_date' => $data['birth_date'] ?? null,
            'api_token' => Str::random(80),
        ]);

        return response()->json([
            'token' => $patient->api_token,
            'patient' => $this->formatPatient($patient),
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $patient = Patient::where('username', $data['username'])->first();

        if (! $patient || ! $patient->password || ! Hash::check($data['password'], $patient->password)) {
            return response()->json(['message' => 'Invalid username or password.'], 422);
        }

        $patient->api_token = Str::random(80);
        $patient->save();

        return response()->json([
            'token' => $patient->api_token,
            'patient' => $this->formatPatient($patient),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $patient = $request->attributes->get('patient');

        return response()->json(['patient' => $this->formatPatient($patient)]);
    }

    public function logout(Request $request): JsonResponse
    {
        $patient = $request->attributes->get('patient');
        $patient->update(['api_token' => null]);

        return response()->json(['message' => 'Logged out.']);
    }

    private function formatPatient(Patient $patient): array
    {
        return [
            'id' => $patient->id,
            'username' => $patient->username,
            'first_name' => $patient->first_name,
            'last_name' => $patient->last_name,
            'full_name' => $patient->full_name,
            'email' => $patient->email,
            'phone' => $patient->phone,
        ];
    }
}
