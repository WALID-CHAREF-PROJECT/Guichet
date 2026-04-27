<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Producer;
use App\Models\ProducerPackSubscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProducerPackSubscriptionController extends Controller
{
    public function assignOrChange(Request $request, Producer $producer): JsonResponse
    {
        $data = $request->validate([
            'pack_id' => ['required', 'integer', 'exists:packs,id'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
        ]);

        $startsAt = $data['starts_at'] ?? now();

        $subscription = DB::transaction(function () use ($producer, $data, $startsAt) {
            ProducerPackSubscription::query()
                ->where('producer_id', $producer->id)
                ->where('status', 'active')
                ->update([
                    'status' => 'inactive',
                    'ends_at' => now(),
                    'updated_at' => now(),
                ]);

            return ProducerPackSubscription::query()->create([
                'producer_id' => $producer->id,
                'pack_id' => $data['pack_id'],
                'starts_at' => $startsAt,
                'ends_at' => $data['ends_at'] ?? null,
                'status' => 'active',
            ]);
        });

        return response()->json($subscription->load('pack'));
    }
}
