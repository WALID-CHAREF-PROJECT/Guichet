<?php

namespace Database\Seeders;

use App\Models\City;
use Illuminate\Database\Seeder;

class CitySeeder extends Seeder
{
    public function run(): void
    {
        $cities = [
            ['name' => 'Casablanca', 'slug' => 'casablanca'],
            ['name' => 'Rabat', 'slug' => 'rabat'],
            ['name' => 'Marrakech', 'slug' => 'marrakech'],
            ['name' => 'Fès', 'slug' => 'fes'],
            ['name' => 'Kénitra', 'slug' => 'kenitra'],
        ];

        City::query()->upsert($cities, ['slug'], ['name']);
    }
}
