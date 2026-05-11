<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Category::query()->where('is_active', true);

        if ($type = $request->string('type')->toString()) {
            $query->where('type', $type);
        }

        return response()->json([
            'data' => CategoryResource::collection(
                $query->orderBy('display_order')->orderBy('name')->get()
            ),
        ]);
    }
}
