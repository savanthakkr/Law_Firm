<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('created_by');
            $table->unsignedBigInteger('case_id')->nullable();
            $table->unsignedBigInteger('expense_category_id');
            $table->string('description');
            $table->decimal('amount', 10, 2);
            $table->date('expense_date');
            $table->boolean('is_billable')->default(true);
            $table->boolean('is_approved')->default(false);
            $table->string('receipt_file')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('expense_category_id')->references('id')->on('expense_categories')->onDelete('cascade');
            $table->index(['created_by', 'is_billable']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};