<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Producer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProducerController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Producer::query()->latest()->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'user_id' => ['nullable', 'integer', 'exists:users,id', 'unique:producers,user_id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:producers,slug'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $producer = Producer::query()->create($data);

        return response()->json($producer, 201);
    }

    public function show(Producer $producer): JsonResponse
    {
        return response()->json($producer->load(['subscriptions.pack']));
    }

    public function update(Request $request, Producer $producer): JsonResponse
    {
        $data = $request->validate([
            'user_id' => ['nullable', 'integer', 'exists:users,id', 'unique:producers,user_id,' . $producer->id],
            'name' => ['sometimes', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255', 'unique:producers,slug,' . $producer->id],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $producer->update($data);

        return response()->json($producer->fresh());
    }

    public function destroy(Producer $producer): JsonResponse
    {
        $producer->delete();

        return response()->json(['success' => true]);
    }
}
