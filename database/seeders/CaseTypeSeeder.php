<?php

namespace Database\Seeders;

use App\Models\CaseType;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CaseTypeSeeder extends Seeder
{
    public function run(): void
    {
        
        $companyUsers = User::where('type', 'company')->get();
        
        foreach ($companyUsers as $companyUser) {
            // Create 2-3 case types per company
            $caseTypeCount = rand(8, 10);
            $availableCaseTypes = [
                ['name' => 'Criminal Law', 'description' => 'Criminal defense and prosecution cases', 'color' => '#EF4444'],
                ['name' => 'Civil Law', 'description' => 'Civil litigation and disputes', 'color' => '#3B82F6'],
                ['name' => 'Corporate Law', 'description' => 'Business and corporate legal matters', 'color' => '#10B981'],
                ['name' => 'Family Law', 'description' => 'Divorce, custody, and family matters', 'color' => '#F59E0B'],
                ['name' => 'Real Estate', 'description' => 'Property and real estate transactions', 'color' => '#8B5CF6'],
                ['name' => 'Employment Law', 'description' => 'Workplace and employment issues', 'color' => '#06B6D4'],
                ['name' => 'Personal Injury', 'description' => 'Personal injury and accident cases', 'color' => '#DC2626'],
                ['name' => 'Immigration Law', 'description' => 'Immigration and visa matters', 'color' => '#059669'],
                ['name' => 'Intellectual Property', 'description' => 'Patents, trademarks, and IP disputes', 'color' => '#F97316'],
                ['name' => 'Tax Law', 'description' => 'Tax disputes and compliance', 'color' => '#84CC16'],
                ['name' => 'Environmental Law', 'description' => 'Environmental regulations and compliance', 'color' => '#6B7280'],
            ];
            
            // Randomly select case types for this company
            $selectedTypes = collect($availableCaseTypes)->random($caseTypeCount);
            
            foreach ($selectedTypes as $caseTypeData) {
                CaseType::firstOrCreate(
                    ['name' => $caseTypeData['name'], 'created_by' => $companyUser->id],
                    [
                        'description' => $caseTypeData['description'],
                        'color' => $caseTypeData['color'],
                        'status' => 'active',
                        'created_by' => $companyUser->id
                    ]
                );
            }
        }
    }
}