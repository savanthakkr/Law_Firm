<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workflows', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('trigger_event')->nullable(); // case_created, task_completed, etc.
            $table->boolean('is_active')->default(true);

            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            $table->index(['created_by', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workflows');
    }
};