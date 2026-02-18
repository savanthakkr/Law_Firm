<?php

namespace Database\Seeders;

use App\Models\ResearchType;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ResearchTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get company users
        $companyUsers = User::where('type', 'company')->get();
        
        foreach ($companyUsers as $companyUser) {
            // Create 2-3 research types per company
            $researchTypeCount = rand(8, 10);
            $availableResearchTypes = [
                [
                    'name' => 'Legal Research',
                    'description' => 'General legal research and case law analysis',
                    'status' => 'active',
                ],
                [
                    'name' => 'Precedent Analysis',
                    'description' => 'Analysis of legal precedents and case studies',
                    'status' => 'active',
                ],
                [
                    'name' => 'Statutory Research',
                    'description' => 'Research on statutes, regulations and legal frameworks',
                    'status' => 'active',
                ],
                [
                    'name' => 'Comparative Law',
                    'description' => 'Comparative analysis of different legal systems',
                    'status' => 'active',
                ],
                [
                    'name' => 'Due Diligence',
                    'description' => 'Legal due diligence research for transactions',
                    'status' => 'active',
                ],
                [
                    'name' => 'Constitutional Research',
                    'description' => 'Research on constitutional law and rights',
                    'status' => 'active',
                ],
                [
                    'name' => 'Regulatory Analysis',
                    'description' => 'Analysis of regulatory compliance and requirements',
                    'status' => 'active',
                ],
                [
                    'name' => 'International Law',
                    'description' => 'Research on international legal frameworks',
                    'status' => 'active',
                ],
                [
                    'name' => 'Intellectual Property',
                    'description' => 'IP law research and patent analysis',
                    'status' => 'active',
                ],
                [
                    'name' => 'Environmental Law',
                    'description' => 'Environmental regulations and compliance research',
                    'status' => 'active',
                ],
            ];
            
            // Randomly select research types for this company
            $selectedTypes = collect($availableResearchTypes)->random($researchTypeCount);
            
            foreach ($selectedTypes as $researchTypeData) {
                ResearchType::firstOrCreate([
                    'name' => $researchTypeData['name'],
                    'created_by' => $companyUser->id
                ], [
                    'description' => $researchTypeData['description'],
                    'status' => $researchTypeData['status'],
                    'created_by' => $companyUser->id,
                ]);
            }
        }
    }
}