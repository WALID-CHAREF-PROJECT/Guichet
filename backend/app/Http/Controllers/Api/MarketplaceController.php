<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Str;

class MarketplaceController extends Controller
{
    private function userPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'role' => $user->role,
            'firstName' => $user->first_name ?? $user->firstName ?? '',
            'lastName' => $user->last_name ?? $user->lastName ?? '',
            'email' => $user->email,
            'phone' => $user->phone,
            'avatar' => $user->avatar,
            'companyName' => $user->company_name,
            'organizationSlug' => $user->organization_slug,
            'isActive' => (bool) $user->is_active,
        ];
    }


    private function publicUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        if (Str::startsWith($path, ['http://', 'https://', 'data:'])) {
            return $path;
        }

        $normalized = Str::startsWith($path, '/') ? $path : '/storage/'.ltrim($path, '/');
        return request()->getSchemeAndHttpHost().$normalized;
    }

    private function isFeatured(mixed $value): bool
    {
        return in_array($value, [true, 1, '1', 'true'], true);
    }


    private function applyEventDateFilter($query, ?string $filter): void
    {
        $today = Carbon::today();
        [$start, $end] = match ($filter) {
            'today' => [$today->copy(), $today->copy()],
            'tomorrow' => [$today->copy()->addDay(), $today->copy()->addDay()],
            'week' => [$today->copy(), $today->copy()->endOfWeek()->startOfDay()],
            'weekend' => [$today->copy()->startOfWeek()->addDays(5), $today->copy()->startOfWeek()->addDays(6)],
            'month' => [$today->copy()->startOfMonth(), $today->copy()->endOfMonth()->startOfDay()],
            default => [null, null],
        };

        if (!$start || !$end) {
            return;
        }

        $startDate = $start->toDateString();
        $endDate = $end->toDateString();

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

    private function mapPublicPlanZone(object $zone, ?string $fallbackPlanType = null): array
    {
        return [
            'id' => 'zone_'.$zone->id,
            'name' => $zone->name,
            'label' => $zone->label ?: $zone->name,
            'price' => (float) $zone->price,
            'available' => (bool) $zone->is_available && $zone->available_capacity > 0,
            'capacity' => (int) $zone->capacity,
            'availableCapacity' => (int) $zone->available_capacity,
            'available_capacity' => (int) $zone->available_capacity,
            'color' => $zone->color ?: '#f97316',
            'planType' => $zone->plan_type ?: $fallbackPlanType ?: 'generic',
            'plan_type' => $zone->plan_type ?: $fallbackPlanType ?: 'generic',
            'sortOrder' => (int) ($zone->sort_order ?? 0),
            'sort_order' => (int) ($zone->sort_order ?? 0),
        ];
    }

    private function eventActivePlanZones(int|string $eventId, ?string $planType = null)
    {
        return DB::table('sport_plan_zones')
            ->where('event_id', $eventId)
            ->where('is_available', true)
            ->where('available_capacity', '>', 0)
            ->when($planType, fn ($query) => $query->where('plan_type', $planType))
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
    }

    private function mapPublicEvent(Event $event): array
    {
        $date = $event->event_date ?: $event->starts_at?->toDateString();
        $time = $event->event_time ?: $event->starts_at?->format('H:i');
        $image = $this->publicUrl($event->hero_image ?: $event->image ?: $event->image_url);
        $cityName = $event->city->name ?? $event->city_name ?? '';
        $categoryName = $event->category->name ?? null;
        $categorySlug = $event->category->slug ?? null;
        $buyingMode = $event->buying_mode ?: 'ticket';
        $zones = $buyingMode === 'plan' ? $this->eventActivePlanZones($event->id, $event->plan_type) : collect();
        $inferredPlanType = $event->plan_type ?: ($zones->first()->plan_type ?? null);
        $hasPlan = $buyingMode === 'plan' && (bool) $inferredPlanType && ((bool) $event->has_plan || $zones->isNotEmpty());
        $seatingEnabled = $hasPlan && ((bool) $event->seating_enabled || $zones->isNotEmpty());
        $planZones = $hasPlan ? $zones->map(fn ($zone) => $this->mapPublicPlanZone($zone, $inferredPlanType))->values() : collect();

        return [
            'id' => (string) $event->id,
            'slug' => $event->slug,
            'title' => $event->title,
            'organizer' => $event->organizer,
            'description' => $event->description,
            'venue' => $event->venue,
            'location' => trim(collect([$event->venue, $cityName])->filter()->implode(' · ')),
            'city' => ['id' => (string) $event->city_id, 'name' => $cityName, 'slug' => $event->city->slug ?? null],
            'category' => ['id' => (string) $event->category_id, 'name' => $categoryName, 'slug' => $categorySlug],
            'image_url' => $image,
            'image' => $image,
            'hero_image' => $image,
            'starts_at' => $event->starts_at?->toIso8601String(),
            'starts_at_human' => trim(($date ?? '').' '.($time ?? '')),
            'date' => $date,
            'time' => $time,
            'price_mad' => (float) $event->price_mad,
            'price' => (float) $event->price_mad,
            'is_free' => (bool) $event->is_free,
            'is_sold_out' => (bool) $event->is_sold_out,
            'badge' => $event->is_sold_out ? 'Complet' : ($event->is_free ? 'Gratuit' : null),
            'type' => $event->type,
            'tags' => array_values(array_filter([$event->type, $categorySlug])),
            'buyingMode' => $hasPlan ? 'plan' : $buyingMode,
            'buying_mode' => $hasPlan ? 'plan' : $buyingMode,
            'hasPlan' => $hasPlan,
            'has_plan' => $hasPlan,
            'planType' => $hasPlan ? $inferredPlanType : null,
            'plan_type' => $hasPlan ? $inferredPlanType : null,
            'seatingEnabled' => $seatingEnabled,
            'seating_enabled' => $seatingEnabled,
            'zones' => $planZones,
            'featured' => (bool) $event->featured,
            'status' => $event->status,
        ];
    }

    private function mapPublicTravel(object $travel): array
    {
        $gallery = [];
        if (!empty($travel->gallery)) {
            $decoded = json_decode((string) $travel->gallery, true);
            $gallery = is_array($decoded) ? $decoded : [];
        }
        $image = $this->publicUrl($travel->image ?? null);

        return [
            'id' => (string) $travel->id,
            'slug' => $travel->slug,
            'title' => $travel->title,
            'category' => $travel->category,
            'collection' => $travel->category,
            'destination' => $travel->destination,
            'location' => $travel->destination,
            'departure_date' => $travel->departure_date,
            'departureDate' => $travel->departure_date,
            'price' => (float) $travel->price,
            'priceLabel' => number_format((float) $travel->price, 0, ',', ' ').' MAD',
            'image' => $image,
            'gallery' => array_values(array_filter(array_map(fn ($path) => $this->publicUrl((string) $path), $gallery))),
            'description' => $travel->description,
            'status' => $travel->status,
            'featured' => $this->isFeatured($travel->featured ?? false),
        ];
    }

    private function mapPublicMovie(object $movie): array
    {
        $poster = $this->publicUrl($movie->poster ?? null);
        return [
            'id' => (string) $movie->id,
            'slug' => $movie->slug,
            'title' => $movie->title,
            'genre' => $movie->genre,
            'duration' => $movie->duration,
            'release_date' => $movie->release_date,
            'releaseDate' => $movie->release_date,
            'poster' => $poster,
            'image' => $poster,
            'synopsis' => $movie->synopsis,
            'description' => $movie->synopsis,
            'status' => $movie->status,
            'featured' => $this->isFeatured($movie->featured ?? false),
        ];
    }

    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'firstName' => 'required|string|max:255',
            'lastName' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string',
        ]);

        $user = User::query()->create([
            'name' => trim($data['firstName'].' '.$data['lastName']),
            'role' => 'client',
            'first_name' => $data['firstName'],
            'last_name' => $data['lastName'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'phone' => $data['phone'] ?? null,
            'company_name' => null,
            'organization_slug' => null,
            'is_active' => true,
            'api_token' => Str::random(60),
        ]);

        return response()->json(['user' => $this->userPayload($user), 'token' => $user->api_token], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate(['email' => 'required|email', 'password' => 'required|string']);
        $email = mb_strtolower(trim($request->input('email')));
        $user = User::query()->whereRaw('LOWER(email) = ?', [$email])->first();
        $hasPasswordHash = $user && !empty($user->password);
        $passwordMatches = $hasPasswordHash ? Hash::check($data['password'], $user->password) : false;

        Log::info('Login attempt debug', [
            'email' => $email,
            'user_found' => (bool) $user,
            'user_id' => $user?->id,
            'role' => $user?->role,
            'is_active' => $user?->is_active,
            'has_password_hash' => $hasPasswordHash,
            'hash_check' => $passwordMatches,
        ]);

        if (!$user || !$passwordMatches) {
            return response()->json(['message' => 'Email ou mot de passe invalide.'], 422);
        }

        if (!$user->is_active) {
            return response()->json(['message' => 'Compte inactif.'], 403);
        }

        $user->api_token = Str::random(60);
        $user->save();

        return response()->json(['user' => $this->userPayload($user), 'token' => $user->api_token]);
    }

    public function debugUsers(): JsonResponse
    {
        $users = User::query()->select(['email', 'role', 'is_active', 'password'])->get()
            ->map(fn (User $user): array => [
                'email' => $user->email,
                'role' => $user->role,
                'is_active' => (bool) $user->is_active,
                'has_password' => !empty($user->password),
            ]);

        return response()->json($users);
    }

    public function debugCheckLogin(Request $request): JsonResponse
    {
        $data = $request->validate(['email' => 'required|email', 'password' => 'required|string']);
        $email = mb_strtolower(trim($request->input('email')));
        $user = User::query()->whereRaw('LOWER(email) = ?', [$email])->first();
        $hasPasswordHash = $user && !empty($user->password);
        $hashCheck = $hasPasswordHash ? Hash::check($data['password'], $user->password) : false;

        return response()->json([
            'user_found' => (bool) $user,
            'role' => $user?->role,
            'is_active' => $user ? (bool) $user->is_active : null,
            'hash_check' => $hashCheck,
        ]);
    }


    public function forgotPassword(Request $request): JsonResponse
    {
        $data = $request->validate(['email' => 'required|email']);

        try {
            Password::sendResetLink(['email' => $data['email']]);
        } catch (\Throwable $exception) {
            report($exception);
        }

        $payload = ['message' => 'Si cet email existe, un lien de réinitialisation a été envoyé.'];
        if (config('mail.default') === 'log') {
            $payload['devNote'] = 'Mode développement: le lien de réinitialisation est écrit dans les logs Laravel.';
        }

        return response()->json($payload);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $status = Password::reset(
            [
                'email' => $data['email'],
                'password' => $data['password'],
                'password_confirmation' => $data['password_confirmation'],
                'token' => $data['token'],
            ],
            function (User $user, string $password): void {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'api_token' => null,
                ])->save();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            return response()->json(['message' => 'Token de réinitialisation invalide ou expiré.'], 422);
        }

        return response()->json(['message' => 'Mot de passe réinitialisé avec succès.']);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->update(['api_token' => null]);
        return response()->json(['success' => true]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['user' => $this->userPayload($request->user())]);
    }

    public function clientProfile(Request $request): JsonResponse
    {
        return response()->json($this->userPayload($request->user()));
    }

    public function updateClientProfile(Request $request): JsonResponse
    {
        $data = $request->validate([
            'firstName' => 'nullable|string', 'lastName' => 'nullable|string', 'email' => 'nullable|email', 'phone' => 'nullable|string', 'avatar' => 'nullable|string'
        ]);
        $user = $request->user();
        $user->fill([
            'first_name' => $data['firstName'] ?? $user->first_name,
            'last_name' => $data['lastName'] ?? $user->last_name,
            'email' => $data['email'] ?? $user->email,
            'phone' => $data['phone'] ?? $user->phone,
            'avatar' => $data['avatar'] ?? $user->avatar,
        ]);
        $user->name = trim(($user->first_name ?? '').' '.($user->last_name ?? ''));
        $user->save();
        return response()->json($this->userPayload($user));
    }

    public function favorites(Request $request): JsonResponse
    {
        return response()->json(DB::table('favorites')->where('user_id', $request->user()->id)->orderByDesc('id')->get()->map(fn ($item) => [
            'id' => (string) $item->id,
            'userId' => (string) $item->user_id,
            'itemId' => $item->item_id,
            'itemType' => $item->item_type,
            'slug' => $item->slug,
            'title' => $item->title,
            'image' => $item->image,
            'location' => $item->location,
            'date' => $item->date,
            'route' => $item->route,
        ]));
    }

    public function addFavorite(Request $request): JsonResponse
    {
        $data = $request->validate([
            'itemId' => 'required|string', 'itemType' => 'required|string', 'slug' => 'nullable|string', 'title' => 'nullable|string', 'image' => 'nullable|string', 'location' => 'nullable|string', 'date' => 'nullable|string', 'route' => 'nullable|string'
        ]);

        $id = DB::table('favorites')->insertGetId([
            'user_id' => $request->user()->id,
            'item_type' => $data['itemType'],
            'item_id' => $data['itemId'],
            'slug' => $data['slug'] ?? null,
            'title' => $data['title'] ?? null,
            'image' => $data['image'] ?? null,
            'location' => $data['location'] ?? null,
            'date' => $data['date'] ?? null,
            'route' => $data['route'] ?? null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['id' => (string) $id, 'userId' => (string) $request->user()->id, ...$data], 201);
    }

    public function removeFavorite(Request $request, string $id): JsonResponse
    {
        DB::table('favorites')->where('id', $id)->where('user_id', $request->user()->id)->delete();
        return response()->json(['success' => true]);
    }

    public function getCart(Request $request): JsonResponse
    {
        $cartId = DB::table('carts')->where('user_id', $request->user()->id)->value('id');
        if (!$cartId) {
            return response()->json([]);
        }

        $items = DB::table('cart_items')->where('cart_id', $cartId)->get()->map(fn ($item) => [
            'id' => (string) $item->id,
            'productType' => $item->product_type,
            'productId' => $item->product_id,
            'slug' => $item->slug,
            'title' => $item->title,
            'image' => $item->image,
            'date' => $item->date,
            'location' => $item->location,
            'quantity' => (int) $item->quantity,
            'unitPrice' => (float) $item->unit_price,
            'subtotal' => (float) $item->subtotal,
            'advanceAmount' => $item->advance_amount !== null ? (float) $item->advance_amount : null,
            'remainingAmount' => $item->remaining_amount !== null ? (float) $item->remaining_amount : null,
        ]);

        return response()->json($items);
    }

    public function addCartItem(Request $request): JsonResponse
    {
        $data = $request->validate([
            'id' => 'nullable|string', 'productType' => 'required|string', 'productId' => 'nullable|string', 'slug' => 'nullable|string', 'title' => 'required|string', 'image' => 'nullable|string', 'date' => 'nullable|string', 'location' => 'nullable|string', 'quantity' => 'nullable|integer|min:1', 'unitPrice' => 'nullable|numeric', 'subtotal' => 'nullable|numeric', 'advanceAmount' => 'nullable|numeric', 'remainingAmount' => 'nullable|numeric'
        ]);
        $userId = $request->user()->id;
        $cartId = DB::table('carts')->where('user_id', $userId)->value('id');
        if (!$cartId) {
            $cartId = DB::table('carts')->insertGetId(['user_id' => $userId, 'created_at' => now(), 'updated_at' => now()]);
        }

        $id = DB::table('cart_items')->insertGetId([
            'cart_id' => $cartId,
            'product_type' => $data['productType'],
            'product_id' => $data['productId'] ?? ($data['slug'] ?? Str::random(8)),
            'slug' => $data['slug'] ?? null,
            'title' => $data['title'],
            'image' => $data['image'] ?? null,
            'date' => $data['date'] ?? null,
            'location' => $data['location'] ?? null,
            'quantity' => $data['quantity'] ?? 1,
            'unit_price' => $data['unitPrice'] ?? 0,
            'subtotal' => $data['subtotal'] ?? (($data['unitPrice'] ?? 0) * ($data['quantity'] ?? 1)),
            'advance_amount' => $data['advanceAmount'] ?? null,
            'remaining_amount' => $data['remainingAmount'] ?? null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['id' => (string) $id, ...$data], 201);
    }

    public function updateCartItem(Request $request, string $id): JsonResponse
    {
        $userId = $request->user()->id;
        $cartId = DB::table('carts')->where('user_id', $userId)->value('id');
        if (!$cartId) {
            return response()->json(['message' => 'Panier introuvable'], 404);
        }

        $item = DB::table('cart_items')->where('id', $id)->where('cart_id', $cartId)->first();
        if (!$item) {
            return response()->json(['message' => 'Item introuvable'], 404);
        }

        $qty = max(1, (int) $request->input('quantity', $item->quantity));
        $subtotal = (float) $item->unit_price * $qty;

        DB::table('cart_items')->where('id', $id)->update(['quantity' => $qty, 'subtotal' => $subtotal, 'updated_at' => now()]);
        return response()->json(['id' => $id, 'quantity' => $qty, 'subtotal' => $subtotal]);
    }

    public function deleteCartItem(Request $request, string $id): JsonResponse
    {
        $cartId = DB::table('carts')->where('user_id', $request->user()->id)->value('id');
        DB::table('cart_items')->where('id', $id)->where('cart_id', $cartId)->delete();
        return response()->json(['success' => true]);
    }

    public function clearCart(Request $request): JsonResponse
    {
        $cartId = DB::table('carts')->where('user_id', $request->user()->id)->value('id');
        if ($cartId) {
            DB::table('cart_items')->where('cart_id', $cartId)->delete();
        }
        return response()->json(['success' => true]);
    }

    public function createOrder(Request $request): JsonResponse
    {
        $data = $request->validate(['items' => 'required|array|min:1', 'customer' => 'nullable|array']);
        $user = $request->user();
        $reference = 'CMD-'.strtoupper(Str::random(8));
        $total = collect($data['items'])->sum(fn ($item) => (float) ($item['subtotal'] ?? 0));

        $orderId = DB::table('orders')->insertGetId([
            'reference' => $reference,
            'user_id' => $user->id,
            'organizer_id' => null,
            'total' => $total,
            'payment_status' => 'pending',
            'status' => 'pending',
            'customer' => json_encode($data['customer'] ?? []),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        foreach ($data['items'] as $item) {
            DB::table('order_items')->insert([
                'order_id' => $orderId,
                'product_type' => $item['productType'] ?? 'event_ticket',
                'product_id' => (string) ($item['productId'] ?? $item['slug'] ?? Str::random(8)),
                'title' => $item['title'] ?? 'Item',
                'quantity' => (int) ($item['quantity'] ?? 1),
                'unit_price' => (float) ($item['unitPrice'] ?? 0),
                'subtotal' => (float) ($item['subtotal'] ?? 0),
                'selected_zone' => $item['selectedZone'] ?? null,
                'selected_place' => $item['selectedPlace'] ?? null,
                'metadata' => json_encode($item),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return response()->json(['id' => (string) $orderId, 'reference' => $reference, 'status' => 'pending', 'amount' => $total], 201);
    }

    public function paymentInit(Request $request): JsonResponse
    {
        $data = $request->validate(['orderId' => 'required', 'method' => 'required|string']);
        $order = DB::table('orders')->where('id', $data['orderId'])->where('user_id', $request->user()->id)->first();
        if (!$order) {
            return response()->json(['message' => 'Commande introuvable'], 404);
        }

        $paymentId = DB::table('payments')->insertGetId([
            'order_id' => $order->id,
            'provider' => $data['method'],
            'status' => 'initialized',
            'provider_reference' => 'PAY-'.strtoupper(Str::random(8)),
            'amount' => $order->total,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['paymentId' => (string) $paymentId, 'status' => 'initialized']);
    }

    public function paymentConfirm(Request $request): JsonResponse
    {
        $data = $request->validate(['orderId' => 'required', 'paymentId' => 'required']);
        $order = DB::table('orders')->where('id', $data['orderId'])->where('user_id', $request->user()->id)->first();
        if (!$order) {
            return response()->json(['message' => 'Commande introuvable'], 404);
        }

        DB::table('payments')->where('id', $data['paymentId'])->where('order_id', $order->id)->update(['status' => 'paid', 'updated_at' => now()]);
        DB::table('orders')->where('id', $order->id)->update(['payment_status' => 'paid', 'status' => 'paid', 'updated_at' => now()]);

        DB::table('order_items')->where('order_id', $order->id)->get()->each(function ($item): void {
            DB::table('tickets')->insert([
                'order_item_id' => $item->id,
                'ticket_number' => 'TKT-'.strtoupper(Str::random(10)),
                'qr_code' => 'QR-'.strtoupper(Str::random(24)),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        return $this->orderById($request, (string) $order->id);
    }

    public function clientOrders(Request $request): JsonResponse
    {
        $orders = DB::table('orders')->where('user_id', $request->user()->id)->orderByDesc('id')->get();
        return response()->json($orders->map(fn ($order) => $this->mapOrder($order)));
    }

    private function mapOrder(object $order): array
    {
        $items = DB::table('order_items')->where('order_id', $order->id)->get()->map(fn ($item) => [
            'id' => (string) $item->id,
            'productType' => $item->product_type,
            'productId' => $item->product_id,
            'title' => $item->title,
            'quantity' => (int) $item->quantity,
            'unitPrice' => (float) $item->unit_price,
            'subtotal' => (float) $item->subtotal,
            'selectedZone' => $item->selected_zone,
            'selectedPlace' => $item->selected_place,
        ])->values();

        return [
            'id' => (string) $order->id,
            'reference' => $order->reference,
            'status' => $order->status,
            'paymentStatus' => $order->payment_status,
            'total' => (float) $order->total,
            'items' => $items,
            'createdAt' => $order->created_at,
            'updatedAt' => $order->updated_at,
        ];
    }

    public function orderById(Request $request, string $id): JsonResponse
    {
        $order = DB::table('orders')->where('id', $id)->where('user_id', $request->user()->id)->first();
        if (!$order) return response()->json(['message' => 'Commande introuvable'], 404);
        return response()->json($this->mapOrder($order));
    }

    public function receipt(Request $request, string $id)
    {
        $order = DB::table('orders')->where('id', $id)->where('user_id', $request->user()->id)->first();
        if (!$order) {
            return response()->json(['message' => 'Commande introuvable'], 404);
        }
        $ticket = DB::table('tickets')->join('order_items', 'tickets.order_item_id', '=', 'order_items.id')->where('order_items.order_id', $order->id)->select('tickets.*', 'order_items.title')->first();
        $html = "<html><body><h1>Guichet - Reçu</h1><p>Commande: {$order->reference}</p><p>Ticket: ".($ticket->ticket_number ?? 'N/A')."</p><p>Article: ".($ticket->title ?? 'N/A')."</p><p>Montant: {$order->total} MAD</p></body></html>";
        return response($html, 200, ['Content-Type' => 'application/pdf', 'Content-Disposition' => 'inline; filename="receipt-'.$order->reference.'.pdf"']);
    }

    public function events(Request $request, ?string $slug = null): JsonResponse
    {
        $type = $request->query('type');
        $query = Event::query()->with('category', 'city')->where('status', 'published');

        if ($type) {
            $query->where('type', $type);
        }

        if ($request->boolean('featured')) {
            $query->where('featured', true);
        }

        $categorySlug = $slug ?: ($request->filled('category') ? (string) $request->query('category') : null);
        if ($categorySlug) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $categorySlug));
        }

        if ($search = $request->string('q')->toString() ?: $request->string('search')->toString()) {
            $query->where(fn ($q) => $q->where('title', 'like', "%{$search}%")->orWhere('venue', 'like', "%{$search}%")->orWhere('city_name', 'like', "%{$search}%"));
        }

        if ($city = $request->string('city')->toString()) {
            $query->where(fn ($q) => $q->where('city_name', 'like', "%{$city}%")->orWhereHas('city', fn ($cityQuery) => $cityQuery->where('slug', $city)->orWhere('name', 'like', "%{$city}%")));
        }

        $this->applyEventDateFilter($query, $request->string('date_filter')->toString() ?: $request->string('quick_date')->toString());

        $data = $query->orderByDesc('featured')->orderBy('event_date')->orderBy('starts_at')->get()->map(fn (Event $event) => $this->mapPublicEvent($event));
        return response()->json(['data' => $data, 'meta' => ['total' => $data->count()]]);
    }

    public function eventBySlug(string $slug): JsonResponse
    {
        $event = Event::query()->with('category', 'city')->where('slug', $slug)->where('status', 'published')->firstOrFail();
        return response()->json(['data' => $this->mapPublicEvent($event)]);
    }

    public function organizerBySlug(string $slug): JsonResponse
    {
        $organizer = DB::table('organizers')->where('slug', $slug)->where('is_approved', true)->first();
        if (!$organizer) {
            return response()->json(['message' => 'Organisateur introuvable'], 404);
        }

        $events = Event::query()
            ->with('category', 'city')
            ->where('organizer_id', $organizer->user_id)
            ->where('status', 'published')
            ->orderBy('event_date')
            ->get()
            ->map(fn (Event $event) => $this->mapPublicEvent($event));

        return response()->json([
            'organizer' => [
                ...((array) $organizer),
                'logo' => $this->publicUrl($organizer->logo ?? null),
                'cover_image' => $this->publicUrl($organizer->cover_image ?? null),
            ],
            'events' => $events,
        ]);
    }

    public function sportPlan(string $id): JsonResponse
    {
        $event = Event::query()->find($id);
        $requestedPlanType = request()->query('planType') ?: request()->query('plan_type');
        $planType = $event?->plan_type ?: $requestedPlanType;
        $zones = DB::table('sport_plan_zones')
            ->where('event_id', $id)
            ->when($planType, fn ($query) => $query->where('plan_type', $planType))
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        if ($zones->isEmpty() && $planType) {
            $zones = DB::table('sport_plan_zones')
                ->where('event_id', $id)
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get();
        }

        $resolvedPlanType = $planType ?: ($zones->first()->plan_type ?? 'generic');
        $mappedZones = $zones->map(fn ($zone) => $this->mapPublicPlanZone($zone, $resolvedPlanType))->values();

        return response()->json([
            'eventId' => (string) $id,
            'event_id' => (string) $id,
            'planType' => $resolvedPlanType,
            'plan_type' => $resolvedPlanType,
            'zones' => $mappedZones,
        ]);
    }

    public function sportSelect(Request $request, string $id): JsonResponse
    {
        $data = $request->validate(['zoneId' => 'required|string', 'quantity' => 'required|integer|min:1']);
        return response()->json(['eventId' => $id, 'zoneId' => $data['zoneId'], 'quantity' => $data['quantity'], 'success' => true]);
    }

    public function travels(Request $request): JsonResponse
    {
        $query = DB::table('travels')->where('status', 'published');
        if ($request->filled('category')) {
            $query->where('category', $request->query('category'));
        }
        if ($request->boolean('featured')) {
            $query->where('featured', true);
        }
        $data = $query->orderByDesc('featured')->orderByDesc('id')->get()->map(fn ($travel) => $this->mapPublicTravel($travel));
        return response()->json(['data' => $data, 'meta' => ['total' => $data->count()]]);
    }

    public function travelBySlug(string $slug): JsonResponse
    {
        $travel = DB::table('travels')->where('slug', $slug)->where('status', 'published')->first();
        if (!$travel) {
            return response()->json(['message' => 'Voyage introuvable'], 404);
        }
        return response()->json(['data' => $this->mapPublicTravel($travel)]);
    }



    public function adminMovies(): JsonResponse
    {
        $movies = DB::table('movies')->get()->map(function ($movie) {
            $movie->sessions = DB::table('movie_sessions')
                ->where('movie_id', $movie->id)
                ->orderBy('session_date')
                ->orderBy('session_time')
                ->get()
                ->map(fn ($session) => [
                    'id' => (string) $session->id,
                    'sessionDate' => $session->session_date,
                    'sessionTime' => $session->session_time,
                    'cinema' => $session->cinema,
                    'city' => $session->city,
                    'hallName' => $session->hall_name ?? 'Salle 1',
                    'price' => (float) $session->price,
                    'seatingEnabled' => (bool) ($session->seating_enabled ?? false),
                    'seatTemplate' => $session->seat_template ?? 'medium',
                    'reservedSeats' => $session->reserved_seats ? json_decode($session->reserved_seats, true) : [],
                ]);
            return $movie;
        });
        return response()->json($movies);
    }

    private function syncMovieSessions(int|string $movieId, array $sessions): void
    {
        DB::table('movie_sessions')->where('movie_id', $movieId)->delete();
        foreach ($sessions as $session) {
            DB::table('movie_sessions')->insert([
                'movie_id' => $movieId,
                'session_date' => $session['session_date'] ?? now()->toDateString(),
                'session_time' => $session['session_time'] ?? '20:00',
                'cinema' => $session['cinema'] ?? null,
                'city' => $session['city'] ?? null,
                'hall_name' => $session['hall_name'] ?? 'Salle 1',
                'price' => $session['price'] ?? 0,
                'seating_enabled' => (bool) ($session['seating_enabled'] ?? false),
                'seat_template' => $session['seat_template'] ?? 'medium',
                'reserved_seats' => $session['reserved_seats'] ?? json_encode([]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    private function moviePayloadFromRequest(Request $request): array
    {
        return collect($request->except('sessions'))->only(['title', 'slug', 'genre', 'duration', 'release_date', 'poster', 'synopsis', 'status', 'featured'])->all();
    }

    public function adminStoreMovie(Request $request): JsonResponse
    {
        $movieId = DB::table('movies')->insertGetId(array_merge($this->moviePayloadFromRequest($request), ['created_at' => now(), 'updated_at' => now()]));
        $this->syncMovieSessions($movieId, $request->input('sessions', []));
        return response()->json(['id' => $movieId], 201);
    }

    public function adminUpdateMovie(Request $request, string $id): JsonResponse
    {
        $updated = DB::table('movies')->where('id', $id)->update(array_merge($this->moviePayloadFromRequest($request), ['updated_at' => now()])) > 0;
        if ($request->has('sessions')) {
            $this->syncMovieSessions($id, $request->input('sessions', []));
        }
        return response()->json(['success' => $updated]);
    }

    public function movies(Request $request): JsonResponse
    {
        $query = DB::table('movies')->where('status', 'published');
        if ($request->boolean('featured')) {
            $query->where('featured', true);
        }
        $data = $query->orderByDesc('featured')->orderByDesc('id')->get()->map(fn ($movie) => $this->mapPublicMovie($movie));
        return response()->json(['data' => $data, 'meta' => ['total' => $data->count()]]);
    }

    public function movieBySlug(string $slug): JsonResponse
    {
        $movie = DB::table('movies')->where('slug', $slug)->where('status', 'published')->first();
        if (!$movie) {
            return response()->json(['message' => 'Film introuvable'], 404);
        }
        return response()->json(['data' => $this->mapPublicMovie($movie)]);
    }

    public function movieSessions(string $slug): JsonResponse
    {
        $movieId = DB::table('movies')->where('slug', $slug)->where('status', 'published')->value('id');
        if (!$movieId) {
            return response()->json(['data' => []]);
        }
        $sessions = DB::table('movie_sessions')->where('movie_id', $movieId)->orderBy('session_date')->orderBy('session_time')->get()->map(function ($session) {
            $session->hallName = $session->hall_name ?? 'Salle 1';
            $session->seatingEnabled = (bool) ($session->seating_enabled ?? false);
            $session->seatTemplate = $session->seat_template ?? 'medium';
            $session->reservedSeats = $session->reserved_seats ? json_decode($session->reserved_seats, true) : [];
            return $session;
        });
        return response()->json(['data' => $sessions]);
    }

    public function contentBlocks(): JsonResponse
    {
        $data = DB::table('content_blocks')
            ->where('visible', true)
            ->orderBy('display_order')
            ->orderBy('id')
            ->get()
            ->map(fn ($block) => [
                'id' => (string) $block->id,
                'type' => $block->type,
                'title' => $block->title,
                'subtitle' => $block->subtitle,
                'description' => $block->description ?? null,
                'cta_label' => $block->cta_label ?? null,
                'cta_link' => $block->cta_link ?? null,
                'image' => $this->publicUrl($block->image ?? null),
                'background_image' => $this->publicUrl($block->background_image ?? null),
                'visible' => (bool) $block->visible,
                'display_order' => (int) $block->display_order,
            ]);

        return response()->json(['data' => $data, 'meta' => ['total' => $data->count()]]);
    }

    public function featured(): JsonResponse
    {
        return response()->json([
            'events' => Event::query()->with('category', 'city')->where('status', 'published')->where('featured', true)->orderBy('event_date')->get()->map(fn (Event $event) => $this->mapPublicEvent($event)),
            'travels' => DB::table('travels')->where('status', 'published')->where('featured', true)->orderByDesc('id')->get()->map(fn ($travel) => $this->mapPublicTravel($travel)),
            'movies' => DB::table('movies')->where('status', 'published')->where('featured', true)->orderByDesc('id')->get()->map(fn ($movie) => $this->mapPublicMovie($movie)),
        ]);
    }

    public function organizerDashboard(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $events = DB::table('events')->where('organizer_id', $userId)->count();
        $orders = DB::table('orders')->where('organizer_id', $userId)->count();
        $revenue = (float) DB::table('orders')->where('organizer_id', $userId)->where('payment_status', 'paid')->sum('total');
        $pendingPayout = (float) DB::table('payouts')->where('organizer_id', $userId)->where('status', 'pending')->sum('amount');
        $customers = DB::table('orders')->where('organizer_id', $userId)->distinct('user_id')->count('user_id');
        return response()->json(compact('events', 'orders', 'revenue', 'pendingPayout', 'customers'));
    }

    public function organizerEvents(Request $request): JsonResponse
    {
        return response()->json(DB::table('events')->where('organizer_id', $request->user()->id)->orderByDesc('id')->get());
    }

    public function organizerOrders(Request $request): JsonResponse
    {
        return response()->json(DB::table('orders')->where('organizer_id', $request->user()->id)->orderByDesc('id')->get());
    }

    public function organizerPayouts(Request $request): JsonResponse
    {
        return response()->json(DB::table('payouts')->where('organizer_id', $request->user()->id)->orderByDesc('id')->get());
    }


    private function validateAdminEvent(Request $request, bool $partial = false): array
    {
        $data = $request->validate([
            'organizer_id' => ['nullable'],
            'category_id' => ['nullable'],
            'city_id' => ['nullable'],
            'organizer' => ['nullable', 'string', 'max:255'],
            'title' => [$partial ? 'sometimes' : 'required', 'string', 'max:255'],
            'short_description' => ['nullable', 'string'],
            'slug' => ['nullable', 'string', 'max:255'],
            'city_name' => ['nullable', 'string', 'max:255'],
            'venue' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'event_date' => ['nullable', 'date'],
            'event_time' => ['nullable'],
            'description' => ['nullable', 'string'],
            'image_url' => ['nullable', 'string'],
            'image' => ['nullable', 'string'],
            'hero_image' => ['nullable', 'string'],
            'type' => ['nullable', 'string', 'max:80'],
            'buying_mode' => ['nullable', 'in:ticket,plan,reservation'],
            'plan_type' => ['nullable', 'in:theatre,stadium,generic'],
            'has_plan' => ['nullable', 'boolean'],
            'seating_enabled' => ['nullable', 'boolean'],
            'status' => ['nullable', 'string', 'max:40'],
            'featured' => ['nullable', 'boolean'],
            'starts_at' => ['nullable', 'date'],
            'price_mad' => ['nullable', 'numeric', 'min:0'],
            'is_sold_out' => ['nullable', 'boolean'],
            'is_free' => ['nullable', 'boolean'],
            'zones' => ['nullable', 'array'],
            'zones.*.name' => ['required_with:zones', 'string', 'max:255'],
            'zones.*.label' => ['nullable', 'string', 'max:255'],
            'zones.*.price' => ['required_with:zones', 'numeric', 'min:0'],
            'zones.*.capacity' => ['required_with:zones', 'integer', 'min:0'],
            'zones.*.available_capacity' => ['nullable', 'integer', 'min:0'],
            'zones.*.color' => ['nullable', 'string', 'max:32'],
            'zones.*.sort_order' => ['nullable', 'integer', 'min:0'],
            'zones.*.is_available' => ['nullable', 'boolean'],
        ]);

        if (!$partial || array_key_exists('buying_mode', $data) || array_key_exists('has_plan', $data) || array_key_exists('plan_type', $data)) {
            $mode = $data['buying_mode'] ?? 'ticket';
            if ($mode === 'plan' && array_key_exists('has_plan', $data) && (bool) $data['has_plan'] === false) {
                throw ValidationException::withMessages(['has_plan' => 'has_plan must be true when buying_mode is plan.']);
            }
            if ($mode !== 'plan' && !empty($data['has_plan'])) {
                throw ValidationException::withMessages(['has_plan' => 'has_plan must be false when buying_mode is ticket.']);
            }

            $hasPlan = $mode === 'plan';
            $data['buying_mode'] = $hasPlan ? 'plan' : 'ticket';
            $data['has_plan'] = $hasPlan;
            $data['seating_enabled'] = $hasPlan;
            $data['plan_type'] = $hasPlan ? ($data['plan_type'] ?? null) : null;

            if ($hasPlan && empty($data['plan_type'])) {
                throw ValidationException::withMessages(['plan_type' => 'plan_type is required when buying_mode is plan.']);
            }
        }

        if (($data['buying_mode'] ?? null) === 'plan') {
            $activeZones = collect($data['zones'] ?? [])->filter(fn ($zone) => ($zone['is_available'] ?? true) && (int) ($zone['capacity'] ?? 0) > 0);
            if ($activeZones->isEmpty()) {
                throw ValidationException::withMessages(['zones' => 'At least one active zone is required when buying_mode is plan.']);
            }
        }
        if (!empty($data['title']) && empty($data['slug'])) {
            $data['slug'] = Str::slug($data['title']);
        }
        $data['starts_at'] = $data['starts_at'] ?? (!empty($data['event_date']) ? trim($data['event_date'].' '.($data['event_time'] ?? '00:00:00')) : null);

        return $data;
    }

    private function syncAdminEventZones(int|string $eventId, string $planType, array $zones): void
    {
        DB::table('sport_plan_zones')->where('event_id', $eventId)->delete();
        foreach (array_values($zones) as $index => $zone) {
            $capacity = (int) $zone['capacity'];
            DB::table('sport_plan_zones')->insert([
                'event_id' => $eventId,
                'plan_type' => $planType,
                'name' => $zone['name'],
                'label' => $zone['label'] ?? $zone['name'],
                'code' => Str::upper(Str::slug($zone['name'], '_')),
                'price' => $zone['price'],
                'capacity' => $capacity,
                'available_capacity' => $zone['available_capacity'] ?? $capacity,
                'color' => $zone['color'] ?? '#f97316',
                'sort_order' => $zone['sort_order'] ?? $index,
                'is_available' => $zone['is_available'] ?? true,
                'shape_data' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function adminStoreEvent(Request $request): JsonResponse
    {
        $data = $this->validateAdminEvent($request);
        $zones = $data['zones'] ?? [];
        unset($data['zones']);
        $id = DB::table('events')->insertGetId(array_merge($data, ['created_at' => now(), 'updated_at' => now()]));
        if (($data['buying_mode'] ?? 'ticket') === 'plan') {
            $this->syncAdminEventZones($id, (string) $data['plan_type'], $zones);
        }
        return response()->json(['id' => $id], 201);
    }

    public function adminUpdateEvent(Request $request, string $id): JsonResponse
    {
        $data = $this->validateAdminEvent($request, true);
        $zones = $data['zones'] ?? null;
        unset($data['zones']);
        $updated = DB::table('events')->where('id', $id)->update(array_merge($data, ['updated_at' => now()]));
        if (($data['buying_mode'] ?? null) === 'plan' && is_array($zones)) {
            $this->syncAdminEventZones($id, (string) $data['plan_type'], $zones);
        }
        if (array_key_exists('buying_mode', $data) && $data['buying_mode'] !== 'plan') {
            DB::table('sport_plan_zones')->where('event_id', $id)->delete();
        }
        return response()->json(['success' => $updated > 0]);
    }

    public function adminDashboard(): JsonResponse
    {
        return response()->json([
            'users' => DB::table('users')->count(),
            'organizers' => DB::table('organizers')->count(),
            'events' => DB::table('events')->count(),
            'orders' => DB::table('orders')->count(),
        ]);
    }
}
