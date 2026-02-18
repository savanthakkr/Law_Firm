<?php

namespace Database\Seeders;

use App\Models\ResearchNote;
use App\Models\ResearchProject;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ResearchNoteSeeder extends Seeder
{
    public function run(): void
    {
        $companyUsers = User::where('type', 'company')->get();
        
        foreach ($companyUsers as $companyUser) {
            $projects = ResearchProject::where('created_by', $companyUser->id)->get();
            
            if ($projects->isEmpty()) continue;
            
            // Create 3-4 notes for each research project
            foreach ($projects as $project) {
                $noteTemplates = [
                    [
                        'title' => 'Initial Research Findings',
                        'note_content' => 'Found several relevant cases that support our position. The precedent analysis shows strong foundation for our legal argument.',
                        'source_reference' => 'Case Law Database - Multiple Citations',
                        'tags' => ['case-law', 'precedent', 'analysis'],
                        'is_private' => false,
                    ],
                    [
                        'title' => 'Statutory Analysis Notes',
                        'note_content' => 'Comprehensive review of relevant statutes and regulations. Recent amendments significantly impact case strategy and legal approach.',
                        'source_reference' => 'Legal Statutes Database',
                        'tags' => ['statute', 'regulation', 'amendment'],
                        'is_private' => true,
                    ],
                    [
                        'title' => 'Expert Opinion Research',
                        'note_content' => 'Consulted with legal experts and academic authorities. Their analysis provides valuable insights for case development.',
                        'source_reference' => 'Expert Consultation Reports',
                        'tags' => ['expert', 'consultation', 'opinion'],
                        'is_private' => false,
                    ],
                    [
                        'title' => 'Comparative Law Study',
                        'note_content' => 'Research into similar cases in other jurisdictions. International precedents may provide additional support for our position.',
                        'source_reference' => 'International Legal Database',
                        'tags' => ['comparative', 'international', 'jurisdiction'],
                        'is_private' => false,
                    ],
                    [
                        'title' => 'Legal Commentary Review',
                        'note_content' => 'Analysis of academic articles and legal commentary on relevant topics. Scholarly opinions strengthen theoretical foundation.',
                        'source_reference' => 'Academic Legal Journals',
                        'tags' => ['academic', 'commentary', 'theory'],
                        'is_private' => true,
                    ],
                ];
                
                // Create 3-4 notes per project
                $notesToCreate = collect($noteTemplates)->random(rand(3, 4));
                
                foreach ($notesToCreate as $noteData) {
                    ResearchNote::firstOrCreate([
                        'title' => $noteData['title'],
                        'research_project_id' => $project->id,
                        'created_by' => $companyUser->id
                    ], [
                        ...$noteData,
                        'research_project_id' => $project->id,
                        'created_by' => $companyUser->id,
                    ]);
                }
            }
        }
    }
}