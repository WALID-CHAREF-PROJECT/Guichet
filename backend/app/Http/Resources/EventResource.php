<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'organizer' => $this->organizer,
            'title' => $this->title,
            'venue' => $this->venue,
            'city' => [
                'id' => $this->city->id,
                'name' => $this->city->name,
                'slug' => $this->city->slug,
            ],
            'category' => [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ],
            'description' => $this->description,
            'image_url' => $this->image_url,
            'starts_at' => $this->starts_at?->toIso8601String(),
            'starts_at_human' => $this->starts_at?->locale('fr')->isoFormat('dddd D MMMM YYYY, HH:mm'),
            'price_mad' => (float) $this->price_mad,
            'is_free' => $this->is_free,
            'is_sold_out' => $this->is_sold_out,
            'badge' => $this->is_sold_out ? 'Complet' : ($this->is_free ? 'Gratuit' : null),
        ];
    }
}
