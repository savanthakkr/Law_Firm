<?php

namespace Database\Seeders;

use App\Models\CaseTimeline;
use App\Models\CaseModel;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CaseTimelineSeeder extends Seeder
{
    public function run(): void
    {
        
        $companyUsers = User::where('type', 'company')->get();
        
        foreach ($companyUsers as $companyUser) {
            $cases = CaseModel::where('created_by', $companyUser->id)->get();
            
            foreach ($cases as $case) {
                $timelines = [
                    [
                        'event_type' => 'milestone',
                        'title' => 'Case Filed',
                        'description' => 'Initial case filing completed',
                        'event_date' => now()->subDays(30),
                        'is_completed' => true,
                    ],
                    [
                        'event_type' => 'hearing',
                        'title' => 'First Hearing',
                        'description' => 'Initial court hearing scheduled',
                        'event_date' => now()->subDays(15),
                        'is_completed' => true,
                    ],
                    [
                        'event_type' => 'deadline',
                        'title' => 'Document Submission',
                        'description' => 'Submit required documents to court',
                        'event_date' => now()->addDays(7),
                        'is_completed' => false,
                    ],
                    [
                        'event_type' => 'hearing',
                        'title' => 'Final Hearing',
                        'description' => 'Final court hearing scheduled',
                        'event_date' => now()->addDays(30),
                        'is_completed' => false,
                    ],
                ];
                
                foreach ($timelines as $timelineData) {
                    CaseTimeline::create([
                        ...$timelineData,
                        'case_id' => $case->id,
                        'created_by' => $companyUser->id,
                    ]);
                }
            }
        }
    }
}