<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiTokenAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        Log::debug('API auth incoming request', [
            'path' => $request->path(),
            'has_authorization_header' => $request->hasHeader('Authorization'),
            'token_prefix' => $token ? substr($token, 0, 8) : null,
        ]);
        if (!$token) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $user = User::query()->where('api_token', $token)->first();
        if (!$user || !$user->is_active) {
            Log::warning('API auth failed', [
                'path' => $request->path(),
                'user_found' => (bool) $user,
                'user_active' => $user?->is_active,
            ]);
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $request->setUserResolver(fn () => $user);

        Log::debug('API auth resolved user', [
            'path' => $request->path(),
            'user_id' => $user->id,
            'role' => $user->role,
        ]);

        return $next($request);
    }
}
