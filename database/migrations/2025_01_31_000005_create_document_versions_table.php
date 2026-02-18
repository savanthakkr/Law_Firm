<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained('documents')->onDelete('cascade');
            $table->string('version_number');
            $table->string('file_path');
            $table->text('changes_description')->nullable();
            $table->boolean('is_current')->default(false);
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            $table->index(['document_id', 'is_current']);
            $table->index(['created_by']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_versions');
    }
};