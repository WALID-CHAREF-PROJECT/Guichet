<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table): void {
            if (!Schema::hasColumn('events', 'plan_type')) {
                $table->string('plan_type')->nullable()->after('buying_mode');
            }
        });

        Schema::table('sport_plan_zones', function (Blueprint $table): void {
            if (!Schema::hasColumn('sport_plan_zones', 'plan_type')) {
                $table->string('plan_type')->default('stadium')->after('event_id');
            }
            if (!Schema::hasColumn('sport_plan_zones', 'label')) {
                $table->string('label')->nullable()->after('name');
            }
            if (!Schema::hasColumn('sport_plan_zones', 'color')) {
                $table->string('color')->default('#f97316')->after('available_capacity');
            }
            if (!Schema::hasColumn('sport_plan_zones', 'sort_order')) {
                $table->unsignedInteger('sort_order')->default(0)->after('color');
            }
        });
    }

    public function down(): void
    {
        Schema::table('sport_plan_zones', function (Blueprint $table): void {
            foreach (['sort_order', 'color', 'label', 'plan_type'] as $column) {
                if (Schema::hasColumn('sport_plan_zones', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        Schema::table('events', function (Blueprint $table): void {
            if (Schema::hasColumn('events', 'plan_type')) {
                $table->dropColumn('plan_type');
            }
        });
    }
};
