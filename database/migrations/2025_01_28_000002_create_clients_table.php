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
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->string('client_id')->unique(); // Auto-generated client ID
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->foreignId('client_type_id')->constrained('client_types')->onDelete('cascade');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->string('company_name')->nullable(); // For corporate clients
            $table->string('tax_id')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->text('notes')->nullable();
            $table->string('referral_source')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            // Index for better performance
            $table->index(['created_by', 'status']);
            $table->index(['client_type_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};