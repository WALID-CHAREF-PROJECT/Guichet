<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class MarketplaceController extends Controller
{
    private function userPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'role' => $user->role,
            'firstName' => $user->first_name ?? $user->name,
            'lastName' => $user->last_name ?? '',
            'email' => $user->email,
            'phone' => $user->phone,
            'avatar' => $user->avatar,
            'companyName' => $user->company_name,
            'organizationSlug' => $user->organization_slug,
            'isActive' => (bool) $user->is_active,
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
        $user = User::query()->where('email', $data['email'])->first();
        if (!$user || !Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Email ou mot de passe invalide.'], 422);
        }
        if (!$user->is_active) {
            return response()->json(['message' => 'Compte inactif.'], 403);
        }

        $user->api_token = Str::random(60);
        $user->save();

        return response()->json(['user' => $this->userPayload($user), 'token' => $user->api_token]);
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
        $categorySlug = $slug ?: ($request->filled('category') ? (string) $request->query('category') : null);
        if ($categorySlug) {
            $cat = (string) $categorySlug;
            $query->whereHas('category', fn ($q) => $q->where('slug', $cat));
        }
        $data = $query->orderBy('event_date')->get()->map(fn ($event) => [
            'id' => (string) $event->id,
            'slug' => $event->slug,
            'title' => $event->title,
            'organizer' => $event->organizer,
            'description' => $event->description,
            'venue' => $event->venue,
            'city' => ['id' => (string) $event->city_id, 'name' => $event->city->name ?? $event->city_name, 'slug' => $event->city->slug ?? null],
            'category' => ['id' => (string) $event->category_id, 'name' => $event->category->name ?? null, 'slug' => $event->category->slug ?? null],
            'image_url' => $event->image ?: $event->image_url,
            'starts_at_human' => $event->event_date.' '.$event->event_time,
            'price_mad' => (float) $event->price_mad,
            'type' => $event->type,
            'buyingMode' => $event->buying_mode,
            'hasPlan' => (bool) $event->has_plan,
        ]);
        return response()->json(['data' => $data, 'meta' => ['total' => $data->count()]]);
    }

    public function eventBySlug(string $slug): JsonResponse
    {
        $event = Event::query()->where('slug', $slug)->where('status', 'published')->firstOrFail();
        return response()->json(['data' => [
            'id' => (string) $event->id,
            'slug' => $event->slug,
            'title' => $event->title,
            'organizer' => $event->organizer,
            'description' => $event->description,
            'venue' => $event->venue,
            'city' => ['name' => $event->city_name],
            'image_url' => $event->image ?: $event->image_url,
            'starts_at_human' => $event->event_date.' '.$event->event_time,
            'price_mad' => (float) $event->price_mad,
            'type' => $event->type,
            'buyingMode' => $event->buying_mode,
            'hasPlan' => (bool) $event->has_plan,
        ]]);
    }

    public function organizerBySlug(string $slug): JsonResponse
    {
        $organizer = DB::table('organizers')->where('slug', $slug)->first();
        if (!$organizer) {
            return response()->json(['message' => 'Organisateur introuvable'], 404);
        }

        $events = Event::query()
            ->where('organizer_id', $organizer->user_id)
            ->where('status', 'published')
            ->orderBy('event_date')
            ->get();

        return response()->json([
            'organizer' => $organizer,
            'events' => $events,
        ]);
    }

    public function sportPlan(string $id): JsonResponse
    {
        $zones = DB::table('sport_plan_zones')->where('event_id', $id)->get()->map(fn ($zone) => [
            'id' => 'zone_'.$zone->id,
            'name' => $zone->name,
            'price' => (float) $zone->price,
            'available' => (bool) $zone->is_available && $zone->available_capacity > 0,
            'capacity' => (int) $zone->available_capacity,
        ]);
        return response()->json(['eventId' => (string) $id, 'zones' => $zones]);
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
        return response()->json($query->get());
    }

    public function travelBySlug(string $slug): JsonResponse
    {
        return response()->json(DB::table('travels')->where('slug', $slug)->firstOrFail());
    }

    public function movies(): JsonResponse
    {
        return response()->json(DB::table('movies')->where('status', 'published')->get());
    }

    public function movieBySlug(string $slug): JsonResponse
    {
        return response()->json(DB::table('movies')->where('slug', $slug)->firstOrFail());
    }

    public function movieSessions(string $slug): JsonResponse
    {
        $movieId = DB::table('movies')->where('slug', $slug)->value('id');
        return response()->json(DB::table('movie_sessions')->where('movie_id', $movieId)->orderBy('session_date')->orderBy('session_time')->get());
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
