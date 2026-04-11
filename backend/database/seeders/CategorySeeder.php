<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Concert', 'slug' => 'concert'],
            ['name' => 'Humour', 'slug' => 'humour'],
            ['name' => 'Festival', 'slug' => 'festival'],
            ['name' => 'Gala', 'slug' => 'gala'],
            ['name' => 'Sport', 'slug' => 'sport'],
            ['name' => 'Expo', 'slug' => 'expo'],
            ['name' => 'Meetup Créateurs', 'slug' => 'meetup-createurs'],
            ['name' => 'Tribute Show', 'slug' => 'tribute-show'],
        ];

        Category::query()->upsert($categories, ['slug'], ['name']);
    }
}
