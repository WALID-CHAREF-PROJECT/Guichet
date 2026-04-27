<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('producers', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique('user_id');
        });

        Schema::create('packs', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->unsignedInteger('max_events_per_month')->nullable();
            $table->unsignedInteger('max_active_events')->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('producer_pack_subscriptions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('producer_id')->constrained('producers')->cascadeOnDelete();
            $table->foreignId('pack_id')->constrained('packs')->cascadeOnDelete();
            $table->timestamp('starts_at');
            $table->timestamp('ends_at')->nullable();
            $table->string('status')->default('active');
            $table->timestamps();

            $table->index(['producer_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('producer_pack_subscriptions');
        Schema::dropIfExists('packs');
        Schema::dropIfExists('producers');
    }
};
