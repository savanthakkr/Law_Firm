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
        Schema::create('hearing_types', function (Blueprint $table) {
            $table->id();
            $table->string('type_id')->unique(); // Auto-generated type ID
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('duration_estimate')->nullable(); // Duration in minutes
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->text('requirements')->nullable(); // JSON field for requirements
            $table->text('notes')->nullable();
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
        Schema::dropIfExists('hearing_types');
    }
};