<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('movie_sessions', function (Blueprint $table): void {
            if (!Schema::hasColumn('movie_sessions', 'hall_name')) {
                $table->string('hall_name')->nullable()->after('city');
            }
            if (!Schema::hasColumn('movie_sessions', 'seating_enabled')) {
                $table->boolean('seating_enabled')->default(false)->after('price');
            }
            if (!Schema::hasColumn('movie_sessions', 'seat_template')) {
                $table->string('seat_template')->default('medium')->after('seating_enabled');
            }
            if (!Schema::hasColumn('movie_sessions', 'reserved_seats')) {
                $table->json('reserved_seats')->nullable()->after('seat_template');
            }
        });
    }

    public function down(): void
    {
        Schema::table('movie_sessions', function (Blueprint $table): void {
            foreach (['reserved_seats', 'seat_template', 'seating_enabled', 'hall_name'] as $column) {
                if (Schema::hasColumn('movie_sessions', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
