<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    // Crear una reserva, validando que no se solape con otra existente
    public function store(Request $request)
    {
        $validated = $request->validate([
            'court_id' => 'required|exists:courts,id',
            'date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
        ]);

        // Chequeo de solapamiento: cubre tanto el horario exacto repetido
        // como cualquier superposición parcial (ej: 10:00-11:00 vs 10:30-11:30)
        $conflicto = Reservation::where('court_id', $validated['court_id'])
            ->whereDate('date', $validated['date'])
            ->where('status', 'confirmed')
            ->where(function ($query) use ($validated) {
                $query->where('start_time', '<', $validated['end_time'])
                      ->where('end_time', '>', $validated['start_time']);
            })
            ->exists();

        if ($conflicto) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ya existe una reserva en ese horario para esta cancha.',
            ], 409);
        }

        try {
            $reservation = Reservation::create([
                'user_id' => $request->user()->id,
                ...$validated,
            ]);
        } catch (\Illuminate\Database\QueryException $e) {
            // Red de seguridad ante errores inesperados de base de datos
            // (por ejemplo, si el court_id dejó de existir justo en este instante).
            return response()->json([
                'status' => 'error',
                'message' => 'Ya existe una reserva en ese horario para esta cancha.',
            ], 409);
        }

        return response()->json([
            'status' => 'success',
            'data' => $reservation->load('court.sport'),
        ], 201);
    }

    // Reservas del usuario logueado
    public function myReservations(Request $request)
    {
        $reservations = $request->user()
            ->reservations()
            ->with('court.sport')
            ->orderBy('date')
            ->orderBy('start_time')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $reservations,
        ]);
    }

    // Cancelar una reserva propia
    public function cancel(Request $request, Reservation $reservation)
    {
        if ($reservation->user_id !== $request->user()->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'No autorizado para cancelar esta reserva.',
            ], 403);
        }

        $reservation->update(['status' => 'cancelled']);

        return response()->json([
            'status' => 'success',
            'message' => 'Reserva cancelada correctamente.',
        ]);
    }
}
