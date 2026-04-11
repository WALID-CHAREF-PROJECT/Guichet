<?php

use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CityController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\NewsletterController;
use Illuminate\Support\Facades\Route;

Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{slug}', [EventController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/cities', [CityController::class, 'index']);
Route::post('/newsletter/subscribe', [NewsletterController::class, 'store']);
