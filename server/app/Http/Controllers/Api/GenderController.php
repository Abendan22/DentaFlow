<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Gender;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GenderController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Gender::orderBy('name')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:genders,name'],
        ]);

        $gender = Gender::create($data);

        return response()->json($gender, 201);
    }

    public function update(Request $request, Gender $gender): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:genders,name,'.$gender->id],
        ]);

        $gender->update($data);

        return response()->json($gender);
    }

    public function destroy(Gender $gender): JsonResponse
    {
        $gender->delete();

        return response()->json(['message' => 'Gender deleted.']);
    }
}
