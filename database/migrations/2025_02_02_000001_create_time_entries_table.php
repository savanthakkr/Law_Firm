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
        Schema::create('time_entries', function (Blueprint $table) {
            $table->id();
            $table->string('entry_id')->unique(); // Auto-generated entry ID
            $table->foreignId('case_id')->nullable()->constrained('cases')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->text('description');
            $table->decimal('hours', 8, 2);
            $table->decimal('billable_rate', 10, 2)->nullable();
            $table->boolean('is_billable')->default(true);
            $table->date('entry_date');
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->enum('status', ['draft', 'submitted', 'approved', 'billed'])->default('draft');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            // Indexes for better performance
            $table->index(['created_by', 'status']);
            $table->index(['case_id']);
            $table->index(['user_id']);
            $table->index(['entry_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('time_entries');
    }
};