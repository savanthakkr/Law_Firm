<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('knowledge_articles', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->longText('content');
            $table->foreignId('category_id')->nullable()->constrained('research_categories')->onDelete('set null');
            $table->json('tags')->nullable();
            $table->boolean('is_public')->default(false);
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            $table->index(['created_by', 'status']);
            $table->index(['category_id']);
            $table->index(['is_public']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('knowledge_articles');
    }
};