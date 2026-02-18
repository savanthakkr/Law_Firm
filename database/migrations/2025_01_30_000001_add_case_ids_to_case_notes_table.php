<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('case_notes', function (Blueprint $table) {
            $table->json('case_ids')->nullable()->after('tags');
        });
    }

    public function down(): void
    {
        Schema::table('case_notes', function (Blueprint $table) {
            $table->dropColumn('case_ids');
        });
    }
};