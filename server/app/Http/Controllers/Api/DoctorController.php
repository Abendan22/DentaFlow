<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class DoctorController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = $request->query('search');

        $doctors = Doctor::query()
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
            ->map(fn (Doctor $doctor) => $this->formatDoctor($doctor));

        return response()->json($doctors);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['nullable', 'string', 'max:20'],
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'suffix' => ['nullable', Rule::in(['DDS', 'DMD', ''])],
            'phone' => ['nullable', 'string', 'max:30'],
            'photo' => ['nullable', 'image', 'max:2048'],
        ]);

        $title = $this->normalizeTitle($data['title'] ?? 'Dr.');
        $lastName = $this->buildLastName($data['last_name'], $data['suffix'] ?? 'DDS');

        $doctor = Doctor::create([
            'title' => $title,
            'first_name' => $data['first_name'],
            'last_name' => $lastName,
            'phone' => $data['phone'] ?? null,
            'photo' => $this->storePhoto($request),
        ]);

        return response()->json($this->formatDoctor($doctor), 201);
    }

    public function update(Request $request, Doctor $doctor): JsonResponse
    {
        $data = $request->validate([
            'title' => ['nullable', 'string', 'max:20'],
            'first_name' => ['sometimes', 'string', 'max:100'],
            'last_name' => ['sometimes', 'string', 'max:100'],
            'suffix' => ['nullable', Rule::in(['DDS', 'DMD', ''])],
            'phone' => ['nullable', 'string', 'max:30'],
            'photo' => ['nullable', 'image', 'max:2048'],
            'remove_photo' => ['nullable', 'boolean'],
        ]);

        if ($request->boolean('remove_photo') && $doctor->photo) {
            Storage::disk('public')->delete($doctor->photo);
            $doctor->photo = null;
        }

        if ($request->hasFile('photo')) {
            if ($doctor->photo) {
                Storage::disk('public')->delete($doctor->photo);
            }
            $doctor->photo = $this->storePhoto($request);
        }

        if (isset($data['title'])) {
            $doctor->title = $this->normalizeTitle($data['title']);
        }

        if (isset($data['first_name'])) {
            $doctor->first_name = $data['first_name'];
        }

        if (isset($data['last_name']) || isset($data['suffix'])) {
            $baseLast = $data['last_name'] ?? preg_replace('/\s+(DDS|DMD)$/i', '', $doctor->last_name);
            $doctor->last_name = $this->buildLastName($baseLast, $data['suffix'] ?? $this->extractSuffix($doctor->last_name));
        }

        if (isset($data['phone'])) {
            $doctor->phone = $data['phone'];
        }

        $doctor->save();

        return response()->json($this->formatDoctor($doctor));
    }

    public function destroy(Doctor $doctor): JsonResponse
    {
        $doctor->delete();

        return response()->json([
            'message' => 'Doctor record removed from the list. The record is kept in the database.',
        ]);
    }

    public function options(): JsonResponse
    {
        $doctors = Doctor::query()
            ->orderBy('last_name')
            ->get(['id', 'first_name', 'last_name', 'title'])
            ->map(fn (Doctor $doctor) => [
                'id' => $doctor->id,
                'full_name' => $doctor->full_name,
            ]);

        return response()->json($doctors);
    }

    private function normalizeTitle(?string $title): string
    {
        $title = trim($title ?? 'Dr.');
        if ($title === '') {
            return 'Dr.';
        }

        return rtrim($title, '.').'.';
    }

    private function buildLastName(string $lastName, ?string $suffix): string
    {
        $last = trim(preg_replace('/\s+(DDS|DMD)$/i', '', $lastName));

        if ($suffix) {
            return "{$last} {$suffix}";
        }

        return $last;
    }

    private function extractSuffix(string $lastName): string
    {
        if (preg_match('/\s+(DDS|DMD)$/i', $lastName, $matches)) {
            return strtoupper($matches[1]);
        }

        return 'DDS';
    }

    private function storePhoto(Request $request): ?string
    {
        if (! $request->hasFile('photo')) {
            return null;
        }

        return $request->file('photo')->store('photos', 'public');
    }

    private function formatDoctor(Doctor $doctor): array
    {
        return [
            'id' => $doctor->id,
            'role' => 'doctor',
            'title' => $doctor->title,
            'first_name' => $doctor->first_name,
            'last_name' => $doctor->last_name,
            'full_name' => $doctor->full_name,
            'initials' => $doctor->initials,
            'photo' => $doctor->photo,
            'photo_url' => $doctor->photo_url,
            'phone' => $doctor->phone,
            'suffix' => $this->extractSuffix($doctor->last_name),
        ];
    }
}
