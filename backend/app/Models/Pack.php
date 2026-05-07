<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pack extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'slug',
        'price',
        'billing_type',
        'max_events_per_month',
        'max_active_events',
        'quotas',
        'features',
        'image',
        'is_active',
        'is_featured',
        'description',
    ];

    protected $casts = [
        'max_events_per_month' => 'integer',
        'max_active_events' => 'integer',
        'quotas' => 'array',
        'features' => 'array',
        'price' => 'decimal:2',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
    ];

    public function subscriptions(): HasMany
    {
        return $this->hasMany(ProducerPackSubscription::class);
    }
}
