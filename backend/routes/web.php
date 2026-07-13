<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'message' => 'To-do-list работает!',
        'status' => 'OK',
    ]);
});
