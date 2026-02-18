<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('case_timelines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('case_id')->constrained('cases')->onDelete('cascade');
            $table->string('event_type')->default('milestone');
            $table->string('title');
            $table->text('description')->nullable();
            $table->dateTime('event_date');
            $table->boolean('is_completed')->default(false);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            $table->index(['case_id', 'event_date']);
            $table->index(['created_by']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('case_timelines');
    }
};