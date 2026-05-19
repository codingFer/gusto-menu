<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Guarnicion extends Model
{
    protected $table = 'guarniciones';
    public $timestamps = false;
    
    protected $fillable = [
        'restaurante_id', 'nombre', 'precio_extra'
    ];
}
