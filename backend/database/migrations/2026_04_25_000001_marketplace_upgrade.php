<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            if (!Schema::hasColumn('users', 'role')) {
                $table->string('role')->default('client')->after('id');
                $table->string('first_name')->nullable()->after('role');
                $table->string('last_name')->nullable()->after('first_name');
                $table->string('phone')->nullable()->after('password');
                $table->string('avatar')->nullable()->after('phone');
                $table->boolean('is_active')->default(true)->after('avatar');
                $table->string('company_name')->nullable()->after('is_active');
                $table->string('organization_slug')->nullable()->after('company_name');
                $table->string('api_token', 80)->nullable()->unique()->after('remember_token');
            }
        });

        Schema::table('categories', function (Blueprint $table): void {
            if (!Schema::hasColumn('categories', 'type')) {
                $table->string('type')->default('event')->after('id');
                $table->string('icon')->nullable()->after('slug');
                $table->boolean('is_active')->default(true)->after('icon');
                $table->unsignedInteger('display_order')->default(0)->after('is_active');
            }
        });

        Schema::table('events', function (Blueprint $table): void {
            if (!Schema::hasColumn('events', 'organizer_id')) {
                $table->foreignId('organizer_id')->nullable()->constrained('users')->nullOnDelete()->after('id');
                $table->string('short_description')->nullable()->after('title');
                $table->string('city_name')->nullable()->after('description');
                $table->string('address')->nullable()->after('venue');
                $table->date('event_date')->nullable()->after('address');
                $table->time('event_time')->nullable()->after('event_date');
                $table->string('image')->nullable()->after('image_url');
                $table->string('hero_image')->nullable()->after('image');
                $table->string('type')->default('event')->after('hero_image');
                $table->string('buying_mode')->default('ticket')->after('type');
                $table->boolean('has_plan')->default(false)->after('buying_mode');
                $table->boolean('seating_enabled')->default(false)->after('has_plan');
                $table->string('status')->default('published')->after('seating_enabled');
                $table->boolean('featured')->default(false)->after('status');
            }
        });

        Schema::create('organizers', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('company_name');
            $table->string('slug')->unique();
            $table->string('logo')->nullable();
            $table->string('cover_image')->nullable();
            $table->text('description')->nullable();
            $table->string('city')->nullable();
            $table->string('address')->nullable();
            $table->string('website')->nullable();
            $table->string('support_email')->nullable();
            $table->string('support_phone')->nullable();
            $table->boolean('is_approved')->default(false);
            $table->timestamps();
        });

        Schema::create('ticket_types', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
            $table->string('name');
            $table->decimal('price', 10, 2);
            $table->unsignedInteger('stock')->default(0);
            $table->boolean('requires_seat_selection')->default(false);
            $table->timestamps();
        });

        Schema::create('sport_plan_zones', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
            $table->string('name');
            $table->string('code')->nullable();
            $table->decimal('price', 10, 2);
            $table->unsignedInteger('capacity')->default(0);
            $table->unsignedInteger('available_capacity')->default(0);
            $table->boolean('is_available')->default(true);
            $table->json('shape_data')->nullable();
            $table->timestamps();
        });

        Schema::create('carts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
            $table->unique('user_id');
        });

        Schema::create('cart_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('cart_id')->constrained('carts')->cascadeOnDelete();
            $table->string('product_type');
            $table->string('product_id');
            $table->string('slug')->nullable();
            $table->string('title');
            $table->string('image')->nullable();
            $table->string('date')->nullable();
            $table->string('location')->nullable();
            $table->unsignedInteger('quantity')->default(1);
            $table->decimal('unit_price', 10, 2)->default(0);
            $table->decimal('subtotal', 10, 2)->default(0);
            $table->decimal('advance_amount', 10, 2)->nullable();
            $table->decimal('remaining_amount', 10, 2)->nullable();
            $table->timestamps();
        });

        Schema::create('favorites', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('item_type');
            $table->string('item_id');
            $table->string('slug')->nullable();
            $table->string('title')->nullable();
            $table->string('image')->nullable();
            $table->string('location')->nullable();
            $table->string('date')->nullable();
            $table->string('route')->nullable();
            $table->timestamps();
        });

        Schema::create('orders', function (Blueprint $table): void {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('organizer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->decimal('total', 10, 2)->default(0);
            $table->string('payment_status')->default('pending');
            $table->string('status')->default('pending');
            $table->json('customer')->nullable();
            $table->timestamps();
        });

        Schema::create('order_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->string('product_type');
            $table->string('product_id');
            $table->string('title');
            $table->unsignedInteger('quantity')->default(1);
            $table->decimal('unit_price', 10, 2);
            $table->decimal('subtotal', 10, 2);
            $table->string('selected_zone')->nullable();
            $table->string('selected_place')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('payments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->string('provider')->default('card');
            $table->string('status')->default('initialized');
            $table->string('provider_reference')->nullable();
            $table->decimal('amount', 10, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('tickets', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('order_item_id')->constrained('order_items')->cascadeOnDelete();
            $table->string('ticket_number')->unique();
            $table->string('qr_code')->nullable();
            $table->timestamps();
        });

        Schema::create('travels', function (Blueprint $table): void {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('category')->nullable();
            $table->string('destination')->nullable();
            $table->string('departure_date')->nullable();
            $table->decimal('price', 10, 2)->default(0);
            $table->string('image')->nullable();
            $table->text('description')->nullable();
            $table->string('status')->default('published');
            $table->timestamps();
        });

        Schema::create('movies', function (Blueprint $table): void {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('genre')->nullable();
            $table->string('duration')->nullable();
            $table->string('release_date')->nullable();
            $table->string('poster')->nullable();
            $table->text('synopsis')->nullable();
            $table->string('status')->default('published');
            $table->timestamps();
        });

        Schema::create('movie_sessions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('movie_id')->constrained('movies')->cascadeOnDelete();
            $table->string('session_date');
            $table->string('session_time');
            $table->string('cinema')->nullable();
            $table->string('city')->nullable();
            $table->decimal('price', 10, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('payouts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organizer_id')->constrained('users')->cascadeOnDelete();
            $table->string('reference')->unique();
            $table->decimal('amount', 10, 2)->default(0);
            $table->string('status')->default('pending');
            $table->date('payout_date')->nullable();
            $table->timestamps();
        });

        Schema::create('content_blocks', function (Blueprint $table): void {
            $table->id();
            $table->string('type')->default('section');
            $table->string('title');
            $table->string('subtitle')->nullable();
            $table->string('image')->nullable();
            $table->boolean('visible')->default(true);
            $table->unsignedInteger('display_order')->default(0);
            $table->timestamps();
        });

        Schema::create('settings', function (Blueprint $table): void {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
        Schema::dropIfExists('content_blocks');
        Schema::dropIfExists('payouts');
        Schema::dropIfExists('movie_sessions');
        Schema::dropIfExists('movies');
        Schema::dropIfExists('travels');
        Schema::dropIfExists('tickets');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('favorites');
        Schema::dropIfExists('cart_items');
        Schema::dropIfExists('carts');
        Schema::dropIfExists('sport_plan_zones');
        Schema::dropIfExists('ticket_types');
        Schema::dropIfExists('organizers');
    }
};
