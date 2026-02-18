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
        Schema::create('cle_tracking', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('course_name');
            $table->string('provider');
            $table->decimal('credits_earned', 5, 2);
            $table->decimal('credits_required', 5, 2)->nullable();
            $table->date('completion_date');
            $table->date('expiry_date')->nullable();
            $table->string('certificate_number')->nullable();
            $table->string('certificate_file')->nullable();
            $table->enum('status', ['completed', 'in_progress', 'expired'])->default('completed');
            $table->text('description')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            // Index for better performance
            $table->index(['user_id', 'status']);
            $table->index(['created_by', 'completion_date']);
            $table->index(['expiry_date', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cle_tracking');
    }
};