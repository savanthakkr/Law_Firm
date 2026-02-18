<?php

namespace Database\Seeders;

use App\Models\ResearchProject;
use App\Models\ResearchType;
use App\Models\CaseModel;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ResearchProjectSeeder extends Seeder
{
    public function run(): void
    {
        $companyUsers = User::where('type', 'company')->get();
        
        foreach ($companyUsers as $companyUser) {
            $cases = CaseModel::where('created_by', $companyUser->id)->get();
            $researchTypes = ResearchType::where('created_by', $companyUser->id)->get();
            
            if ($researchTypes->isEmpty()) continue;
            
            // Create 2-3 research projects per company
            $projectCount = rand(8, 10);
            $projectTitles = [
                'Contract Law Precedent Research',
                'Employment Law Statutory Analysis',
                'Regulatory Compliance Research',
                'Constitutional Law Review',
                'Criminal Procedure Analysis',
                'Intellectual Property Research',
                'Family Law Case Study',
                'Corporate Governance Research'
            ];
            
            $descriptions = [
                'Research recent legal precedents for current case',
                'Analyze statutory requirements and compliance',
                'Review regulatory framework and guidelines',
                'Study constitutional implications and rights',
                'Examine procedural requirements and protocols',
                'Investigate intellectual property laws and cases',
                'Research family law statutes and precedents',
                'Analyze corporate governance best practices'
            ];
            
            $priorities = ['low', 'medium', 'high'];
            $statuses = ['active', 'completed', 'on_hold', 'cancelled'];
            
            for ($i = 1; $i <= $projectCount; $i++) {
                $dueDate = now()->addDays(rand(5, 30));
                
                $projectData = [
                    'title' => $projectTitles[($companyUser->id + $i - 1) % count($projectTitles)],
                    'description' => $descriptions[($companyUser->id + $i - 1) % count($descriptions)] . ' for ' . $companyUser->name . '.',
                    'research_type_id' => $researchTypes->random()->id,
                    'case_id' => $cases->count() > 0 ? $cases->random()->id : null,
                    'status' => $statuses[rand(0, count($statuses) - 1)],
                    'priority' => $priorities[rand(0, count($priorities) - 1)],
                    'due_date' => $dueDate,
                    'created_by' => $companyUser->id,
                ];
                
                ResearchProject::firstOrCreate([
                    'title' => $projectData['title'],
                    'created_by' => $companyUser->id
                ], $projectData);
            }
        }
    }
}