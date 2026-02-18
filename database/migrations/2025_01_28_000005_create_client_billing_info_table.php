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
        Schema::create('client_billing_infos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('clients')->onDelete('cascade');
            $table->text('billing_address')->nullable();
            $table->string('billing_contact_name')->nullable();
            $table->string('billing_contact_email')->nullable();
            $table->string('billing_contact_phone')->nullable();
            $table->enum('payment_terms', ['net_15', 'net_30', 'net_45', 'net_60', 'due_on_receipt', 'custom'])->default('net_30');
            $table->string('custom_payment_terms')->nullable();
            $table->string('currency')->default('USD');
            $table->text('billing_notes')->nullable();
            $table->enum('status', ['active', 'suspended', 'closed'])->default('active');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            // Unique constraint - one billing info per client
            $table->unique('client_id');
            // Index for better performance
            $table->index(['created_by', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('client_billing_infos');
    }
};