<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Category extends Model
{
    use HasFactory;

    // Campos que se pueden asignar masivamente
    protected $fillable = ['name', 'slug', 'description', 'color', 'is_active'];

    // Campos que deben ser tratados como fechas
    protected $dates = ['created_at', 'updated_at'];

    // Casting de tipos de datos
    protected $casts = ['is_active' => 'boolean'];
}
