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
        Schema::create('dashboards', function (Blueprint $table) {
            $table->id();
            $table->string('dashboard_id')->unique(); // Auto-generated dashboard ID
            $table->string('name');
            $table->text('description')->nullable();
            $table->json('layout_config')->nullable(); // Widget layout configuration
            $table->enum('dashboard_type', ['executive', 'financial', 'operational', 'custom'])->default('custom');
            $table->boolean('is_default')->default(false);
            $table->boolean('is_public')->default(false);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->unsignedBigInteger('user_id')->nullable(); // Owner of custom dashboard
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            // Index for better performance
            $table->index(['created_by', 'status']);
            $table->index(['user_id']);
            $table->index(['dashboard_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dashboards');
    }
};