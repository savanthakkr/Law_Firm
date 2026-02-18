<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('company_profiles', function (Blueprint $table) {
            // Personal Details
            $table->string('advocate_name')->nullable()->after('name');
            $table->string('bar_registration_number')->nullable()->after('advocate_name');
            $table->integer('years_of_experience')->nullable()->after('bar_registration_number');
            
            // Professional Details
            $table->string('law_degree')->nullable()->after('years_of_experience');
            $table->string('university')->nullable()->after('law_degree');
            $table->text('specialization')->nullable()->after('university');
            
            // Court & Jurisdiction
            $table->text('court_jurisdictions')->nullable()->after('specialization');
            $table->string('languages_spoken')->nullable()->after('court_jurisdictions');
            
            // Business Details
            $table->decimal('consultation_fees', 10, 2)->nullable()->after('languages_spoken');
            $table->string('office_hours')->nullable()->after('consultation_fees');
            $table->integer('success_rate')->nullable()->after('office_hours');
            
            // Services
            $table->text('services_offered')->nullable()->after('success_rate');
            $table->text('notable_cases')->nullable()->after('services_offered');
        });
    }

    public function down(): void
    {
        Schema::table('company_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'advocate_name',
                'bar_registration_number',
                'years_of_experience',
                'law_degree',
                'university',
                'specialization',
                'court_jurisdictions',
                'languages_spoken',
                'consultation_fees',
                'office_hours',
                'success_rate',
                'services_offered',
                'notable_cases'
            ]);
        });
    }
};