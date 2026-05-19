<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('platillo_guarniciones');
        Schema::dropIfExists('guarniciones');
        Schema::dropIfExists('combo_seccion_items');
        Schema::dropIfExists('combo_secciones');
        Schema::dropIfExists('combos');
        Schema::dropIfExists('platillos');
        Schema::dropIfExists('tipos_platillo');
        Schema::dropIfExists('restaurantes');
        Schema::dropIfExists('users');
        Schema::dropIfExists('roles');
        Schema::enableForeignKeyConstraints();

        $sqlPath = base_path('../backend/schema.sql');
        if (file_exists($sqlPath)) {
            $sql = file_get_contents($sqlPath);
            \Illuminate\Support\Facades\DB::unprepared($sql);
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('platillo_guarniciones');
        Schema::dropIfExists('guarniciones');
        Schema::dropIfExists('combo_seccion_items');
        Schema::dropIfExists('combo_secciones');
        Schema::dropIfExists('combos');
        Schema::dropIfExists('platillos');
        Schema::dropIfExists('tipos_platillo');
        Schema::dropIfExists('restaurantes');
        Schema::dropIfExists('users');
        Schema::dropIfExists('roles');
        Schema::enableForeignKeyConstraints();
    }
};
