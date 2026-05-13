<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\City;
use App\Models\Event;
use App\Models\Producer;
use App\Models\User;
use App\Support\SlugNormalizer;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class MarketplaceSeeder extends Seeder
{

    /** @return array<int, string> */
    private function seededOrganizerNames(): array
    {
        return [
            'Guichet Organizer',
            'Atlas Live',
            'Rire Capital',
            'Marrakech Vibes',
            'Fondation Horizon',
            'Fès Running Club',
            'Creative North',
            'Makers Kénitra',
            'Legacy Stage',
            'Rythme Urbain',
            'Casa Culture',
            'Smile Factory',
            'Derby Events',
            'Étoile du Cœur',
            'Pixel Atlas',
            'Vintage Nights',
            'Sunset Records',
        ];
    }

    private function upsertPublicOrganizerProfile(string $name, ?User $user = null): User
    {
        $slug = SlugNormalizer::ascii($name);
        $profileUser = $user ?: User::query()->updateOrCreate(
            ['email' => "producer+{$slug}@guichet.ma"],
            [
                'name' => $name,
                'first_name' => $name,
                'last_name' => '',
                'role' => 'producer',
                'password' => Hash::make('Organizer123!'),
                'phone' => '+212600000000',
                'is_active' => true,
                'company_name' => $name,
                'organization_slug' => $slug,
            ]
        );

        if ($user) {
            $profileUser->forceFill([
                'company_name' => $name,
                'organization_slug' => $slug,
            ])->save();
        }

        DB::table('organizers')->updateOrInsert(
            ['slug' => $slug],
            [
                'user_id' => $profileUser->id,
                'company_name' => $name,
                'logo' => "https://picsum.photos/seed/{$slug}-logo/300/300",
                'cover_image' => "https://picsum.photos/seed/{$slug}-cover/1200/400",
                'description' => "Page publique démo de {$name}.",
                'city' => 'Casablanca',
                'address' => null,
                'website' => null,
                'support_email' => $profileUser->email,
                'support_phone' => $profileUser->phone,
                'is_approved' => true,
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        Producer::query()->updateOrCreate(
            ['slug' => $slug],
            [
                'user_id' => $profileUser->id,
                'name' => $name,
                'email' => $profileUser->email,
                'phone' => $profileUser->phone,
                'logo' => "https://picsum.photos/seed/{$slug}-logo/300/300",
                'cover_image' => "https://picsum.photos/seed/{$slug}-cover/1200/400",
                'city' => 'Casablanca',
                'address' => null,
                'support_email' => $profileUser->email,
                'support_phone' => $profileUser->phone,
                'description' => "Page publique démo de {$name}.",
                'is_active' => true,
            ]
        );

        return $profileUser;
    }

    private function syncSeededOrganizerProfiles(?User $mainOrganizer = null): void
    {
        $names = collect($this->seededOrganizerNames())
            ->merge(DB::table('events')->whereNotNull('organizer')->pluck('organizer'))
            ->filter(fn (?string $name): bool => is_string($name) && trim($name) !== '')
            ->unique(fn (string $name): string => SlugNormalizer::ascii($name));

        foreach ($names as $name) {
            $this->upsertPublicOrganizerProfile($name, $name === 'Guichet Organizer' ? $mainOrganizer : null);
        }
    }

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

        $this->syncSeededOrganizerProfiles($organizer);

        Category::query()->updateOrCreate(['slug' => 'voyage-organise'], ['name' => 'Voyage organisé', 'type' => 'travel', 'display_order' => 9, 'is_active' => true, 'icon' => '✈️']);
        Category::query()->updateOrCreate(['slug' => 'last-minute'], ['name' => 'Last Minute', 'type' => 'travel', 'display_order' => 10, 'is_active' => true, 'icon' => '⚡']);
        Category::query()->updateOrCreate(['slug' => 'cinema'], ['name' => 'Cinéma', 'type' => 'movie', 'display_order' => 11, 'is_active' => true, 'icon' => '🎬']);
        Category::query()->updateOrCreate(['slug' => 'action'], ['name' => 'Action', 'type' => 'movie', 'display_order' => 12, 'is_active' => true, 'icon' => '💥']);
        $theatreCategory = Category::query()->updateOrCreate(['slug' => 'theatre-humour'], ['name' => 'Théâtre & Humour', 'type' => 'event', 'display_order' => 3, 'is_active' => true, 'icon' => '🎭']);
        $concertCategory = Category::query()->updateOrCreate(['slug' => 'concerts'], ['name' => 'Concerts', 'type' => 'event', 'display_order' => 2, 'is_active' => true, 'icon' => '🎤']);
        Category::query()->updateOrCreate(['slug' => 'spectacle'], ['name' => 'Spectacle', 'type' => 'event', 'display_order' => 4, 'is_active' => true, 'icon' => '✨']);
        $sportCategory = Category::query()->updateOrCreate(['slug' => 'sport'], ['name' => 'Sport', 'type' => 'sport', 'display_order' => 5, 'is_active' => true, 'icon' => '🏟️']);
        $city = City::query()->updateOrCreate(['slug' => 'casablanca'], ['name' => 'Casablanca']);

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
            'plan_type' => 'stadium',
            'has_plan' => true,
            'seating_enabled' => true,
            'status' => 'published',
            'featured' => true,
            'starts_at' => now()->addWeeks(2),
            'price_mad' => 100,
        ]);

        DB::table('ticket_types')->updateOrInsert(['event_id' => $sportEvent->id, 'name' => 'Tribune Nord'], ['price' => 100, 'stock' => 200, 'requires_seat_selection' => true, 'updated_at' => now(), 'created_at' => now()]);
        foreach ([
            ['Tribune Nord', 'Virage Nord', 120, 1200, 640, '#22c55e'],
            ['Tribune Sud', 'Virage Sud', 120, 1200, 580, '#14b8a6'],
            ['Tribune Est', 'Latérale Est', 180, 900, 340, '#3b82f6'],
            ['Tribune Ouest', 'Latérale Ouest', 220, 820, 260, '#6366f1'],
            ['Virage Nord', 'Supporters Nord', 90, 1600, 900, '#ef4444'],
            ['Virage Sud', 'Supporters Sud', 90, 1500, 760, '#f97316'],
            ['VIP', 'Loges présidentielles', 650, 120, 40, '#eab308'],
        ] as $index => [$name, $label, $price, $capacity, $available, $color]) {
            DB::table('sport_plan_zones')->updateOrInsert(['event_id' => $sportEvent->id, 'name' => $name], ['plan_type' => 'stadium', 'label' => $label, 'code' => Str::upper(Str::slug($name, '_')), 'price' => $price, 'capacity' => $capacity, 'available_capacity' => $available, 'color' => $color, 'sort_order' => $index, 'is_available' => true, 'shape_data' => json_encode(['template' => 'stadium']), 'updated_at' => now(), 'created_at' => now()]);
        }

        $normalEvent = Event::query()->updateOrCreate(['slug' => 'festival-normal-ticket-demo'], [
            'category_id' => $concertCategory?->id,
            'city_id' => $city->id,
            'organizer_id' => $organizer->id,
            'organizer' => 'Guichet Organizer',
            'title' => 'Festival normal ticket demo',
            'short_description' => 'Événement sans plan interactif.',
            'description' => 'Demo achat normal avec billets simples et sans ouverture de plan.',
            'city_name' => 'Casablanca',
            'venue' => 'Parc Casa',
            'address' => 'Ain Diab',
            'event_date' => now()->addDays(10)->toDateString(),
            'event_time' => '19:00:00',
            'image_url' => 'https://picsum.photos/seed/normal-event/1200/700',
            'image' => 'https://picsum.photos/seed/normal-event/1200/700',
            'type' => 'concert',
            'buying_mode' => 'ticket',
            'plan_type' => null,
            'has_plan' => false,
            'seating_enabled' => false,
            'status' => 'published',
            'featured' => false,
            'starts_at' => now()->addDays(10),
            'price_mad' => 150,
        ]);
        DB::table('ticket_types')->updateOrInsert(['event_id' => $normalEvent->id, 'name' => 'Normal'], ['price' => 150, 'stock' => 500, 'requires_seat_selection' => false, 'updated_at' => now(), 'created_at' => now()]);

        $theatreEvent = Event::query()->updateOrCreate(['slug' => 'theatre-salle-plan-demo'], [
            'category_id' => $theatreCategory?->id,
            'city_id' => $city->id,
            'organizer_id' => $organizer->id,
            'organizer' => 'Guichet Organizer',
            'title' => 'Théâtre salle plan demo',
            'short_description' => 'Spectacle avec plan de salle.',
            'description' => 'Demo théâtre avec choix de zones Orchestre, Balcon, Mezzanine et VIP.',
            'city_name' => 'Casablanca',
            'venue' => 'Théâtre Mohammed Zefzaf',
            'address' => 'Maarif',
            'event_date' => now()->addDays(18)->toDateString(),
            'event_time' => '20:30:00',
            'image_url' => 'https://picsum.photos/seed/theatre-plan/1200/700',
            'image' => 'https://picsum.photos/seed/theatre-plan/1200/700',
            'type' => 'theatre',
            'buying_mode' => 'plan',
            'plan_type' => 'theatre',
            'has_plan' => true,
            'seating_enabled' => true,
            'status' => 'published',
            'featured' => true,
            'starts_at' => now()->addDays(18),
            'price_mad' => 180,
        ]);
        foreach ([
            ['Orchestre VIP', 'Premiers rangs premium', 650, 48, 18, '#f59e0b'],
            ['Orchestre', 'Face scène', 320, 220, 180, '#38bdf8'],
            ['Balcon', 'Vue surélevée', 220, 160, 100, '#818cf8'],
            ['Mezzanine', 'Centre mezzanine', 260, 96, 45, '#a78bfa'],
            ['Galerie', 'Placement économique', 140, 180, 120, '#14b8a6'],
        ] as $index => [$name, $label, $price, $capacity, $available, $color]) {
            DB::table('sport_plan_zones')->updateOrInsert(['event_id' => $theatreEvent->id, 'name' => $name], ['plan_type' => 'theatre', 'label' => $label, 'code' => Str::upper(Str::slug($name, '_')), 'price' => $price, 'capacity' => $capacity, 'available_capacity' => $available, 'color' => $color, 'sort_order' => $index, 'is_available' => true, 'updated_at' => now(), 'created_at' => now()]);
        }


        DB::table('travels')->updateOrInsert(['slug' => 'desert-premium'], ['title' => 'Voyage désert premium', 'category' => 'Voyage organisé', 'destination' => 'Merzouga', 'departure_date' => now()->addMonth()->toDateString(), 'price' => 4200, 'image' => 'https://picsum.photos/seed/travel/1200/700', 'description' => 'Road trip premium.', 'status' => 'published', 'updated_at' => now(), 'created_at' => now()]);

        $movieId = DB::table('movies')->updateOrInsert(['slug' => 'casablanca-nocturne'], ['title' => 'Casablanca Nocturne', 'genre' => 'Action', 'duration' => '2h10', 'release_date' => now()->subDays(10)->toDateString(), 'poster' => 'https://picsum.photos/seed/movie/900/1200', 'synopsis' => 'Thriller urbain.', 'status' => 'published', 'updated_at' => now(), 'created_at' => now()]);
        $movie = DB::table('movies')->where('slug', 'casablanca-nocturne')->first();
        if ($movie) {
            DB::table('movie_sessions')->updateOrInsert(['movie_id' => $movie->id, 'session_date' => now()->toDateString(), 'session_time' => '19:00'], ['cinema' => 'Megarama', 'city' => 'Casablanca', 'hall_name' => 'Salle Atlas', 'price' => 70, 'seating_enabled' => true, 'seat_template' => 'medium', 'reserved_seats' => json_encode(['A6', 'C4', 'D8']), 'updated_at' => now(), 'created_at' => now()]);
            DB::table('movie_sessions')->updateOrInsert(['movie_id' => $movie->id, 'session_date' => now()->addDay()->toDateString(), 'session_time' => '21:30'], ['cinema' => 'IMAX Morocco Mall', 'city' => 'Casablanca', 'hall_name' => 'Salle Rif', 'price' => 90, 'seating_enabled' => false, 'seat_template' => 'small', 'reserved_seats' => json_encode([]), 'updated_at' => now(), 'created_at' => now()]);
        }

        foreach ([
            ['run-casablanca-10k', 'Casablanca 10K Night Run', 'Running nocturne sur la corniche.', now()->addDay(), 'Corniche Ain Diab', 'sport', 80, 'https://picsum.photos/seed/run-casa/1200/700'],
            ['raja-wydad-derby-demo', 'Derby football premium demo', 'Match sport en billets normaux.', now()->addWeek(), 'Stade Mohammed V', 'sport', 160, 'https://picsum.photos/seed/derby-demo/1200/700'],
            ['jazz-rabat-normal-demo', 'Jazz Rabat normal ticket', 'Concert sans plan pour tester le mode normal.', now()->addDays(3), 'Théâtre National Mohammed V', 'concert', 220, 'https://picsum.photos/seed/jazz-rabat/1200/700'],
        ] as [$slug, $title, $description, $date, $venue, $type, $price, $image]) {
            Event::query()->updateOrCreate(['slug' => $slug], [
                'category_id' => $type === 'sport' ? $sportCategory?->id : $concertCategory?->id,
                'city_id' => $city->id,
                'organizer_id' => $organizer->id,
                'organizer' => 'Guichet Organizer',
                'title' => $title,
                'short_description' => Str::limit($description, 110),
                'description' => $description,
                'city_name' => 'Casablanca',
                'venue' => $venue,
                'address' => $venue,
                'event_date' => $date->toDateString(),
                'event_time' => '20:00:00',
                'image_url' => $image,
                'image' => $image,
                'type' => $type,
                'buying_mode' => 'ticket',
                'plan_type' => null,
                'has_plan' => false,
                'seating_enabled' => false,
                'status' => 'published',
                'featured' => false,
                'starts_at' => $date,
                'price_mad' => $price,
            ]);
        }

        foreach ([
            ['istanbul-sharm-demo', 'ISTANBUL & SHARM EL SHEIKH 11 jours', 'Last Minute', 'Istanbul', now()->addDays(8), 7900, 'https://picsum.photos/seed/istanbul-sharm/1200/700'],
            ['splendeurs-europe-demo', 'Splendeurs France Suisse Italie', 'Voyage organisé', 'Paris', now()->addWeeks(3), 13900, 'https://picsum.photos/seed/europe-trip/1200/700'],
            ['jordanie-merveilles-demo', 'Jordanie, terre de merveilles', 'Voyage thématique', 'Amman', now()->addMonth(), 17500, 'https://picsum.photos/seed/jordan-trip/1200/700'],
        ] as [$slug, $title, $category, $destination, $departureDate, $price, $image]) {
            DB::table('travels')->updateOrInsert(['slug' => $slug], ['title' => $title, 'category' => $category, 'destination' => $destination, 'departure_date' => $departureDate->toDateString(), 'price' => $price, 'image' => $image, 'description' => 'Voyage démo avec image et date dynamique.', 'status' => 'published', 'updated_at' => now(), 'created_at' => now()]);
        }

        foreach ([
            ['desert-premium', 'Voyage désert premium', 'Voyage organisé', 'Merzouga', now()->addMonth(), 4200, 'https://picsum.photos/seed/travel/1200/700'],
        ] as [$slug, $title, $category, $destination, $departureDate, $price, $image]) {
            DB::table('travels')->updateOrInsert(['slug' => $slug], ['title' => $title, 'category' => $category, 'destination' => $destination, 'departure_date' => $departureDate->toDateString(), 'price' => $price, 'image' => $image, 'description' => 'Road trip premium.', 'status' => 'published', 'updated_at' => now(), 'created_at' => now()]);
        }

        foreach ([
            ['atlas-quest', 'Atlas Quest', 'Aventure', '1h52', now()->subDays(2), 'https://picsum.photos/seed/atlas-quest/900/1200'],
            ['marrakech-lights', 'Marrakech Lights', 'Comédie', '1h38', now()->subWeek(), 'https://picsum.photos/seed/marrakech-lights/900/1200'],
            ['future-medina', 'Future Medina', 'Science-fiction', '2h04', now()->addDays(4), 'https://picsum.photos/seed/future-medina/900/1200'],
        ] as [$slug, $title, $genre, $duration, $releaseDate, $poster]) {
            DB::table('movies')->updateOrInsert(['slug' => $slug], ['title' => $title, 'genre' => $genre, 'duration' => $duration, 'release_date' => $releaseDate->toDateString(), 'poster' => $poster, 'synopsis' => 'Film démo publié avec séances.', 'status' => 'published', 'featured' => $slug === 'atlas-quest', 'updated_at' => now(), 'created_at' => now()]);
            $seedMovie = DB::table('movies')->where('slug', $slug)->first();
            if ($seedMovie) {
                DB::table('movie_sessions')->updateOrInsert(['movie_id' => $seedMovie->id, 'session_date' => now()->toDateString(), 'session_time' => '18:00'], ['cinema' => 'Megarama', 'city' => 'Casablanca', 'hall_name' => 'Salle Atlas', 'price' => 70, 'seating_enabled' => $slug === 'atlas-quest', 'seat_template' => $slug === 'atlas-quest' ? 'medium' : 'small', 'reserved_seats' => json_encode(['A6', 'C4']), 'updated_at' => now(), 'created_at' => now()]);
                DB::table('movie_sessions')->updateOrInsert(['movie_id' => $seedMovie->id, 'session_date' => now()->addDays(2)->toDateString(), 'session_time' => '20:45'], ['cinema' => 'Pathé Californie', 'city' => 'Casablanca', 'hall_name' => 'Salle Rif', 'price' => 85, 'seating_enabled' => false, 'seat_template' => 'small', 'reserved_seats' => json_encode([]), 'updated_at' => now(), 'created_at' => now()]);
            }
        }

        DB::table('payouts')->updateOrInsert(['reference' => 'PAYOUT-0001'], ['organizer_id' => $organizer->id, 'amount' => 12000, 'status' => 'pending', 'payout_date' => now()->addDays(5)->toDateString(), 'updated_at' => now(), 'created_at' => now()]);
        DB::table('content_blocks')->updateOrInsert(['title' => 'Hero Home'], ['type' => 'banner', 'subtitle' => 'Nouvelle saison', 'image' => 'https://picsum.photos/seed/banner/1200/400', 'visible' => true, 'display_order' => 1, 'updated_at' => now(), 'created_at' => now()]);

        DB::table('settings')->updateOrInsert(['key' => 'platform_name'], ['value' => 'Guichet Marketplace', 'updated_at' => now(), 'created_at' => now()]);

        DB::table('orders')->updateOrInsert(['reference' => 'CMD-DEMO-001'], [
            'user_id' => $client->id,
            'organizer_id' => $organizer->id,
            'total' => 200,
            'payment_status' => 'paid',
            'status' => 'paid',
            'customer' => json_encode(['firstName' => 'Client', 'lastName' => 'User']),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $orderId = DB::table('orders')->where('reference', 'CMD-DEMO-001')->value('id');
        if ($orderId) {
            DB::table('order_items')->where('order_id', $orderId)->delete();
            $itemId = DB::table('order_items')->insertGetId(['order_id' => $orderId, 'product_type' => 'event_ticket', 'product_id' => (string) $sportEvent->id, 'title' => $sportEvent->title, 'quantity' => 2, 'unit_price' => 100, 'subtotal' => 200, 'selected_zone' => 'Tribune A', 'metadata' => json_encode(['seed' => true]), 'created_at' => now(), 'updated_at' => now()]);
            DB::table('tickets')->updateOrInsert(['ticket_number' => 'TKT-DEMO-0001'], ['order_item_id' => $itemId, 'qr_code' => 'QR-DEMO-0001', 'created_at' => now(), 'updated_at' => now()]);
        }
    }
}
