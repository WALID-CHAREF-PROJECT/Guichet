<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\EventResource;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class EventController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Event::query()->with(['category', 'city']);

        if ($search = $request->string('search')->toString()) {
            $query->where('title', 'like', "%{$search}%");
        }

        if ($category = $request->string('category')->toString()) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $category));
        }

        if ($city = $request->string('city')->toString()) {
            $query->whereHas('city', fn ($q) => $q->where('slug', $city));
        }

        if ($quick = $request->string('quick_date')->toString()) {
            $start = Carbon::now()->startOfDay();
            $end = match ($quick) {
                'today' => Carbon::now()->endOfDay(),
                'weekend' => Carbon::now()->next('Saturday')->endOfDay(),
                '7d' => Carbon::now()->addDays(7)->endOfDay(),
                '30d' => Carbon::now()->addDays(30)->endOfDay(),
                default => null,
            };

            if ($end) {
                $query->whereBetween('starts_at', [$start, $end]);
            }
        }

        if ($from = $request->string('date_from')->toString()) {
            $query->whereDate('starts_at', '>=', $from);
        }

        if ($to = $request->string('date_to')->toString()) {
            $query->whereDate('starts_at', '<=', $to);
        }

        match ($request->string('sort')->toString()) {
            'date_desc' => $query->orderByDesc('starts_at'),
            'price_asc' => $query->orderBy('price_mad'),
            'price_desc' => $query->orderByDesc('price_mad'),
            default => $query->orderBy('starts_at'),
        };

        $events = $query->paginate((int) $request->integer('per_page', 12));

        return response()->json([
            'data' => EventResource::collection($events->getCollection()),
            'meta' => [
                'current_page' => $events->currentPage(),
                'last_page' => $events->lastPage(),
                'per_page' => $events->perPage(),
                'total' => $events->total(),
            ],
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $event = Event::query()->with(['category', 'city'])->where('slug', $slug)->firstOrFail();

        return response()->json([
            'data' => new EventResource($event),
        ]);
    }
}
