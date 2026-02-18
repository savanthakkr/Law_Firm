<?php

namespace Database\Seeders;

use App\Models\ComplianceCategory;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ComplianceCategorySeeder extends Seeder
{
    public function run(): void
    {        
        $companyUsers = User::where('type', 'company')->get();
        
        foreach ($companyUsers as $companyUser) {
            // Create 2-3 compliance categories per company
            $categoryCount = rand(8, 10);
            $availableCategories = [
                ['name' => 'Professional', 'description' => 'Professional licensing and certification requirements', 'color' => '#3b82f6'],
                ['name' => 'Financial', 'description' => 'Financial compliance and reporting requirements', 'color' => '#10b981'],
                ['name' => 'Data Protection', 'description' => 'Data privacy and protection compliance', 'color' => '#f59e0b'],
                ['name' => 'Client Confidentiality', 'description' => 'Client confidentiality and privilege requirements', 'color' => '#ef4444'],
                ['name' => 'Trust Account', 'description' => 'Client trust account management and compliance', 'color' => '#8b5cf6'],
                ['name' => 'Continuing Education', 'description' => 'Continuing legal education requirements', 'color' => '#06b6d4'],
                ['name' => 'Regulatory', 'description' => 'Regulatory compliance and reporting requirements', 'color' => '#dc2626'],
                ['name' => 'Ethics', 'description' => 'Professional ethics and conduct requirements', 'color' => '#059669'],
                ['name' => 'Insurance', 'description' => 'Professional liability and malpractice insurance', 'color' => '#7c2d12'],
                ['name' => 'Technology', 'description' => 'Technology security and data management compliance', 'color' => '#1e40af'],
                ['name' => 'Court Rules', 'description' => 'Court rules and procedural compliance', 'color' => '#be123c'],
            ];
            
            // Randomly select compliance categories for this company
            $selectedCategories = collect($availableCategories)->random($categoryCount);
            
            foreach ($selectedCategories as $categoryData) {
                ComplianceCategory::firstOrCreate([
                    'name' => $categoryData['name'],
                    'created_by' => $companyUser->id
                ], [
                    'description' => $categoryData['description'],
                    'color' => $categoryData['color'],
                    'status' => 'active',
                    'created_by' => $companyUser->id,
                ]);
            }
        }
    }
}