<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
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
            return response()->json(['message' => 'Invalid username or password.'], 422);
        }

        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Admin access only.'], 403);
        }

        $user->api_token = Str::random(80);
        $user->save();

        return response()->json([
            'token' => $user->api_token,
            'user' => $this->formatUser($user->load('gender')),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $this->formatUser($request->user()->load('gender')),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->update(['api_token' => null]);

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
}
