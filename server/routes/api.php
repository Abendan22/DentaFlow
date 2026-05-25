<?php

use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomerAppointmentController;
use App\Http\Controllers\Api\CustomerAuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DoctorController;
use App\Http\Controllers\Api\GenderController;
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\StaffController;
use App\Http\Middleware\ApiTokenAuth;
use App\Http\Middleware\EnsureAdmin;
use App\Http\Middleware\EnsureUserRole;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::get('/genders', [GenderController::class, 'index']);
Route::get('/public/services', [ServiceController::class, 'publicActive']);

Route::post('/customer/register', [CustomerAuthController::class, 'register']);

Route::middleware(ApiTokenAuth::class)->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::middleware(EnsureUserRole::class)->prefix('customer')->group(function () {
        Route::get('/appointments', [CustomerAppointmentController::class, 'index']);
        Route::post('/appointments', [CustomerAppointmentController::class, 'store']);
    });

    Route::middleware(EnsureAdmin::class)->group(function () {
        Route::apiResource('genders', GenderController::class)->except(['index']);
        Route::get('/patients/options', [PatientController::class, 'options']);
        Route::apiResource('patients', PatientController::class);
        Route::get('/doctors/options', [DoctorController::class, 'options']);
        Route::apiResource('doctors', DoctorController::class);
        Route::apiResource('staff', StaffController::class);
        Route::apiResource('services', ServiceController::class);

        Route::post('/appointments/{appointment}/approve', [AppointmentController::class, 'approve']);
        Route::post('/appointments/{appointment}/reject', [AppointmentController::class, 'reject']);
        Route::apiResource('appointments', AppointmentController::class);

        Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

        Route::get('/reports/appointments', [ReportController::class, 'appointments']);
        Route::get('/reports/patients', [ReportController::class, 'patients']);
        Route::get('/activity-logs', [ActivityLogController::class, 'index']);
    });
});
