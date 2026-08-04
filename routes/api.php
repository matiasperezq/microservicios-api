<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FileController;
use App\Http\Controllers\Api\SportController;
use App\Http\Controllers\Api\CourtController;
use App\Http\Controllers\Api\ReservationController;

Route::get('/ping', fn() => response()->json([
    'success' => true,
    'data' => ['status' => 'ok'],
    'message' => 'API is running correctly'
]));

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Rutas para reset de contraseña
Route::post('/password/forgot', [AuthController::class, 'forgotPassword']);
Route::post('/password/reset', [AuthController::class, 'resetPassword']);

// Ruta para verificar email
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
    ->middleware('signed')
    ->name('verification.verify');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Reenviar email de verificación
    Route::post('/email/resend', [AuthController::class, 'resendVerificationEmail']);

    // Rutas para manejo de archivos
    Route::prefix('files')->group(function () {
        Route::post('/upload', [FileController::class, 'upload']);
        Route::get('/', [FileController::class, 'index']);
        Route::get('/download/{filename}', [FileController::class, 'download']);
        Route::delete('/{filename}', [FileController::class, 'delete']);
    });

    // ---- SportRent: lectura para cualquier usuario logueado ----
    Route::get('/sports', [SportController::class, 'index']);
    Route::get('/courts', [CourtController::class, 'index']);
    Route::get('/courts/{court}/availability', [CourtController::class, 'availability']);

    // ---- SportRent: reservas del usuario logueado ----
    Route::post('/reservations', [ReservationController::class, 'store']);
    Route::get('/my-reservations', [ReservationController::class, 'myReservations']);
    Route::delete('/reservations/{reservation}', [ReservationController::class, 'cancel']);
});

// ---- SportRent: administración, solo rol admin ----
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::post('/sports', [SportController::class, 'store']);
    Route::put('/sports/{sport}', [SportController::class, 'update']);
    Route::delete('/sports/{sport}', [SportController::class, 'destroy']);

    Route::post('/courts', [CourtController::class, 'store']);
    Route::put('/courts/{court}', [CourtController::class, 'update']);
    Route::delete('/courts/{court}', [CourtController::class, 'destroy']);
    Route::get('/admin/courts', [CourtController::class, 'adminIndex']);
});
