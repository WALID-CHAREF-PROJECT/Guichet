<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pack;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PackController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Pack::query()->latest()->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:255', 'unique:packs,code'],
            'max_events_per_month' => ['nullable', 'integer', 'min:1'],
            'max_active_events' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['sometimes', 'boolean'],
            'description' => ['nullable', 'string'],
        ]);

        $pack = Pack::query()->create($data);

        return response()->json($pack, 201);
    }

    public function show(Pack $pack): JsonResponse
    {
        return response()->json($pack);
    }

    public function update(Request $request, Pack $pack): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'code' => ['sometimes', 'string', 'max:255', 'unique:packs,code,' . $pack->id],
            'max_events_per_month' => ['nullable', 'integer', 'min:1'],
            'max_active_events' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['sometimes', 'boolean'],
            'description' => ['nullable', 'string'],
        ]);

        $pack->update($data);

        return response()->json($pack->fresh());
    }

    public function destroy(Pack $pack): JsonResponse
    {
        $pack->delete();

        return response()->json(['success' => true]);
    }
}
