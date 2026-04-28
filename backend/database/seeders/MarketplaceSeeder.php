<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\City;
use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class MarketplaceSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::query()->updateOrCreate(['email' => 'admin@guichet.ma'], [
            'name' => 'Admin Guichet', 'first_name' => 'Admin', 'last_name' => 'Guichet', 'role' => 'admin', 'password' => Hash::make('Admin123!'), 'phone' => '+212600000001', 'is_active' => true,
        ]);
        $organizer = User::query()->updateOrCreate(['email' => 'fournisseur@guichet.ma'], [
            'name' => 'Fournisseur Guichet', 'first_name' => 'Fournisseur', 'last_name' => 'Guichet', 'role' => 'producer', 'password' => Hash::make('Organizer123!'), 'phone' => '+212600000002', 'is_active' => true, 'company_name' => 'Guichet Organizer', 'organization_slug' => 'guichet-organizer',
        ]);
        $client = User::query()->updateOrCreate(['email' => 'client@guichet.ma'], [
            'name' => 'Client Guichet', 'first_name' => 'Client', 'last_name' => 'Guichet', 'role' => 'client', 'password' => Hash::make('Client123!'), 'phone' => '+212600000003', 'is_active' => true,
        ]);

        DB::table('organizers')->updateOrInsert(['user_id' => $organizer->id], [
            'company_name' => 'Guichet Organizer', 'slug' => 'guichet-organizer', 'logo' => 'https://picsum.photos/seed/organizer/300/300', 'cover_image' => 'https://picsum.photos/seed/organizer-cover/1200/400', 'description' => 'Organisateur officiel.', 'city' => 'Casablanca', 'address' => 'Ain Diab', 'website' => 'https://guichet.local', 'support_email' => 'support@guichet.com', 'support_phone' => '+212522000000', 'is_approved' => true, 'updated_at' => now(), 'created_at' => now(),
        ]);

        Category::query()->updateOrCreate(['slug' => 'voyage-organise'], ['name' => 'Voyage organisé', 'type' => 'travel', 'display_order' => 9, 'is_active' => true]);
        Category::query()->updateOrCreate(['slug' => 'cinema'], ['name' => 'Cinéma', 'type' => 'movie', 'display_order' => 10, 'is_active' => true]);

        $sportCategory = Category::query()->firstWhere('slug', 'sport');
        $city = City::query()->first() ?? City::query()->create(['name' => 'Casablanca', 'slug' => 'casablanca']);

        $sportEvent = Event::query()->updateOrCreate(['slug' => 'bal-casablanca-finals-night'], [
            'category_id' => $sportCategory?->id,
            'city_id' => $city->id,
            'organizer_id' => $organizer->id,
            'organizer' => 'Guichet Organizer',
            'title' => 'BAL Casablanca Finals Night',
            'short_description' => 'Finale BAL avec plan terrain.',
            'description' => 'Événement sport avec achat via plan uniquement.',
            'city_name' => 'Casablanca',
            'venue' => 'Complexe Mohammed V',
            'address' => 'Bd Zerktouni',
            'event_date' => now()->addWeeks(2)->toDateString(),
            'event_time' => '20:30:00',
            'image_url' => 'https://picsum.photos/seed/sport/1200/700',
            'image' => 'https://picsum.photos/seed/sport/1200/700',
            'type' => 'sport',
            'buying_mode' => 'plan',
            'has_plan' => true,
            'status' => 'published',
            'featured' => true,
            'starts_at' => now()->addWeeks(2),
            'price_mad' => 100,
        ]);

        DB::table('ticket_types')->updateOrInsert(['event_id' => $sportEvent->id, 'name' => 'Tribune A'], ['price' => 100, 'stock' => 200, 'requires_seat_selection' => true, 'updated_at' => now(), 'created_at' => now()]);
        DB::table('sport_plan_zones')->updateOrInsert(['event_id' => $sportEvent->id, 'name' => 'Tribune A'], ['code' => 'A', 'price' => 100, 'capacity' => 200, 'available_capacity' => 180, 'is_available' => true, 'shape_data' => json_encode(['x' => 10, 'y' => 20]), 'updated_at' => now(), 'created_at' => now()]);
        DB::table('sport_plan_zones')->updateOrInsert(['event_id' => $sportEvent->id, 'name' => 'Tribune B'], ['code' => 'B', 'price' => 150, 'capacity' => 120, 'available_capacity' => 90, 'is_available' => true, 'shape_data' => json_encode(['x' => 40, 'y' => 30]), 'updated_at' => now(), 'created_at' => now()]);

        DB::table('travels')->updateOrInsert(['slug' => 'desert-premium'], ['title' => 'Voyage désert premium', 'category' => 'Voyage organisé', 'destination' => 'Merzouga', 'departure_date' => now()->addMonth()->toDateString(), 'price' => 4200, 'image' => 'https://picsum.photos/seed/travel/1200/700', 'description' => 'Road trip premium.', 'status' => 'published', 'updated_at' => now(), 'created_at' => now()]);

        $movieId = DB::table('movies')->updateOrInsert(['slug' => 'casablanca-nocturne'], ['title' => 'Casablanca Nocturne', 'genre' => 'Action', 'duration' => '2h10', 'release_date' => now()->subDays(10)->toDateString(), 'poster' => 'https://picsum.photos/seed/movie/900/1200', 'synopsis' => 'Thriller urbain.', 'status' => 'published', 'updated_at' => now(), 'created_at' => now()]);
        $movie = DB::table('movies')->where('slug', 'casablanca-nocturne')->first();
        if ($movie) {
            DB::table('movie_sessions')->updateOrInsert(['movie_id' => $movie->id, 'session_date' => now()->toDateString(), 'session_time' => '19:00'], ['cinema' => 'Megarama', 'city' => 'Casablanca', 'price' => 70, 'updated_at' => now(), 'created_at' => now()]);
        }

        DB::table('payouts')->updateOrInsert(['reference' => 'PAYOUT-0001'], ['organizer_id' => $organizer->id, 'amount' => 12000, 'status' => 'pending', 'payout_date' => now()->addDays(5)->toDateString(), 'updated_at' => now(), 'created_at' => now()]);
        DB::table('content_blocks')->updateOrInsert(['title' => 'Hero Home'], ['type' => 'banner', 'subtitle' => 'Nouvelle saison', 'image' => 'https://picsum.photos/seed/banner/1200/400', 'visible' => true, 'display_order' => 1, 'updated_at' => now(), 'created_at' => now()]);

        DB::table('settings')->updateOrInsert(['key' => 'platform_name'], ['value' => 'Guichet Marketplace', 'updated_at' => now(), 'created_at' => now()]);

        $orderId = DB::table('orders')->insertGetId([
            'reference' => 'CMD-DEMO-001',
            'user_id' => $client->id,
            'organizer_id' => $organizer->id,
            'total' => 200,
            'payment_status' => 'paid',
            'status' => 'paid',
            'customer' => json_encode(['firstName' => 'Client', 'lastName' => 'User']),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $itemId = DB::table('order_items')->insertGetId(['order_id' => $orderId, 'product_type' => 'event_ticket', 'product_id' => (string) $sportEvent->id, 'title' => $sportEvent->title, 'quantity' => 2, 'unit_price' => 100, 'subtotal' => 200, 'selected_zone' => 'Tribune A', 'metadata' => json_encode(['seed' => true]), 'created_at' => now(), 'updated_at' => now()]);
        DB::table('tickets')->insert(['order_item_id' => $itemId, 'ticket_number' => 'TKT-'.strtoupper(Str::random(8)), 'qr_code' => 'QR-'.strtoupper(Str::random(12)), 'created_at' => now(), 'updated_at' => now()]);
    }
}
