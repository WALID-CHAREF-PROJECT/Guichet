<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'city_id',
        'organizer',
        'title',
        'slug',
        'venue',
        'description',
        'image_url',
        'starts_at',
        'price_mad',
        'is_sold_out',
        'is_free',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'price_mad' => 'decimal:2',
        'is_sold_out' => 'boolean',
        'is_free' => 'boolean',
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
