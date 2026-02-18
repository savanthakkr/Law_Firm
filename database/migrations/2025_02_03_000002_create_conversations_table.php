<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id');
            $table->string('title')->nullable();
            $table->enum('type', ['direct', 'group', 'case'])->default('direct');
            $table->json('participants'); // Array of user IDs
            $table->unsignedBigInteger('case_id')->nullable();
            $table->timestamp('last_message_at')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->unsignedBigInteger('created_by');
            $table->timestamps();

            $table->foreign('case_id')->references('id')->on('cases')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            
            $table->index(['company_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};