<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Restaurante extends Model
{
    public $timestamps = false;
    
    protected $fillable = [
        'user_id', 'slug', 'nombre', 'whatsapp', 'whatsapp_opcional', 'direccion',
        'tema', 'imagen_url', 'horarios', 'tagline', 'promo', 'precio_menu'
    ];

    protected $casts = [
        'horarios' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function platillos()
    {
        return $this->hasMany(Platillo::class);
    }
}
