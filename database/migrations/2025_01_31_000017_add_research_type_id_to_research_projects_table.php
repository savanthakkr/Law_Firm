<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('research_projects', function (Blueprint $table) {
            $table->foreignId('research_type_id')->nullable()->after('description')->constrained('research_types')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('research_projects', function (Blueprint $table) {
            $table->dropForeign(['research_type_id']);
            $table->dropColumn('research_type_id');
        });
    }
};