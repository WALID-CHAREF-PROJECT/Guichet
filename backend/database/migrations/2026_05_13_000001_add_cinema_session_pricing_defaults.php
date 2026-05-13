<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('movie_sessions', function (Blueprint $table): void {
            if (!Schema::hasColumn('movie_sessions', 'standard_price')) {
                $table->decimal('standard_price', 10, 2)->nullable()->after('price');
            }
            if (!Schema::hasColumn('movie_sessions', 'vip_price')) {
                $table->decimal('vip_price', 10, 2)->nullable()->after('standard_price');
            }
            if (!Schema::hasColumn('movie_sessions', 'vvip_price')) {
                $table->decimal('vvip_price', 10, 2)->nullable()->after('vip_price');
            }
            if (!Schema::hasColumn('movie_sessions', 'reserved_seat_count')) {
                $table->unsignedInteger('reserved_seat_count')->default(0)->after('reserved_seats');
            }
        });
    }

    public function down(): void
    {
        Schema::table('movie_sessions', function (Blueprint $table): void {
            foreach (['reserved_seat_count', 'vvip_price', 'vip_price', 'standard_price'] as $column) {
                if (Schema::hasColumn('movie_sessions', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
