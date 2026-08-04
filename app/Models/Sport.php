<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Sport extends Model
{
    protected $fillable = ['name', 'slug'];

    protected static function boot()
    {
        parent::boot();

        static::creating(function (Sport $sport) {
            if (empty($sport->slug)) {
                $sport->slug = Str::slug($sport->name);
            }
        });
    }

    public function courts()
    {
        return $this->hasMany(Court::class);
    }
}
