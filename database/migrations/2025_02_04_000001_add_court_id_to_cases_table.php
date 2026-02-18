<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cases', function (Blueprint $table) {
            $table->foreignId('court_id')->nullable()->after('case_status_id')->constrained('courts')->onDelete('set null');
            $table->index(['court_id']);
        });
    }

    public function down(): void
    {
        Schema::table('cases', function (Blueprint $table) {
            $table->dropForeign(['court_id']);
            $table->dropIndex(['court_id']);
            $table->dropColumn('court_id');
        });
    }
};