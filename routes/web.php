<?php

use Illuminate\Support\Facades\Route;

Route::get('/auth', function () {
    return view('auth');
});

Route::get('/reservas', function () {
    return view('reservas');
});

Route::get('/admin', function () {
    return view('admin');
});
