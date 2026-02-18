<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->string('message_id')->unique();
            $table->unsignedBigInteger('company_id');
            $table->unsignedBigInteger('sender_id');
            $table->unsignedBigInteger('recipient_id')->nullable();
            $table->unsignedBigInteger('conversation_id')->nullable();
            $table->string('subject')->nullable();
            $table->text('content');
            $table->enum('message_type', ['direct', 'group', 'case', 'announcement'])->default('direct');
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal');
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->json('attachments')->nullable();
            $table->unsignedBigInteger('case_id')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->unsignedBigInteger('created_by');
            $table->timestamps();

            $table->foreign('sender_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('recipient_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('case_id')->references('id')->on('cases')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            
            $table->index(['company_id', 'recipient_id', 'is_read']);
            $table->index(['conversation_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};