<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->foreignId('city_id')->constrained()->cascadeOnDelete();
            $table->string('organizer');
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('venue');
            $table->text('description');
            $table->string('image_url');
            $table->timestamp('starts_at');
            $table->decimal('price_mad', 10, 2)->default(0);
            $table->boolean('is_sold_out')->default(false);
            $table->boolean('is_free')->default(false);
            $table->timestamps();

            $table->index(['starts_at']);
            $table->index(['city_id', 'category_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
