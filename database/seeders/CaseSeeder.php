<?php

namespace Database\Seeders;

use App\Models\CaseModel;
use App\Models\CaseType;
use App\Models\CaseStatus;
use App\Models\Client;
use App\Models\Court;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
class CaseSeeder extends Seeder
{
    public function run(): void
    {
        
        $companyUsers = User::where('type', 'company')->get();
        
        foreach ($companyUsers as $companyUser) {
            $caseTypes = CaseType::where('created_by', $companyUser->id)->get();
            $caseStatuses = CaseStatus::where('created_by', $companyUser->id)->get();
            $clients = Client::where('created_by', $companyUser->id)->get();
            $courts = Court::where('created_by', $companyUser->id)->get();
            
            if ($caseTypes->count() > 0 && $caseStatuses->count() > 0 && $clients->count() > 0) {
                $defaultStatus = $caseStatuses->where('is_default', true)->first() ?? $caseStatuses->first();
                
                // Create 5-7 cases per company
                $caseCount = rand(8, 10);
                $caseTitles = [
                    'Contract Dispute Resolution',
                    'Corporate Merger Review',
                    'Employment Law Case',
                    'Personal Injury Claim',
                    'Real Estate Transaction',
                    'Intellectual Property Dispute',
                    'Family Law Matter',
                    'Criminal Defense Case',
                    'Tax Law Consultation',
                    'Immigration Case'
                ];
                
                $opposingParties = [
                    'ABC Corporation',
                    'XYZ Industries',
                    'Global Tech Solutions',
                    'Metro Construction',
                    'City Development LLC',
                    'Prime Real Estate',
                    'United Services Inc',
                    'National Holdings',
                    'Regional Partners',
                    'Local Business Group'
                ];
                
                for ($i = 1; $i <= $caseCount; $i++) {
                    $filingDate = now()->subDays(rand(1, 90));
                    $expectedCompletion = $filingDate->copy()->addDays(rand(30, 365));
                    
                    $caseData = [
                        'title' => $caseTitles[($companyUser->id + $i - 1) % count($caseTitles)] . ' #' . $i,
                        'description' => 'Legal case #' . $i . ' for ' . $companyUser->name . '. This case involves complex legal matters requiring professional attention and expertise.',
                        'client_id' => $clients->random()->id,
                        'case_type_id' => $caseTypes->random()->id,
                        'case_status_id' => $caseStatuses->random()->id,
                        'court_id' => $courts->count() > 0 ? $courts->random()->id : null,
                        'priority' => ['low', 'medium', 'high'][rand(0, 2)],
                        'filing_date' => $filingDate,
                        'expected_completion_date' => $expectedCompletion,
                        'estimated_value' => rand(5000, 100000),
                        'opposing_party' => $opposingParties[($companyUser->id + $i - 1) % count($opposingParties)],
                        'court_details' => 'Court proceedings scheduled for case #' . $i . '. All documentation filed appropriately.',
                        'status' => rand(1, 10) > 8 ? 'inactive' : 'active', // 20% chance inactive
                        'created_by' => $companyUser->id,
                    ];
                    
                    CaseModel::firstOrCreate([
                        'title' => $caseData['title'],
                        'created_by' => $companyUser->id
                    ], $caseData);
                }
            }
        }
    }
}