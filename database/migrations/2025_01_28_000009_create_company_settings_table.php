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
        Schema::create('company_settings', function (Blueprint $table) {
            $table->id();
            $table->string('setting_key');
            $table->text('setting_value')->nullable();
            $table->enum('setting_type', ['text', 'number', 'boolean', 'json', 'file'])->default('text');
            $table->string('category')->default('general');
            $table->text('description')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            // Unique constraint - one setting per key per company
            $table->unique(['setting_key', 'created_by']);
            // Index for better performance
            $table->index(['created_by', 'category']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('company_settings');
    }
};