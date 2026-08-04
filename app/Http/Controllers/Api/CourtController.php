<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Court;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CourtController extends Controller
{
    // Listado público de canchas activas, con filtro opcional por deporte
    public function index(Request $request)
    {
        $query = Court::where('is_active', true)->with('sport');

        if ($request->filled('sport_id')) {
            $query->where('sport_id', $request->sport_id);
        }

        $courts = $query->get()->map(function (Court $court) {
            return [
                'id' => $court->id,
                'sport' => $court->sport->name,
                'name' => $court->name,
                'price_per_hour' => $court->price_per_hour,
                'photo_url' => $court->photo ? Storage::url($court->photo) : null,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $courts,
        ]);
    }

    // Listado completo para el panel de admin (incluye inactivas)
    public function adminIndex()
    {
        $courts = Court::with('sport')->orderBy('name')->get()->map(function (Court $court) {
            return [
                'id' => $court->id,
                'sport_id' => $court->sport_id,
                'sport' => $court->sport->name,
                'name' => $court->name,
                'price_per_hour' => $court->price_per_hour,
                'is_active' => $court->is_active,
                'photo_url' => $court->photo ? Storage::url($court->photo) : null,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $courts,
        ]);
    }

    // Solo admin: crear cancha con foto
    public function store(Request $request)
    {
        $validated = $request->validate([
            'sport_id' => 'required|exists:sports,id',
            'name' => 'required|string|max:100',
            'price_per_hour' => 'required|numeric|min:0',
            'photo' => 'nullable|image|max:4096', // hasta 4MB
        ]);

        if ($request->hasFile('photo')) {
            $validated['photo'] = $request->file('photo')->store('courts', 'public');
        }

        $court = Court::create($validated);

        return response()->json([
            'status' => 'success',
            'data' => $court,
        ], 201);
    }

    // Solo admin: editar cancha (nombre, precio, foto, activar/desactivar)
    public function update(Request $request, Court $court)
    {
        $validated = $request->validate([
            'sport_id' => 'sometimes|exists:sports,id',
            'name' => 'sometimes|string|max:100',
            'price_per_hour' => 'sometimes|numeric|min:0',
            'is_active' => 'sometimes|boolean',
            'photo' => 'nullable|image|max:4096',
        ]);

        if ($request->hasFile('photo')) {
            if ($court->photo) {
                Storage::disk('public')->delete($court->photo);
            }
            $validated['photo'] = $request->file('photo')->store('courts', 'public');
        }

        $court->update($validated);

        return response()->json([
            'status' => 'success',
            'data' => $court,
        ]);
    }

    public function destroy(Court $court)
    {
        if ($court->photo) {
            Storage::disk('public')->delete($court->photo);
        }
        $court->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Cancha eliminada',
        ]);
    }

    // Horarios ya ocupados de una cancha en un día puntual
    // (el frontend usa esto para mostrar qué horarios NO ofrecer)
    public function availability(Request $request, Court $court)
    {
        $validated = $request->validate([
            'date' => 'required|date',
        ]);

        $reserved = $court->reservations()
            ->whereDate('date', $validated['date'])
            ->where('status', 'confirmed')
            ->orderBy('start_time')
            ->get(['start_time', 'end_time']);

        return response()->json([
            'status' => 'success',
            'data' => $reserved,
        ]);
    }
}
