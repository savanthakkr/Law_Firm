<?php

namespace Database\Seeders;

use App\Models\CaseNote;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CaseNoteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $companyUsers = User::where('type', 'company')->get();
        
        foreach ($companyUsers as $companyUser) {
            // Get cases for this company
            $cases = \App\Models\CaseModel::where('created_by', $companyUser->id)->get();
            if ($cases->isEmpty()) continue;
            
            // Get team members for this company
            $teamMembers = User::where('created_by', $companyUser->id)
                ->where('type', 'team_member')
                ->get();
            
            // All users who can create notes (company + team members)
            $allUsers = collect([$companyUser])->merge($teamMembers);
            
            foreach ($cases as $case) {
                $noteTemplates = [
                    [
                        'title' => 'Initial Client Meeting Notes',
                        'content' => 'Met with client to discuss case details. Client provided background information about the incident. Key points: timeline of events, witness information, and client\'s main concerns.',
                        'note_type' => 'general',
                        'priority' => 'high',
                        'is_private' => false,
                        'tags' => ['client-meeting', 'initial-consultation'],
                    ],
                    [
                        'title' => 'Legal Research Notes',
                        'content' => 'Researched similar cases and relevant statutes. Found precedents that support our position. Need to analyze further for strategy development.',
                        'note_type' => 'general',
                        'priority' => 'medium',
                        'is_private' => false,
                        'tags' => ['research', 'precedents'],
                    ],
                    [
                        'title' => 'Strategy Discussion',
                        'content' => 'Internal team discussion about case strategy. Decided on approach and assigned tasks to team members for next steps.',
                        'note_type' => 'general',
                        'priority' => 'high',
                        'is_private' => true,
                        'tags' => ['strategy', 'internal'],
                    ],
                    [
                        'title' => 'Case Progress Update',
                        'content' => 'Weekly case review completed. All deadlines are on track. Discovery phase proceeding smoothly. No major issues identified.',
                        'note_type' => 'general',
                        'priority' => 'medium',
                        'is_private' => false,
                        'tags' => ['weekly-review', 'update'],
                    ],
                    [
                        'title' => 'Court Hearing Preparation',
                        'content' => 'Prepared for upcoming court hearing. Reviewed all evidence and witness statements. Finalized argument strategy and key points.',
                        'note_type' => 'general',
                        'priority' => 'high',
                        'is_private' => false,
                        'tags' => ['court-hearing', 'preparation'],
                    ],
                    [
                        'title' => 'Evidence Analysis',
                        'content' => 'Analyzed new evidence submitted by opposing party. Identified potential weaknesses in their argument. Need to prepare counter-evidence.',
                        'note_type' => 'general',
                        'priority' => 'high',
                        'is_private' => true,
                        'tags' => ['evidence', 'analysis'],
                    ],
                    [
                        'title' => 'Settlement Discussion',
                        'content' => 'Discussed potential settlement options with client. Client is open to negotiation but wants to ensure fair compensation.',
                        'note_type' => 'general',
                        'priority' => 'medium',
                        'is_private' => true,
                        'tags' => ['settlement', 'negotiation'],
                    ],
                ];
                
                // Create 2-5 notes per case
                $noteCount = rand(2, 5);
                $notesToCreate = collect($noteTemplates)->random($noteCount);
                
                foreach ($notesToCreate as $noteData) {
                    // Randomly assign creator from company or team members
                    $creator = $allUsers->random();
                    
                    CaseNote::create([
                        ...$noteData,
                        'case_ids' => [(string)$case->id],
                        'note_date' => now()->subDays(rand(1, 30)),
                        'status' => 'active',
                        'created_by' => $creator->id,
                    ]);
                }
            }
        }
    }
}