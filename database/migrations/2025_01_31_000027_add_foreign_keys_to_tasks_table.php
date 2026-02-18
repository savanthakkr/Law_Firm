<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->foreign('task_type_id')->references('id')->on('task_types')->onDelete('set null');
            $table->foreign('task_status_id')->references('id')->on('task_statuses')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropForeign(['task_type_id']);
            $table->dropForeign(['task_status_id']);
        });
    }
};