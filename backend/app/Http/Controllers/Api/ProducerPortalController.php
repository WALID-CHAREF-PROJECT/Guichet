<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Producer;
use App\Models\ProducerPackSubscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProducerPortalController extends Controller
{
    public function dashboard(Request $request): JsonResponse
    {
        $producer = Producer::query()->where('user_id', $request->user()->id)->first();
        if (!$producer) {
            return response()->json([
                'producer' => null,
                'pack' => null,
                'quota' => [
                    'max_events_per_month' => null,
                    'used_events_this_month' => 0,
                    'max_active_events' => null,
                    'active_events_count' => 0,
                    'can_create_event' => true,
                ],
            ]);
        }

        $activeSubscription = $this->activeSubscription($producer->id);

        $quota = $this->buildQuota($request->user()->id, $activeSubscription);

        return response()->json([
            'producer' => $producer,
            'pack' => $activeSubscription?->pack,
            'quota' => $quota,
        ]);
    }

    public function events(Request $request): JsonResponse
    {
        $events = Event::query()
            ->where('organizer_id', $request->user()->id)
            ->latest('starts_at')
            ->get();

        return response()->json($events);
    }

    public function storeEvent(Request $request): JsonResponse
    {
        $producer = Producer::query()->where('user_id', $request->user()->id)->first();
        if (!$producer) {
            return response()->json(['message' => 'Aucun profil producteur lié à cet utilisateur.'], 422);
        }

        $subscription = $this->activeSubscription($producer->id);
        $quota = $this->buildQuota($request->user()->id, $subscription);
        if (!$quota['can_create_event']) {
            return response()->json([
                'message' => 'Quota de pack atteint. Veuillez changer de pack.',
                'quota' => $quota,
            ], 422);
        }

        $data = $request->validate([
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'city_id' => ['required', 'integer', 'exists:cities,id'],
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'venue' => ['required', 'string', 'max:255'],
            'city_name' => ['nullable', 'string', 'max:255'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'description' => ['required', 'string'],
            'starts_at' => ['required', 'date'],
            'event_date' => ['nullable', 'date'],
            'event_time' => ['nullable', 'date_format:H:i'],
            'price_mad' => ['nullable', 'numeric', 'min:0'],
            'image_url' => ['nullable', 'string', 'max:2048'],
            'featured_image' => ['nullable', 'string', 'max:2048'],
            'status' => ['nullable', 'in:draft,published,archived'],
            'ticket_types' => ['nullable', 'array'],
            'ticket_types.*.stock' => ['nullable', 'integer', 'min:0'],
            'is_free' => ['sometimes', 'boolean'],
        ]);

        $ticketStock = collect($data['ticket_types'] ?? [])->sum(fn ($ticket) => (int) ($ticket['stock'] ?? 0));
        $stockLimit = ($subscription?->pack?->max_active_events ?? 0) * 1000;
        if ($stockLimit > 0 && $ticketStock > $stockLimit) {
            return response()->json(['message' => 'Votre pack ne permet pas d’ajouter autant de tickets.'], 422);
        }

        $slugBase = Str::slug($data['slug'] ?? $data['title']);
        $slug = $slugBase;
        $suffix = 1;
        while (Event::query()->where('slug', $slug)->exists()) {
            $slug = $slugBase . '-' . $suffix;
            $suffix++;
        }

        $event = Event::query()->create([
            'organizer_id' => $request->user()->id,
            'organizer' => $producer->name,
            'category_id' => $data['category_id'],
            'city_id' => $data['city_id'],
            'title' => $data['title'],
            'slug' => $slug,
            'short_description' => $data['short_description'] ?? null,
            'city_name' => $data['city_name'] ?? null,
            'venue' => $data['venue'],
            'description' => $data['description'],
            'starts_at' => $data['starts_at'],
            'event_date' => $data['event_date'] ?? date('Y-m-d', strtotime($data['starts_at'])),
            'event_time' => $data['event_time'] ?? date('H:i', strtotime($data['starts_at'])),
            'price_mad' => $data['price_mad'] ?? 0,
            'is_free' => $data['is_free'] ?? false,
            'status' => $data['status'] ?? 'draft',
            'image_url' => $data['image_url'] ?? 'https://placehold.co/1200x800?text=Event',
            'hero_image' => $data['featured_image'] ?? ($data['image_url'] ?? 'https://placehold.co/1200x800?text=Event'),
            'image' => $data['image_url'] ?? 'https://placehold.co/1200x800?text=Event',
        ]);

        return response()->json(['event' => $event, 'quota' => $this->buildQuota($request->user()->id, $subscription)], 201);
    }

    private function activeSubscription(int $producerId): ?ProducerPackSubscription
    {
        return ProducerPackSubscription::query()
            ->with('pack')
            ->where('producer_id', $producerId)
            ->where('status', 'active')
            ->where('starts_at', '<=', now())
            ->where(function ($q): void {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', now());
            })
            ->latest('starts_at')
            ->first();
    }

    private function buildQuota(int $userId, ?ProducerPackSubscription $subscription): array
    {
        $monthStart = now()->copy()->startOfMonth();
        $monthEnd = now()->copy()->endOfMonth();

        $usedThisMonth = Event::query()
            ->where('organizer_id', $userId)
            ->whereBetween('created_at', [$monthStart, $monthEnd])
            ->count();

        $activeEvents = Event::query()
            ->where('organizer_id', $userId)
            ->where('starts_at', '>=', now())
            ->count();

        $maxMonthly = $subscription?->pack?->max_events_per_month;
        $maxActive = $subscription?->pack?->max_active_events;

        $canCreateByMonth = $maxMonthly === null || $usedThisMonth < $maxMonthly;
        $canCreateByActive = $maxActive === null || $activeEvents < $maxActive;

        return [
            'max_events_per_month' => $maxMonthly,
            'used_events_this_month' => $usedThisMonth,
            'max_active_events' => $maxActive,
            'active_events_count' => $activeEvents,
            'can_create_event' => $canCreateByMonth && $canCreateByActive,
        ];
    }
}
