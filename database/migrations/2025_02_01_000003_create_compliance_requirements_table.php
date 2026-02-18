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
        Schema::create('compliance_requirements', function (Blueprint $table) {
            $table->id();
            $table->string('compliance_id')->unique();
            $table->string('title');
            $table->text('description');
            $table->string('regulatory_body');
            $table->foreignId('category_id')->constrained('compliance_categories')->onDelete('cascade');
            $table->string('jurisdiction')->nullable();
            $table->text('scope')->nullable();
            $table->date('effective_date')->nullable();
            $table->date('deadline')->nullable();
            $table->foreignId('frequency_id')->constrained('compliance_frequencies')->onDelete('cascade');
            $table->string('responsible_party')->nullable();
            $table->text('evidence_requirements')->nullable();
            $table->text('penalty_implications')->nullable();
            $table->text('monitoring_procedures')->nullable();
            $table->enum('status', ['pending', 'in_progress', 'compliant', 'non_compliant', 'overdue'])->default('pending');
            $table->enum('priority', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            // Indexes for better performance
            $table->index(['created_by', 'status']);
            $table->index(['deadline', 'status']);
            $table->index(['category_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('compliance_requirements');
    }
};