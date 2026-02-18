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
        Schema::create('compliance_audits', function (Blueprint $table) {
            $table->id();
            $table->string('audit_title');
            $table->foreignId('audit_type_id')->constrained('audit_types')->onDelete('cascade');
            $table->text('description');
            $table->date('audit_date');
            $table->date('completion_date')->nullable();
            $table->enum('status', ['planned', 'in_progress', 'completed', 'cancelled'])->default('planned');
            $table->text('scope')->nullable();
            $table->text('findings')->nullable();
            $table->text('recommendations')->nullable();
            $table->enum('risk_level', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->string('auditor_name')->nullable();
            $table->string('auditor_organization')->nullable();
            $table->text('corrective_actions')->nullable();
            $table->date('follow_up_date')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            // Index for better performance
            $table->index(['created_by', 'status']);
            $table->index(['audit_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('compliance_audits');
    }
};