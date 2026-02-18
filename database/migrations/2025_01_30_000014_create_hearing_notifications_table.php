<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hearing_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hearing_id')->constrained('hearings')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('type', ['email', 'sms', 'system'])->default('system');
            $table->integer('minutes_before');
            $table->enum('status', ['pending', 'sent', 'failed'])->default('pending');
            $table->timestamp('scheduled_at');
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();
            
            $table->index(['scheduled_at', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hearing_notifications');
    }
};