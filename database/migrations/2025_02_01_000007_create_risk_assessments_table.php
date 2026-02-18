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
        Schema::create('risk_assessments', function (Blueprint $table) {
            $table->id();
            $table->string('risk_title');
            $table->unsignedBigInteger('risk_category_id');
            $table->foreign('risk_category_id')->references('id')->on('risk_categories');
            $table->text('description');
            $table->enum('probability', ['very_low', 'low', 'medium', 'high', 'very_high'])->default('medium');
            $table->enum('impact', ['very_low', 'low', 'medium', 'high', 'very_high'])->default('medium');
            $table->text('mitigation_plan')->nullable();
            $table->text('control_measures')->nullable();
            $table->date('assessment_date');
            $table->date('review_date')->nullable();
            $table->enum('status', ['identified', 'assessed', 'mitigated', 'monitored', 'closed'])->default('identified');
            $table->string('responsible_person')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            // Index for better performance
            $table->index(['created_by', 'status']);
            $table->index(['risk_category_id', 'probability', 'impact']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('risk_assessments');
    }
};