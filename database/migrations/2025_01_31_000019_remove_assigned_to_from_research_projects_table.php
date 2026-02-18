<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('research_projects', 'assigned_to')) {
            Schema::table('research_projects', function (Blueprint $table) {
                $table->dropForeign(['assigned_to']);
                $table->dropColumn('assigned_to');
            });
        }
    }

    public function down(): void
    {
        if (!Schema::hasColumn('research_projects', 'assigned_to')) {
            Schema::table('research_projects', function (Blueprint $table) {
                $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            });
        }
    }
};