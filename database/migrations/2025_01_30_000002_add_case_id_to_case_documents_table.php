<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('case_documents', function (Blueprint $table) {
            $table->foreignId('case_id')->nullable()->after('document_id')->constrained('cases')->onDelete('cascade');
            $table->index(['case_id', 'created_by']);
        });
    }

    public function down(): void
    {
        Schema::table('case_documents', function (Blueprint $table) {
            $table->dropForeign(['case_id']);
            $table->dropIndex(['case_id', 'created_by']);
            $table->dropColumn('case_id');
        });
    }
};