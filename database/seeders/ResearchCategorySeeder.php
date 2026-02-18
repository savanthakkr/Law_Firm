<?php

namespace Database\Seeders;

use App\Models\ResearchCategory;
use App\Models\PracticeArea;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ResearchCategorySeeder extends Seeder
{
    public function run(): void
    {
        $companyUsers = User::where('type', 'company')->get();
        
        foreach ($companyUsers as $companyUser) {
            $practiceAreas = PracticeArea::where('created_by', $companyUser->id)->get();
            
            // Create 2-3 research categories per company
            $categoryCount = rand(8, 10);
            $availableCategories = [
                [
                    'name' => 'Constitutional Law',
                    'description' => 'Constitutional law research and precedents',
                    'color' => '#dc2626',
                ],
                [
                    'name' => 'Contract Law',
                    'description' => 'Contract law research and case studies',
                    'color' => '#2563eb',
                ],
                [
                    'name' => 'Criminal Law',
                    'description' => 'Criminal law research and precedents',
                    'color' => '#7c2d12',
                ],
                [
                    'name' => 'Employment Law',
                    'description' => 'Employment and labor law research',
                    'color' => '#059669',
                ],
                [
                    'name' => 'Corporate Law',
                    'description' => 'Corporate and business law research',
                    'color' => '#7c3aed',
                ],
                [
                    'name' => 'Intellectual Property',
                    'description' => 'IP law research and patent cases',
                    'color' => '#ea580c',
                ],
                [
                    'name' => 'Family Law',
                    'description' => 'Family law research and domestic relations',
                    'color' => '#be123c',
                ],
                [
                    'name' => 'Tax Law',
                    'description' => 'Tax law research and regulatory compliance',
                    'color' => '#0891b2',
                ],
                [
                    'name' => 'Environmental Law',
                    'description' => 'Environmental regulations and compliance research',
                    'color' => '#16a34a',
                ],
                [
                    'name' => 'Immigration Law',
                    'description' => 'Immigration law research and policy analysis',
                    'color' => '#ca8a04',
                ],
                [
                    'name' => 'Real Estate Law',
                    'description' => 'Property law and real estate transactions',
                    'color' => '#9333ea',
                ],
            ];
            
            // Randomly select research categories for this company
            $selectedCategories = collect($availableCategories)->random($categoryCount);
            
            foreach ($selectedCategories as $categoryData) {
                ResearchCategory::firstOrCreate([
                    'name' => $categoryData['name'],
                    'created_by' => $companyUser->id
                ], [
                    'description' => $categoryData['description'],
                    'color' => $categoryData['color'],
                    'practice_area_id' => $practiceAreas->count() > 0 ? $practiceAreas->random()->id : null,
                    'status' => 'active',
                    'created_by' => $companyUser->id,
                ]);
            }
        }
    }
}