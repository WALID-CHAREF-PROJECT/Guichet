<?php

use App\Http\Controllers\Api\Admin\PackController;
use App\Http\Controllers\Api\Admin\ProducerController;
use App\Http\Controllers\Api\Admin\ProducerPackSubscriptionController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CityController;
use App\Http\Controllers\Api\MarketplaceController;
use App\Http\Controllers\Api\NewsletterController;
use App\Http\Controllers\Api\ProducerPortalController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json(['ok' => true, 'service' => 'laravel-api']));
Route::options('/{any}', fn () => response()->noContent())->where('any', '.*');
Route::post('/login', [MarketplaceController::class, 'login']);
Route::post('/register', [MarketplaceController::class, 'register']);
Route::post('/forgot-password', [MarketplaceController::class, 'forgotPassword']);
Route::post('/reset-password', [MarketplaceController::class, 'resetPassword']);

if (app()->environment('local')) {
    Route::get('/debug/users', [MarketplaceController::class, 'debugUsers']);
    Route::post('/debug/check-login', [MarketplaceController::class, 'debugCheckLogin']);
}
Route::get('/events', [MarketplaceController::class, 'events']);
Route::get('/events/{slug}', [MarketplaceController::class, 'eventBySlug']);
Route::get('/events/category/{slug}', [MarketplaceController::class, 'events']);
Route::get('/organizers/{slug}', [MarketplaceController::class, 'organizerBySlug']);
Route::get('/travels', [MarketplaceController::class, 'travels']);
Route::get('/travels/{slug}', [MarketplaceController::class, 'travelBySlug']);
Route::get('/travels/category/{slug}', [MarketplaceController::class, 'travels']);
Route::get('/movies', [MarketplaceController::class, 'movies']);
Route::get('/movies/{slug}', [MarketplaceController::class, 'movieBySlug']);
Route::get('/movies/{slug}/sessions', [MarketplaceController::class, 'movieSessions']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/content-blocks', [MarketplaceController::class, 'contentBlocks']);
Route::get('/homepage/content', [MarketplaceController::class, 'contentBlocks']);
Route::get('/featured', [MarketplaceController::class, 'featured']);
Route::get('/cities', [CityController::class, 'index']);
Route::post('/newsletter/subscribe', [NewsletterController::class, 'store']);
Route::get('/events/{id}/plan', [MarketplaceController::class, 'sportPlan']);
Route::get('/events/{id}/sport-plan', [MarketplaceController::class, 'sportPlan']);
Route::get('/sport/events/{id}/plan', [MarketplaceController::class, 'sportPlan']);
Route::post('/sport/events/{id}/select-place', [MarketplaceController::class, 'sportSelect']);

Route::middleware('auth.token')->group(function (): void {
    Route::post('/logout', [MarketplaceController::class, 'logout']);
    Route::get('/me', [MarketplaceController::class, 'me']);

    Route::middleware('role:client,producer,admin')->group(function (): void {
        Route::get('/client/profile', [MarketplaceController::class, 'clientProfile']);
        Route::put('/client/profile', [MarketplaceController::class, 'updateClientProfile']);
        Route::get('/client/favorites', [MarketplaceController::class, 'favorites']);
        Route::post('/client/favorites', [MarketplaceController::class, 'addFavorite']);
        Route::delete('/client/favorites/{id}', [MarketplaceController::class, 'removeFavorite']);
        Route::get('/client/cart', [MarketplaceController::class, 'getCart']);
        Route::post('/client/cart', [MarketplaceController::class, 'addCartItem']);
        Route::put('/client/cart/{id}', [MarketplaceController::class, 'updateCartItem']);
        Route::delete('/client/cart/{id}', [MarketplaceController::class, 'deleteCartItem']);
        Route::delete('/client/cart', [MarketplaceController::class, 'clearCart']);
        Route::get('/client/orders', [MarketplaceController::class, 'clientOrders']);
        Route::get('/client/orders/{id}', [MarketplaceController::class, 'orderById']);
        Route::get('/client/receipts/{orderId}', [MarketplaceController::class, 'receipt']);

        Route::post('/orders', [MarketplaceController::class, 'createOrder']);
        Route::post('/payments/init', [MarketplaceController::class, 'paymentInit']);
        Route::post('/payments/confirm', [MarketplaceController::class, 'paymentConfirm']);
        Route::get('/orders/{id}', [MarketplaceController::class, 'orderById']);
        Route::get('/orders/{id}/receipt', [MarketplaceController::class, 'receipt']);
    });

    Route::middleware('role:organizer,producer')->group(function (): void {
        Route::get('/organizer/dashboard', [MarketplaceController::class, 'organizerDashboard']);
        Route::get('/organizer/profile', [MarketplaceController::class, 'clientProfile']);
        Route::put('/organizer/profile', [MarketplaceController::class, 'updateClientProfile']);
        Route::get('/organizer/events', [MarketplaceController::class, 'organizerEvents']);
        Route::get('/organizer/orders', [MarketplaceController::class, 'organizerOrders']);
        Route::get('/organizer/customers', [MarketplaceController::class, 'organizerOrders']);
        Route::get('/organizer/reports', [MarketplaceController::class, 'organizerDashboard']);
        Route::get('/organizer/payouts', [MarketplaceController::class, 'organizerPayouts']);
        Route::get('/organizer/settings', fn () => response()->json(['notifications' => true, 'payoutFrequency' => 'weekly']));
        Route::put('/organizer/settings', fn () => response()->json(['success' => true]));
    });

    Route::middleware('role:admin')->group(function (): void {
        Route::get('/admin/dashboard', [MarketplaceController::class, 'adminDashboard']);
        Route::post('/admin/media', function () {
            request()->validate(['file' => ['required', 'image', 'max:5120'], 'collection' => ['nullable', 'string', 'max:80']]);
            $collection = preg_replace('/[^a-z0-9_\/-]/i', '', request('collection', 'admin')) ?: 'admin';
            $path = request()->file('file')->store($collection, 'public');
            return response()->json(['path' => Storage::url($path)]);
        });
        Route::get('/admin/users', fn () => response()->json(DB::table('users')->get()));
        Route::put('/admin/users/{id}', fn (string $id) => response()->json(tap(DB::table('users')->where('id', $id)->update(request()->all()), fn () => null)));
        Route::delete('/admin/users/{id}', fn (string $id) => response()->json(['success' => DB::table('users')->where('id', $id)->delete() > 0]));
        Route::get('/admin/organizers', fn () => response()->json(DB::table('organizers')->get()));
        Route::put('/admin/organizers/{id}', fn (string $id) => response()->json(tap(DB::table('organizers')->where('id', $id)->update(request()->all()), fn () => null)));
        Route::delete('/admin/organizers/{id}', fn (string $id) => response()->json(['success' => DB::table('organizers')->where('id', $id)->delete() > 0]));
        Route::get('/admin/events', fn () => response()->json(DB::table('events')->get()));
        Route::post('/admin/events', [MarketplaceController::class, 'adminStoreEvent']);
        Route::put('/admin/events/{id}', [MarketplaceController::class, 'adminUpdateEvent']);
        Route::delete('/admin/events/{id}', fn (string $id) => response()->json(['success' => DB::table('events')->where('id', $id)->delete() > 0]));
        Route::get('/admin/orders', fn () => response()->json(DB::table('orders')->get()));
        Route::get('/admin/categories', fn () => response()->json(DB::table('categories')->get()));
        Route::post('/admin/categories', fn () => response()->json(['id' => DB::table('categories')->insertGetId(array_merge(request()->all(), ['created_at' => now(), 'updated_at' => now()]))], 201));
        Route::put('/admin/categories/{id}', fn (string $id) => response()->json(['success' => DB::table('categories')->where('id', $id)->update(array_merge(request()->all(), ['updated_at' => now()])) > 0]));
        Route::delete('/admin/categories/{id}', fn (string $id) => response()->json(['success' => DB::table('categories')->where('id', $id)->delete() > 0]));
        Route::get('/admin/travels', fn () => response()->json(DB::table('travels')->get()));
        Route::post('/admin/travels', fn () => response()->json(['id' => DB::table('travels')->insertGetId(array_merge(request()->all(), ['created_at' => now(), 'updated_at' => now()]))], 201));
        Route::put('/admin/travels/{id}', fn (string $id) => response()->json(['success' => DB::table('travels')->where('id', $id)->update(array_merge(request()->all(), ['updated_at' => now()])) > 0]));
        Route::delete('/admin/travels/{id}', fn (string $id) => response()->json(['success' => DB::table('travels')->where('id', $id)->delete() > 0]));
        Route::get('/admin/movies', fn () => response()->json(DB::table('movies')->get()));
        Route::post('/admin/movies', fn () => response()->json(['id' => DB::table('movies')->insertGetId(array_merge(request()->all(), ['created_at' => now(), 'updated_at' => now()]))], 201));
        Route::put('/admin/movies/{id}', fn (string $id) => response()->json(['success' => DB::table('movies')->where('id', $id)->update(array_merge(request()->all(), ['updated_at' => now()])) > 0]));
        Route::delete('/admin/movies/{id}', fn (string $id) => response()->json(['success' => DB::table('movies')->where('id', $id)->delete() > 0]));
        Route::get('/admin/content', fn () => response()->json(DB::table('content_blocks')->get()));
        Route::post('/admin/content', fn () => response()->json(['id' => DB::table('content_blocks')->insertGetId(array_merge(request()->all(), ['created_at' => now(), 'updated_at' => now()]))], 201));
        Route::put('/admin/content/{id}', fn (string $id) => response()->json(['success' => DB::table('content_blocks')->where('id', $id)->update(array_merge(request()->all(), ['updated_at' => now()])) > 0]));
        Route::delete('/admin/content/{id}', fn (string $id) => response()->json(['success' => DB::table('content_blocks')->where('id', $id)->delete() > 0]));
        Route::get('/admin/settings', fn () => response()->json(DB::table('settings')->pluck('value', 'key')));
        Route::put('/admin/settings', function () {
            foreach (request()->all() as $key => $value) {
                DB::table('settings')->updateOrInsert(
                    ['key' => $key],
                    ['value' => is_bool($value) ? ($value ? '1' : '0') : (string) $value, 'updated_at' => now(), 'created_at' => now()]
                );
            }
            return response()->json(['success' => true]);
        });

        Route::apiResource('/admin/producers', ProducerController::class);
        Route::apiResource('/admin/packs', PackController::class);
        Route::put('/admin/producers/{producer}/pack', [ProducerPackSubscriptionController::class, 'assignOrChange']);
    });

    Route::middleware('role:organizer,producer')->group(function (): void {
        Route::get('/producer/dashboard/pack', [ProducerPortalController::class, 'dashboard']);
        Route::get('/producer/events', [ProducerPortalController::class, 'events']);
        Route::post('/producer/events', [ProducerPortalController::class, 'storeEvent']);
    });
});
