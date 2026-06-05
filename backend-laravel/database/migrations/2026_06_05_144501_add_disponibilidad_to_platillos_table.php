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
        Schema::table('platillos', function (Blueprint $table) {
            $table->string('disponibilidad', 20)->default('ALTA')->after('activo');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('platillos', function (Blueprint $table) {
            $table->dropColumn('disponibilidad');
        });
    }
};
