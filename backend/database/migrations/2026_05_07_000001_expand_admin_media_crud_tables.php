<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('packs', function (Blueprint $table): void {
            if (!Schema::hasColumn('packs', 'slug')) {
                $table->string('slug')->nullable()->after('code');
            }
            if (!Schema::hasColumn('packs', 'price')) {
                $table->decimal('price', 10, 2)->default(0)->after('slug');
            }
            if (!Schema::hasColumn('packs', 'billing_type')) {
                $table->string('billing_type')->default('monthly')->after('price');
            }
            if (!Schema::hasColumn('packs', 'quotas')) {
                $table->json('quotas')->nullable()->after('max_active_events');
            }
            if (!Schema::hasColumn('packs', 'features')) {
                $table->json('features')->nullable()->after('quotas');
            }
            if (!Schema::hasColumn('packs', 'image')) {
                $table->string('image')->nullable()->after('features');
            }
            if (!Schema::hasColumn('packs', 'is_featured')) {
                $table->boolean('is_featured')->default(false)->after('is_active');
            }
        });

        Schema::table('categories', function (Blueprint $table): void {
            if (!Schema::hasColumn('categories', 'type')) {
                $table->string('type')->default('event')->after('id');
            }
            if (!Schema::hasColumn('categories', 'image')) {
                $table->string('image')->nullable()->after('icon');
            }
            if (!Schema::hasColumn('categories', 'display_order')) {
                $table->unsignedInteger('display_order')->default(0)->after('image');
            }
            if (!Schema::hasColumn('categories', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('display_order');
            }
        });

        Schema::table('travels', function (Blueprint $table): void {
            if (!Schema::hasColumn('travels', 'gallery')) {
                $table->json('gallery')->nullable()->after('image');
            }
            if (!Schema::hasColumn('travels', 'featured')) {
                $table->boolean('featured')->default(false)->after('status');
            }
        });

        Schema::table('movies', function (Blueprint $table): void {
            if (!Schema::hasColumn('movies', 'featured')) {
                $table->boolean('featured')->default(false)->after('status');
            }
        });

        Schema::table('content_blocks', function (Blueprint $table): void {
            if (!Schema::hasColumn('content_blocks', 'description')) {
                $table->text('description')->nullable()->after('subtitle');
            }
            if (!Schema::hasColumn('content_blocks', 'cta_label')) {
                $table->string('cta_label')->nullable()->after('description');
            }
            if (!Schema::hasColumn('content_blocks', 'cta_link')) {
                $table->string('cta_link')->nullable()->after('cta_label');
            }
            if (!Schema::hasColumn('content_blocks', 'background_image')) {
                $table->string('background_image')->nullable()->after('image');
            }
        });
    }

    public function down(): void
    {
        Schema::table('content_blocks', function (Blueprint $table): void {
            foreach (['background_image', 'cta_link', 'cta_label', 'description'] as $column) {
                if (Schema::hasColumn('content_blocks', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
        Schema::table('movies', function (Blueprint $table): void { if (Schema::hasColumn('movies', 'featured')) $table->dropColumn('featured'); });
        Schema::table('travels', function (Blueprint $table): void {
            foreach (['featured', 'gallery'] as $column) {
                if (Schema::hasColumn('travels', $column)) $table->dropColumn($column);
            }
        });
        Schema::table('categories', function (Blueprint $table): void {
            foreach (['is_active', 'display_order', 'image', 'type'] as $column) {
                if (Schema::hasColumn('categories', $column)) $table->dropColumn($column);
            }
        });
        Schema::table('packs', function (Blueprint $table): void {
            foreach (['is_featured', 'image', 'features', 'quotas', 'billing_type', 'price', 'slug'] as $column) {
                if (Schema::hasColumn('packs', $column)) $table->dropColumn($column);
            }
        });
    }
};
