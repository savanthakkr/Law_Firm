<?php

namespace Database\Seeders;

use App\Models\Hearing;
use App\Models\CaseModel;
use App\Models\Court;
use App\Models\Judge;
use App\Models\HearingType;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class HearingSeeder extends Seeder
{
    public function run(): void
    {
        $companyUsers = User::where('type', 'company')->get();

        foreach ($companyUsers as $companyUser) {
            // Get company-specific data
            $cases = CaseModel::where('created_by', $companyUser->id)->get();
            $courts = Court::where('created_by', $companyUser->id)->get();
            $judges = Judge::where('created_by', $companyUser->id)->get();
            $hearingTypes = HearingType::where('created_by', $companyUser->id)->get();

            if ($cases->count() > 0 && $courts->count() > 0) {
                // Create 2-3 hearings per company
                $hearingCount = rand(8, 10);
                $hearingTitles = [
                    'Initial Hearing',
                    'Evidence Presentation',
                    'Final Arguments',
                    'Motion Hearing',
                    'Settlement Conference',
                    'Status Conference',
                    'Pre-Trial Hearing',
                    'Sentencing Hearing'
                ];
                
                $statuses = ['scheduled', 'in_progress', 'completed', 'postponed', 'cancelled'];
                
                for ($i = 1; $i <= $hearingCount; $i++) {
                    $hearingDate = now()->addDays(rand(1, 60));
                    $hearingTime = sprintf('%02d:%02d', rand(9, 16), [0, 15, 30, 45][rand(0, 3)]);
                    
                    $hearingData = [
                        'case_id' => $cases->random()->id,
                        'court_id' => $courts->random()->id,
                        'judge_id' => $judges->count() > 0 ? $judges->random()->id : null,
                        'hearing_type_id' => $hearingTypes->count() > 0 ? $hearingTypes->random()->id : null,
                        'title' => $hearingTitles[($companyUser->id + $i - 1) % count($hearingTitles)],
                        'description' => 'Hearing #' . $i . ' for ' . $companyUser->name . '. Important legal proceeding requiring attendance.',
                        'hearing_date' => $hearingDate->format('Y-m-d'),
                        'hearing_time' => $hearingTime,
                        'duration_minutes' => [30, 60, 90, 120, 180][rand(0, 4)],
                        'status' => $statuses[rand(0, count($statuses) - 1)],
                        'notes' => 'Hearing scheduled for case proceedings. All parties required to attend.',
                        'outcome' => null,
                        'attendees' => ['attorney', 'client', 'opposing_counsel'],
                        'created_by' => $companyUser->id
                    ];
                    
                    Hearing::firstOrCreate([
                        'title' => $hearingData['title'],
                        'case_id' => $hearingData['case_id'],
                        'created_by' => $companyUser->id
                    ], $hearingData);
                }
            }
        }
    }
}
