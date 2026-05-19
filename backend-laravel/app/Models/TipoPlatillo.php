<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TipoPlatillo extends Model
{
    protected $table = 'tipos_platillo';
    public $timestamps = false;
    
    protected $fillable = [
        'nombre', 'descripcion', 'bloqueado'
    ];
}
