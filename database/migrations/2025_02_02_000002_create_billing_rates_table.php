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
        Schema::create('billing_rates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('client_id')->nullable()->constrained('clients')->onDelete('cascade');
            $table->enum('rate_type', ['hourly', 'fixed', 'contingency'])->default('hourly');
            $table->decimal('hourly_rate', 10, 2)->nullable();
            $table->decimal('fixed_amount', 10, 2)->nullable();
            $table->decimal('contingency_percentage', 5, 2)->nullable();
            $table->date('effective_date');
            $table->date('end_date')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            // Indexes for better performance
            $table->index(['created_by', 'status']);
            $table->index(['user_id']);
            $table->index(['client_id']);
            $table->index(['effective_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('billing_rates');
    }
};