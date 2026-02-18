<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hearings', function (Blueprint $table) {
            $table->id();
            $table->string('hearing_id')->unique();
            $table->foreignId('case_id')->constrained('cases')->onDelete('cascade');
            $table->foreignId('court_id')->constrained('courts')->onDelete('cascade');
            $table->foreignId('judge_id')->nullable()->constrained('judges')->onDelete('set null');
            $table->foreignId('hearing_type_id')->nullable()->constrained('hearing_types')->onDelete('set null');
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('hearing_date');
            $table->time('hearing_time');
            $table->integer('duration_minutes')->default(60);
            $table->enum('status', ['scheduled', 'in_progress', 'completed', 'postponed', 'cancelled'])->default('scheduled');
            $table->text('notes')->nullable();
            $table->text('outcome')->nullable();
            $table->json('attendees')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            $table->index(['case_id', 'hearing_date']);
            $table->index(['court_id', 'hearing_date']);
            $table->index(['created_by', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hearings');
    }
};