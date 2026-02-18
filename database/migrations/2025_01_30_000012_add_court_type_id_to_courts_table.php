<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('courts', function (Blueprint $table) {
            $table->foreignId('court_type_id')->nullable()->constrained('court_types')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('courts', function (Blueprint $table) {
            $table->dropForeign(['court_type_id']);
            $table->dropColumn('court_type_id');
        });
    }
};