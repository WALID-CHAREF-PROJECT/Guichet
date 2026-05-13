<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Producer;
use App\Models\ProducerPackSubscription;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProducerController extends Controller
{
    private function normalizeSlug(string $value): string
    {
        return Str::slug($value) ?: Str::lower(trim($value));
    }

    private function prepareSlug(Request $request): void
    {
        $source = $request->input('slug') ?: $request->input('name');
        if (is_string($source) && trim($source) !== '') {
            $request->merge(['slug' => $this->normalizeSlug($source)]);
        }
    }

    public function index(): JsonResponse
    {
        return response()->json(Producer::query()->latest()->get());
    }

    public function store(Request $request): JsonResponse
    {
        $this->prepareSlug($request);

        $data = $request->validate([
            'firstName' => ['required', 'string', 'max:255'],
            'lastName' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'phone' => ['nullable', 'string', 'max:50'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:producers,slug'],
            'logo' => ['nullable'],
            'cover_image' => ['nullable'],
            'city' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'support_email' => ['nullable', 'email', 'max:255'],
            'support_phone' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
            'pack_id' => ['nullable', 'integer', 'exists:packs,id'],
            'subscription_starts_at' => ['nullable', 'date'],
            'subscription_ends_at' => ['nullable', 'date', 'after_or_equal:subscription_starts_at'],
        ]);

        if ($request->hasFile('logo')) {
            $data['logo'] = Storage::url($request->file('logo')->store('admin/producers/logos', 'public'));
        }
        if ($request->hasFile('cover_image')) {
            $data['cover_image'] = Storage::url($request->file('cover_image')->store('admin/producers/covers', 'public'));
        }

        $producer = DB::transaction(function () use ($data): Producer {
            $user = User::query()->create([
                'name' => trim($data['firstName'] . ' ' . $data['lastName']),
                'role' => 'producer',
                'first_name' => $data['firstName'],
                'last_name' => $data['lastName'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'phone' => $data['phone'] ?? null,
                'company_name' => $data['name'],
                'organization_slug' => $data['slug'],
                'is_active' => $data['is_active'] ?? true,
                'api_token' => Str::random(60),
            ]);

            DB::table('organizers')->updateOrInsert(
                ['user_id' => $user->id],
                [
                    'company_name' => $data['name'],
                    'slug' => $data['slug'],
                    'logo' => $data['logo'] ?? null,
                    'cover_image' => $data['cover_image'] ?? null,
                    'city' => $data['city'] ?? null,
                    'address' => $data['address'] ?? null,
                    'support_email' => $data['support_email'] ?? $data['email'],
                    'support_phone' => $data['support_phone'] ?? ($data['phone'] ?? null),
                    'description' => $data['description'] ?? null,
                    'is_approved' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );

            $producer = Producer::query()->create([
                'user_id' => $user->id,
                'name' => $data['name'],
                'slug' => $data['slug'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'logo' => $data['logo'] ?? null,
                'cover_image' => $data['cover_image'] ?? null,
                'city' => $data['city'] ?? null,
                'address' => $data['address'] ?? null,
                'support_email' => $data['support_email'] ?? null,
                'support_phone' => $data['support_phone'] ?? null,
                'description' => $data['description'] ?? null,
                'is_active' => $data['is_active'] ?? true,
            ]);

            if (!empty($data['pack_id'])) {
                ProducerPackSubscription::query()->create([
                    'producer_id' => $producer->id,
                    'pack_id' => $data['pack_id'],
                    'starts_at' => $data['subscription_starts_at'] ?? now(),
                    'ends_at' => $data['subscription_ends_at'] ?? null,
                    'status' => 'active',
                ]);
            }

            return $producer;
        });

        return response()->json($producer, 201);
    }

    public function show(Producer $producer): JsonResponse
    {
        return response()->json($producer->load(['subscriptions.pack']));
    }

    public function update(Request $request, Producer $producer): JsonResponse
    {
        $this->prepareSlug($request);

        $data = $request->validate([
            'user_id' => ['nullable', 'integer', 'exists:users,id', 'unique:producers,user_id,' . $producer->id],
            'name' => ['sometimes', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255', 'unique:producers,slug,' . $producer->id],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'logo' => ['nullable'],
            'cover_image' => ['nullable'],
            'city' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'support_email' => ['nullable', 'email', 'max:255'],
            'support_phone' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        if ($request->hasFile('logo')) {
            $data['logo'] = Storage::url($request->file('logo')->store('admin/producers/logos', 'public'));
        }
        if ($request->hasFile('cover_image')) {
            $data['cover_image'] = Storage::url($request->file('cover_image')->store('admin/producers/covers', 'public'));
        }

        DB::transaction(function () use ($producer, $data): void {
            $producer->update($data);

            if ($producer->user_id) {
                $organizerUpdates = [];
                if (array_key_exists('name', $data)) {
                    $organizerUpdates['company_name'] = $data['name'];
                }
                if (array_key_exists('slug', $data)) {
                    $organizerUpdates['slug'] = $data['slug'];
                }
                foreach (['logo', 'cover_image', 'city', 'address', 'description', 'support_email', 'support_phone'] as $field) {
                    if (array_key_exists($field, $data)) {
                        $organizerUpdates[$field] = $data[$field];
                    }
                }
                if (array_key_exists('is_active', $data)) {
                    $organizerUpdates['is_approved'] = (bool) $data['is_active'];
                }
                if ($organizerUpdates) {
                    $organizerUpdates['company_name'] ??= $producer->name;
                    $organizerUpdates['slug'] ??= $producer->slug;
                    $organizerUpdates['updated_at'] = now();
                    DB::table('organizers')->updateOrInsert(['user_id' => $producer->user_id], array_merge($organizerUpdates, ['created_at' => now()]));
                }

                User::query()->whereKey($producer->user_id)->update(array_filter([
                    'company_name' => $data['name'] ?? null,
                    'organization_slug' => $data['slug'] ?? null,
                    'is_active' => array_key_exists('is_active', $data) ? (bool) $data['is_active'] : null,
                ], fn ($value) => $value !== null));
            }
        });

        return response()->json($producer->fresh());
    }

    public function destroy(Producer $producer): JsonResponse
    {
        $producer->delete();

        return response()->json(['success' => true]);
    }
}
