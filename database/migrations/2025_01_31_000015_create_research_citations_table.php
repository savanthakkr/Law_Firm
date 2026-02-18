<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('research_citations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('research_project_id')->constrained('research_projects')->onDelete('cascade');
            $table->string('citation_text');
            $table->foreignId('source_id')->nullable()->constrained('research_sources')->onDelete('set null');
            $table->string('page_number')->nullable();
            $table->enum('citation_type', ['case', 'statute', 'article', 'book', 'website', 'other'])->default('case');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            $table->index(['research_project_id']);
            $table->index(['source_id']);
            $table->index(['citation_type']);
            $table->index(['created_by']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('research_citations');
    }
};