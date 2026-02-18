<?php

namespace Database\Seeders;

use App\Models\ResearchCitation;
use App\Models\ResearchProject;
use App\Models\ResearchSource;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ResearchCitationSeeder extends Seeder
{
    public function run(): void
    {
        $companyUsers = User::where('type', 'company')->get();
        
        foreach ($companyUsers as $companyUser) {
            $projects = ResearchProject::where('created_by', $companyUser->id)->get();
            $sources = ResearchSource::where('created_by', $companyUser->id)->get();
            
            if ($projects->isEmpty()) continue;
            
            // Create 3-4 citations for each research project
            foreach ($projects as $project) {
                $citationTemplates = [
                    [
                        'citation_text' => 'Smith v. Jones [2020] 2 All ER 123',
                        'citation_type' => 'case',
                        'page_number' => '125-127',
                        'notes' => 'Key case establishing legal precedent for contractual interpretation.',
                    ],
                    [
                        'citation_text' => 'Legal Rights Act 2022, Section 15',
                        'citation_type' => 'statute',
                        'page_number' => null,
                        'notes' => 'Statutory provision relevant to case analysis.',
                    ],
                    [
                        'citation_text' => 'Williams, S. (2021) "Modern Legal Principles" 45 Law Review 234',
                        'citation_type' => 'article',
                        'page_number' => '234-250',
                        'notes' => 'Academic analysis of contemporary legal developments.',
                    ],
                    [
                        'citation_text' => 'Brown, M. Legal Practice Handbook (3rd ed, 2023)',
                        'citation_type' => 'book',
                        'page_number' => '156-189',
                        'notes' => 'Comprehensive reference for legal practice principles.',
                    ],
                    [
                        'citation_text' => 'https://www.legalresearch.gov/database/cases',
                        'citation_type' => 'website',
                        'page_number' => null,
                        'notes' => 'Online legal database with relevant case materials.',
                    ],
                    [
                        'citation_text' => 'Taylor v. Wilson [2019] 1 WLR 456',
                        'citation_type' => 'case',
                        'page_number' => '458-462',
                        'notes' => 'Supporting case law for legal argument development.',
                    ],
                ];
                
                // Create 3-4 citations per project
                $citationsToCreate = collect($citationTemplates)->random(rand(3, 4));
                
                foreach ($citationsToCreate as $citationData) {
                    ResearchCitation::firstOrCreate([
                        'citation_text' => $citationData['citation_text'],
                        'research_project_id' => $project->id,
                        'created_by' => $companyUser->id
                    ], [
                        ...$citationData,
                        'research_project_id' => $project->id,
                        'source_id' => $sources->count() > 0 ? $sources->random()->id : null,
                        'created_by' => $companyUser->id,
                    ]);
                }
            }
        }
    }
}