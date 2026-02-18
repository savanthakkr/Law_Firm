<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cases', function (Blueprint $table) {
            $table->id();
            $table->string('case_id')->unique();
            $table->string('title');
            $table->text('description')->nullable();
            $table->foreignId('client_id')->constrained('clients')->onDelete('cascade');
            $table->foreignId('case_type_id')->constrained('case_types')->onDelete('cascade');
            $table->foreignId('case_status_id')->constrained('case_statuses')->onDelete('cascade');
            $table->enum('priority', ['low', 'medium', 'high'])->default('medium');
            $table->date('filing_date')->nullable();
            $table->date('expected_completion_date')->nullable();
            $table->decimal('estimated_value', 15, 2)->nullable();
            $table->text('opposing_party')->nullable();
            $table->text('court_details')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            $table->index(['created_by', 'status']);
            $table->index(['case_type_id']);
            $table->index(['case_status_id']);
            $table->index(['client_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cases');
    }
};