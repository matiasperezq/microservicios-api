<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservations', function ($table) {
            $table->dropUnique(['court_id', 'date', 'start_time']);
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function ($table) {
            $table->unique(['court_id', 'date', 'start_time']);
        });
    }
};
