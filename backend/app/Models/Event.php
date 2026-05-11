<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'organizer_id',
        'category_id',
        'city_id',
        'organizer',
        'title',
        'short_description',
        'slug',
        'city_name',
        'venue',
        'address',
        'event_date',
        'event_time',
        'description',
        'image_url',
        'image',
        'hero_image',
        'type',
        'buying_mode',
        'plan_type',
        'has_plan',
        'seating_enabled',
        'status',
        'featured',
        'starts_at',
        'price_mad',
        'is_sold_out',
        'is_free',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'event_date' => 'date',
        'price_mad' => 'decimal:2',
        'is_sold_out' => 'boolean',
        'is_free' => 'boolean',
        'has_plan' => 'boolean',
        'seating_enabled' => 'boolean',
        'featured' => 'boolean',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }
}
