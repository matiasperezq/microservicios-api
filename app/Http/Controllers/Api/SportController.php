<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sport;
use Illuminate\Http\Request;

class SportController extends Controller
{
    // Listado público (cualquier usuario autenticado)
    public function index()
    {
        return response()->json([
            'status' => 'success',
            'data' => Sport::all(),
        ]);
    }

    // Solo admin
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50|unique:sports,name',
        ]);

        $sport = Sport::create($validated);

        return response()->json([
            'status' => 'success',
            'data' => $sport,
        ], 201);
    }

    public function update(Request $request, Sport $sport)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50|unique:sports,name,' . $sport->id,
        ]);

        $sport->update($validated);

        return response()->json([
            'status' => 'success',
            'data' => $sport,
        ]);
    }

    public function destroy(Sport $sport)
    {
        $sport->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Deporte eliminado',
        ]);
    }
}
