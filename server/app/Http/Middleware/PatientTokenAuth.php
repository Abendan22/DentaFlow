<?php

namespace App\Http\Middleware;

use App\Models\Patient;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PatientTokenAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (! $token) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $patient = Patient::where('api_token', $token)->first();

        if (! $patient) {
            return response()->json(['message' => 'Invalid token.'], 401);
        }

        $request->attributes->set('patient', $patient);

        return $next($request);
    }
}
