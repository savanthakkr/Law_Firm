<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('research_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('research_project_id')->constrained('research_projects')->onDelete('cascade');
            $table->string('title');
            $table->longText('note_content');
            $table->text('source_reference')->nullable();
            $table->json('tags')->nullable();
            $table->boolean('is_private')->default(false);
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            $table->index(['research_project_id']);
            $table->index(['created_by']);
            $table->index(['is_private']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('research_notes');
    }
};