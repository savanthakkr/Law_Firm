<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('research_projects', function (Blueprint $table) {
            $table->id();
            $table->string('research_id')->unique();
            $table->string('title');
            $table->text('description')->nullable();
            // research_type field removed - using research_type_id foreign key instead
            $table->foreignId('case_id')->nullable()->constrained('cases')->onDelete('set null');
            $table->enum('status', ['active', 'completed', 'on_hold', 'cancelled'])->default('active');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->date('due_date')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            $table->index(['created_by', 'status']);
            $table->index(['case_id']);
            $table->index(['assigned_to']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('research_projects');
    }
};