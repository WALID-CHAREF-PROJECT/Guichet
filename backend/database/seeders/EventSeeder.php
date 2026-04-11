<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\City;
use App\Models\Event;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            ['concert', 'casablanca', 'Atlas Live', 'Nuit Électro Océan', 'Studio des Arts Ain Diab', 3, 250, false, false],
            ['humour', 'rabat', 'Rire Capital', 'Soirée Stand-up Rabat', 'Théâtre Mohammed V', 5, 180, false, false],
            ['festival', 'marrakech', 'Marrakech Vibes', 'Festival Lumières Rouges', 'Palais des Congrès', 7, 420, false, false],
            ['gala', 'casablanca', 'Fondation Horizon', 'Gala Solidaire Horizon', 'Hôtel Marina', 9, 600, false, false],
            ['sport', 'fes', 'Fès Running Club', 'Semi-Marathon Médina', 'Boulevard Hassan II', 10, 120, false, false],
            ['expo', 'rabat', 'Creative North', 'Expo Design Marocain', 'Galerie Bab Rouah', 12, 90, false, false],
            ['meetup-createurs', 'kenitra', 'Makers Kénitra', 'Meetup Créateurs Digitaux', 'Technopark Kénitra', 14, 0, false, true],
            ['tribute-show', 'marrakech', 'Legacy Stage', 'Hommage aux Classiques', 'Meydene', 16, 220, false, false],
            ['concert', 'rabat', 'Rythme Urbain', 'Jazz sur le Bouregreg', 'Scène OLM', 18, 300, false, false],
            ['festival', 'casablanca', 'Casa Culture', 'Festival Urban Pulse', 'Anfa Park', 20, 350, false, false],
            ['humour', 'kenitra', 'Smile Factory', 'Comedy Night Kénitra', 'Centre Culturel Municipal', 22, 140, false, false],
            ['sport', 'casablanca', 'Derby Events', 'Tournoi Futsal Pro', 'Complexe Sidi Maarouf', 24, 160, false, false],
            ['gala', 'fes', 'Étoile du Cœur', 'Gala Patrimoine Fassi', 'Riad Salam', 26, 480, true, false],
            ['expo', 'marrakech', 'Pixel Atlas', 'Expo Photo Désert', 'Musée de Marrakech', 28, 110, false, false],
            ['tribute-show', 'rabat', 'Vintage Nights', 'Tribute Maghreb Pop', 'Cinéma Renaissance', 31, 200, false, false],
            ['concert', 'casablanca', 'Sunset Records', 'Live Rooftop Sessions', 'Skyline Corniche', 34, 0, false, true],
        ];

        foreach ($items as [$categorySlug, $citySlug, $organizer, $title, $venue, $daysAhead, $price, $soldOut, $isFree]) {
            $category = Category::query()->where('slug', $categorySlug)->firstOrFail();
            $city = City::query()->where('slug', $citySlug)->firstOrFail();

            Event::query()->create([
                'category_id' => $category->id,
                'city_id' => $city->id,
                'organizer' => $organizer,
                'title' => $title,
                'slug' => Str::slug($title),
                'venue' => $venue,
                'description' => 'Une expérience originale TicketFlow avec une ambiance moderne, des performances locales et une billetterie simplifiée.',
                'image_url' => 'https://picsum.photos/seed/' . Str::slug($title) . '/1200/700',
                'starts_at' => Carbon::now()->addDays($daysAhead),
                'price_mad' => $price,
                'is_sold_out' => $soldOut,
                'is_free' => $isFree,
            ]);
        }
    }
}
