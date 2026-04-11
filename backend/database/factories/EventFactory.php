<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\City;
use App\Models\Event;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Event>
 */
class EventFactory extends Factory
{
    protected $model = Event::class;

    public function definition(): array
    {
        $title = fake()->sentence(3);
        $isFree = fake()->boolean(15);

        return [
            'category_id' => Category::factory(),
            'city_id' => City::factory(),
            'organizer' => fake()->company(),
            'title' => $title,
            'slug' => Str::slug($title . '-' . fake()->unique()->numberBetween(10, 9999)),
            'venue' => fake()->streetName() . ' Hall',
            'description' => fake()->paragraph(5),
            'image_url' => 'https://picsum.photos/seed/' . fake()->unique()->numberBetween(1, 99999) . '/800/500',
            'starts_at' => fake()->dateTimeBetween('+1 days', '+2 months'),
            'price_mad' => $isFree ? 0 : fake()->randomFloat(2, 80, 1200),
            'is_sold_out' => fake()->boolean(15),
            'is_free' => $isFree,
        ];
    }
}
