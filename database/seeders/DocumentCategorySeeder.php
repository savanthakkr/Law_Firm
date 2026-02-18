<?php

namespace Database\Seeders;

use App\Models\DocumentCategory;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DocumentCategorySeeder extends Seeder
{
    public function run(): void
    {
        $companyUsers = User::where('type', 'company')->get();
        
        foreach ($companyUsers as $companyUser) {
            // Create 2-3 document categories per company
            $categoryCount = rand(8, 10);
            $availableCategories = [
                [
                    'name' => 'Contracts',
                    'description' => 'Legal contracts and agreements',
                    'color' => '#3b82f6',
                ],
                [
                    'name' => 'Legal Briefs',
                    'description' => 'Court briefs and legal arguments',
                    'color' => '#10b981',
                ],
                [
                    'name' => 'Evidence',
                    'description' => 'Case evidence and supporting documents',
                    'color' => '#f59e0b',
                ],
                [
                    'name' => 'Correspondence',
                    'description' => 'Client and court correspondence',
                    'color' => '#8b5cf6',
                ],
                [
                    'name' => 'Court Filings',
                    'description' => 'Filed court documents and motions',
                    'color' => '#ef4444',
                ],
                [
                    'name' => 'Research',
                    'description' => 'Legal research and case law',
                    'color' => '#06b6d4',
                ],
                [
                    'name' => 'Financial Records',
                    'description' => 'Financial documents and statements',
                    'color' => '#84cc16',
                ],
                [
                    'name' => 'Discovery',
                    'description' => 'Discovery documents and depositions',
                    'color' => '#f97316',
                ],
                [
                    'name' => 'Administrative',
                    'description' => 'Administrative and procedural documents',
                    'color' => '#6b7280',
                ],
                [
                    'name' => 'Client Files',
                    'description' => 'Client personal and case files',
                    'color' => '#ec4899',
                ],
            ];
            
            // Randomly select document categories for this company
            $selectedCategories = collect($availableCategories)->random($categoryCount);
            
            foreach ($selectedCategories as $categoryData) {
                DocumentCategory::firstOrCreate([
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