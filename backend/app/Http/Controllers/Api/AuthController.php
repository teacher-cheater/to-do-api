<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * POST /api/auth/login
     *
     * Sanctum SPA flow: the frontend first GETs /sanctum/csrf-cookie, then
     * posts credentials here. On success Laravel sets an HttpOnly session
     * cookie — no token is handled by JS, which avoids XSS token theft.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->validated();

        if (! Auth::attempt($credentials, remember: true)) {
            throw ValidationException::withMessages([
                'email' => ['Указанные учетные данные неверны.'],
            ]);
        }

        $request->session()->regenerate();

        return response()->json([
            'data' => Auth::user(),
        ]);
    }

    /**
     * POST /api/auth/logout
     */
    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Выход выполнен успешно.']);
    }

    /**
     * GET /api/user
     */
    public function user(Request $request): JsonResponse
    {
        return response()->json(['data' => $request->user()]);
    }
}
