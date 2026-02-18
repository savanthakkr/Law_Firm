<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('case_team_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('case_id')->constrained('cases')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');

            $table->date('assigned_date');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            $table->unique(['case_id', 'user_id']);
            $table->index(['case_id']);
            $table->index(['user_id']);
            $table->index(['created_by']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('case_team_members');
    }
};