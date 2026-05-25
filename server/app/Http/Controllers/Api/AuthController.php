<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('username', $data['username'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            ActivityLogger::record(
                $user,
                'Failed login attempt',
                $request,
                $data['username'],
            );

            return response()->json(['message' => 'Invalid username or password.'], 422);
        }

        if (! in_array($user->role, ['admin', 'user'], true)) {
            ActivityLogger::record(
                $user,
                'Login denied — invalid role: '.$user->role,
                $request,
                $data['username'],
            );

            return response()->json(['message' => 'This account cannot sign in here.'], 403);
        }

        $user->api_token = Str::random(80);
        $user->save();

        ActivityLogger::record($user, 'Logged in', $request, $data['username']);

        $payload = [
            'token' => $user->api_token,
            'user' => $this->formatUser($user->load('gender')),
        ];

        if ($user->role === 'user') {
            $patient = Patient::where('user_id', $user->id)->first();

            if (! $patient) {
                return response()->json(['message' => 'Patient profile not found for this account.'], 403);
            }

            $payload['patient'] = $this->formatPatient($patient);
        }

        return response()->json($payload);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('gender');

        $payload = ['user' => $this->formatUser($user)];

        if ($user->role === 'user') {
            $patient = Patient::where('user_id', $user->id)->first();
            if ($patient) {
                $payload['patient'] = $this->formatPatient($patient);
            }
        }

        return response()->json($payload);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        ActivityLogger::record($user, 'Logged out', $request, $user->username);
        $user->update(['api_token' => null]);

        return response()->json(['message' => 'Logged out.']);
    }

    private function formatUser(User $user): array
    {
        return [
            'id' => $user->id,
            'username' => $user->username,
            'role' => $user->role,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'middle_name' => $user->middle_name,
            'full_name' => $user->full_name,
            'initials' => $user->initials,
            'email' => $user->email,
            'phone' => $user->phone,
            'birth_date' => $user->birth_date?->format('Y-m-d'),
            'age' => $user->age,
            'gender_id' => $user->gender_id,
            'gender' => $user->gender?->name,
        ];
    }

    private function formatPatient(Patient $patient): array
    {
        return [
            'id' => $patient->id,
            'username' => $patient->user?->username ?? $patient->username,
            'first_name' => $patient->first_name,
            'last_name' => $patient->last_name,
            'full_name' => $patient->full_name,
            'email' => $patient->email,
            'phone' => $patient->phone,
        ];
    }
}
