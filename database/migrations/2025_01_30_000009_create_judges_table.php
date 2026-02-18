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
        Schema::create('judges', function (Blueprint $table) {
            $table->id();
            $table->string('judge_id')->unique(); // Auto-generated judge ID
            $table->foreignId('court_id')->constrained('courts')->onDelete('cascade');
            $table->string('name');
            $table->string('title')->nullable(); // Hon., Justice, etc.
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->text('preferences')->nullable(); // JSON field for judge preferences
            $table->text('contact_info')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            // Index for better performance
            $table->index(['created_by', 'status']);
            $table->index(['court_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('judges');
    }
};