<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->unsignedBigInteger('invoice_id')->nullable()->after('case_id');
            $table->foreign('invoice_id')->references('id')->on('invoices')->onDelete('set null');
            $table->index(['is_billable', 'is_approved', 'invoice_id']);
        });
    }

    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->dropForeign(['invoice_id']);
            $table->dropIndex(['is_billable', 'is_approved', 'invoice_id']);
            $table->dropColumn('invoice_id');
        });
    }
};