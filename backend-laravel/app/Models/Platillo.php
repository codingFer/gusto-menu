<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Platillo extends Model
{
    public $timestamps = false;
    
    protected $fillable = [
        'restaurante_id', 'tipo_id', 'nombre', 'precio', 'emoji', 'orden', 'activo'
    ];

    public function restaurante()
    {
        return $this->belongsTo(Restaurante::class);
    }
}
