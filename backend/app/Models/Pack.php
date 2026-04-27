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
        'max_events_per_month',
        'max_active_events',
        'is_active',
        'description',
    ];

    protected $casts = [
        'max_events_per_month' => 'integer',
        'max_active_events' => 'integer',
        'is_active' => 'boolean',
    ];

    public function subscriptions(): HasMany
    {
        return $this->hasMany(ProducerPackSubscription::class);
    }
}
