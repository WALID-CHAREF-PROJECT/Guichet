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

        if ($quick = $request->string('date_filter')->toString() ?: $request->string('quick_date')->toString()) {
            $today = Carbon::today();
            [$rangeStart, $rangeEnd] = match ($quick) {
                'today' => [$today->copy(), $today->copy()],
                'tomorrow' => [$today->copy()->addDay(), $today->copy()->addDay()],
                'week' => [$today->copy(), $today->copy()->endOfWeek()->startOfDay()],
                'month' => [$today->copy()->startOfMonth(), $today->copy()->endOfMonth()->startOfDay()],
                'weekend' => [$today->copy()->startOfWeek()->addDays(5), $today->copy()->startOfWeek()->addDays(6)],
                '7d' => [$today->copy(), $today->copy()->addDays(7)],
                '30d' => [$today->copy(), $today->copy()->addDays(30)],
                default => [null, null],
            };

            if ($rangeStart && $rangeEnd) {
                $startDate = $rangeStart->toDateString();
                $endDate = $rangeEnd->toDateString();
                $query->where(function ($dateQuery) use ($startDate, $endDate): void {
                    $dateQuery
                        ->whereBetween('event_date', [$startDate, $endDate])
                        ->orWhere(function ($fallbackQuery) use ($startDate, $endDate): void {
                            $fallbackQuery
                                ->whereNull('event_date')
                                ->whereDate('starts_at', '>=', $startDate)
                                ->whereDate('starts_at', '<=', $endDate);
                        });
                });
            }
        }

        if ($from = $request->string('date_from')->toString()) {
            $query->where(function ($dateQuery) use ($from): void {
                $dateQuery->whereDate('event_date', '>=', $from)->orWhere(fn ($fallbackQuery) => $fallbackQuery->whereNull('event_date')->whereDate('starts_at', '>=', $from));
            });
        }

        if ($to = $request->string('date_to')->toString()) {
            $query->where(function ($dateQuery) use ($to): void {
                $dateQuery->whereDate('event_date', '<=', $to)->orWhere(fn ($fallbackQuery) => $fallbackQuery->whereNull('event_date')->whereDate('starts_at', '<=', $to));
            });
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
