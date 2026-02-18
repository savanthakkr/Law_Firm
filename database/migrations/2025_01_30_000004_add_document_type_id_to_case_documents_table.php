<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('case_documents', function (Blueprint $table) {
            $table->foreignId('document_type_id')->nullable()->after('file_path')->constrained('document_types')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('case_documents', function (Blueprint $table) {
            $table->dropForeign(['document_type_id']);
            $table->dropColumn('document_type_id');
        });
    }
};