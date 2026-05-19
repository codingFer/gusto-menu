<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

use App\Http\Controllers\ApiController;

Route::get('/', function () {
    return response()->json(['message' => 'GustoMenu API is running 🚀 (Laravel)']);
});

Route::post('/register', [ApiController::class, 'register']);
Route::post('/login', [ApiController::class, 'login']);
Route::get('/restaurantes/id/{id}', [ApiController::class, 'getRestauranteById']);
Route::get('/restaurantes/{slug}', [ApiController::class, 'getRestauranteBySlug']);
Route::get('/tipos-platillo', [ApiController::class, 'getTiposPlatillo']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::get('/restaurantes', [ApiController::class, 'getRestaurantes']);
    Route::post('/restaurantes', [ApiController::class, 'createRestaurante']);
    Route::put('/restaurantes/{id}', [ApiController::class, 'updateRestaurante']);
    Route::post('/restaurantes/full', [ApiController::class, 'saveFullMenu']);

    // Admin only routes (checked in controller)
    Route::get('/users', [ApiController::class, 'getUsers']);
    Route::put('/users/{id}', [ApiController::class, 'updateUser']);
});
