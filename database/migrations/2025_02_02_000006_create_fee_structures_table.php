<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fee_structures', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('created_by');
            $table->unsignedBigInteger('client_id')->nullable();
            $table->unsignedBigInteger('case_id')->nullable();
            $table->unsignedBigInteger('fee_type_id');
            $table->decimal('amount', 10, 2)->nullable();
            $table->decimal('percentage', 5, 2)->nullable();
            $table->decimal('hourly_rate', 8, 2)->nullable();
            $table->text('description')->nullable();
            $table->date('effective_date');
            $table->date('end_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('client_id')->references('id')->on('clients')->onDelete('cascade');
            $table->foreign('fee_type_id')->references('id')->on('fee_types')->onDelete('cascade');
            $table->index(['created_by', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fee_structures');
    }
};