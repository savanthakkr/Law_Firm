<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('professional_licenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('license_type');
            $table->string('license_number')->unique();
            $table->string('issuing_authority');
            $table->string('jurisdiction');
            $table->date('issue_date');
            $table->date('expiry_date');
            $table->enum('status', ['active', 'expired', 'suspended', 'revoked'])->default('active');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            $table->index(['created_by', 'status']);
            $table->index(['user_id', 'status']);
            $table->index(['expiry_date', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('professional_licenses');
    }
};