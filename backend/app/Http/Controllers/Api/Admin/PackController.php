<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pack;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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
            'slug' => ['nullable', 'string', 'max:255'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'billing_type' => ['nullable', 'in:monthly,yearly,custom'],
            'max_events_per_month' => ['nullable', 'integer', 'min:1'],
            'max_active_events' => ['nullable', 'integer', 'min:1'],
            'quotas' => ['nullable'],
            'features' => ['nullable', 'array'],
            'features.*' => ['string', 'max:255'],
            'image' => ['nullable'],
            'is_active' => ['sometimes', 'boolean'],
            'is_featured' => ['sometimes', 'boolean'],
            'description' => ['nullable', 'string'],
        ]);

        if ($request->hasFile('image')) {
            $data['image'] = Storage::url($request->file('image')->store('admin/packs', 'public'));
        }

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
            'slug' => ['nullable', 'string', 'max:255'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'billing_type' => ['nullable', 'in:monthly,yearly,custom'],
            'max_events_per_month' => ['nullable', 'integer', 'min:1'],
            'max_active_events' => ['nullable', 'integer', 'min:1'],
            'quotas' => ['nullable'],
            'features' => ['nullable', 'array'],
            'features.*' => ['string', 'max:255'],
            'image' => ['nullable'],
            'is_active' => ['sometimes', 'boolean'],
            'is_featured' => ['sometimes', 'boolean'],
            'description' => ['nullable', 'string'],
        ]);

        if ($request->hasFile('image')) {
            $data['image'] = Storage::url($request->file('image')->store('admin/packs', 'public'));
        }

        $pack->update($data);

        return response()->json($pack->fresh());
    }

    public function destroy(Pack $pack): JsonResponse
    {
        $pack->delete();

        return response()->json(['success' => true]);
    }
}
