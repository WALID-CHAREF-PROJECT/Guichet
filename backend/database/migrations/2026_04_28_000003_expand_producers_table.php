<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('producers', function (Blueprint $table): void {
            if (!Schema::hasColumn('producers', 'logo')) {
                $table->string('logo')->nullable()->after('phone');
            }
            if (!Schema::hasColumn('producers', 'cover_image')) {
                $table->string('cover_image')->nullable()->after('logo');
            }
            if (!Schema::hasColumn('producers', 'city')) {
                $table->string('city')->nullable()->after('cover_image');
            }
            if (!Schema::hasColumn('producers', 'address')) {
                $table->string('address')->nullable()->after('city');
            }
            if (!Schema::hasColumn('producers', 'support_email')) {
                $table->string('support_email')->nullable()->after('address');
            }
            if (!Schema::hasColumn('producers', 'support_phone')) {
                $table->string('support_phone')->nullable()->after('support_email');
            }
            if (!Schema::hasColumn('producers', 'description')) {
                $table->text('description')->nullable()->after('support_phone');
            }
        });
    }

    public function down(): void
    {
        Schema::table('producers', function (Blueprint $table): void {
            foreach (['description', 'support_phone', 'support_email', 'address', 'city', 'cover_image', 'logo'] as $column) {
                if (Schema::hasColumn('producers', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
