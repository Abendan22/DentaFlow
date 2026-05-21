<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StaffController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = $request->query('search');

        $staff = Staff::query()
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
            ->map(fn (Staff $member) => $this->formatStaff($member));

        return response()->json($staff);
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
            'photo' => ['nullable', 'image', 'max:2048'],
        ]);

        $member = Staff::create([
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'middle_name' => $data['middle_name'] ?? null,
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
            'gender_id' => $data['gender_id'] ?? null,
            'photo' => $this->storePhoto($request),
        ]);

        return response()->json($this->formatStaff($member->load('gender')), 201);
    }

    public function update(Request $request, Staff $staff): JsonResponse
    {
        $data = $request->validate([
            'first_name' => ['sometimes', 'string', 'max:100'],
            'last_name' => ['sometimes', 'string', 'max:100'],
            'middle_name' => ['nullable', 'string', 'max:100'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'gender_id' => ['nullable', 'exists:genders,id'],
            'photo' => ['nullable', 'image', 'max:2048'],
            'remove_photo' => ['nullable', 'boolean'],
        ]);

        if ($request->boolean('remove_photo') && $staff->photo) {
            Storage::disk('public')->delete($staff->photo);
            $staff->photo = null;
        }

        if ($request->hasFile('photo')) {
            if ($staff->photo) {
                Storage::disk('public')->delete($staff->photo);
            }
            $staff->photo = $this->storePhoto($request);
        }

        $staff->fill(collect($data)->except(['photo', 'remove_photo'])->toArray());
        $staff->save();

        return response()->json($this->formatStaff($staff->load('gender')));
    }

    public function destroy(Staff $staff): JsonResponse
    {
        $staff->delete();

        return response()->json([
            'message' => 'Staff record removed from the list. The record is kept in the database.',
        ]);
    }

    private function storePhoto(Request $request): ?string
    {
        if (! $request->hasFile('photo')) {
            return null;
        }

        return $request->file('photo')->store('photos', 'public');
    }

    private function formatStaff(Staff $staff): array
    {
        return [
            'id' => $staff->id,
            'role' => 'staff',
            'first_name' => $staff->first_name,
            'last_name' => $staff->last_name,
            'middle_name' => $staff->middle_name,
            'full_name' => $staff->full_name,
            'initials' => $staff->initials,
            'photo' => $staff->photo,
            'photo_url' => $staff->photo_url,
            'email' => $staff->email,
            'phone' => $staff->phone,
            'gender_id' => $staff->gender_id,
            'gender' => $staff->gender?->name,
        ];
    }
}
