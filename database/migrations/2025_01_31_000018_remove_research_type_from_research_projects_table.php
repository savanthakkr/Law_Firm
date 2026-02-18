<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('research_projects', 'research_type')) {
            Schema::table('research_projects', function (Blueprint $table) {
                $table->dropColumn('research_type');
            });
        }
    }

    public function down(): void
    {
        if (!Schema::hasColumn('research_projects', 'research_type')) {
            Schema::table('research_projects', function (Blueprint $table) {
                $table->string('research_type')->nullable()->after('description');
            });
        }
    }
};