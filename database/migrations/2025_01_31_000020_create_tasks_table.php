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
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->string('task_id')->unique(); // Auto-generated task ID
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('priority', ['critical', 'high', 'medium', 'low'])->default('medium');
            $table->enum('status', ['not_started', 'in_progress', 'completed', 'on_hold'])->default('not_started');
            $table->datetime('due_date')->nullable();
            $table->integer('estimated_duration')->nullable(); // in minutes
            $table->foreignId('case_id')->nullable()->constrained('cases')->onDelete('cascade');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            $table->unsignedBigInteger('task_type_id')->nullable();
            $table->unsignedBigInteger('task_status_id')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            // Index for better performance
            $table->index(['created_by', 'status']);
            $table->index(['assigned_to']);
            $table->index(['case_id']);
            $table->index(['due_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};