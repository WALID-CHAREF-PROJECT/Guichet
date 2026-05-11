<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'type' => $this->type ?? 'event',
            'icon' => $this->icon,
            'image' => $this->image,
            'is_active' => (bool) ($this->is_active ?? true),
            'display_order' => (int) ($this->display_order ?? 0),
        ];
    }
}
