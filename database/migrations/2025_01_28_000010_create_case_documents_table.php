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
        Schema::create('case_documents', function (Blueprint $table) {
            $table->id();
            $table->string('document_id')->unique();
            $table->string('document_name');
            $table->string('file_path');
            $table->text('description')->nullable();
            $table->enum('confidentiality', ['public', 'confidential', 'privileged'])->default('confidential');
            $table->date('document_date')->nullable();
            $table->enum('status', ['active', 'archived'])->default('active');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            // Index for better performance
            $table->index(['created_by', 'status']);

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('case_documents');
    }
};