<?php

namespace Database\Seeders;

use App\Models\Judge;
use App\Models\Court;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class JudgeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get company users
        $companyUsers = User::where('type', 'company')->get();
        
        foreach ($companyUsers as $companyUser) {
            // Get courts for this company
            $courts = Court::where('created_by', $companyUser->id)->get();
            
            if ($courts->count() > 0) {
                // Create 2-3 judges per company
                $judgeCount = rand(8, 10);
                $judgeNames = [
                    'Hon. Robert Johnson',
                    'Hon. Sarah Williams', 
                    'Justice Michael Davis',
                    'Hon. Patricia Brown',
                    'Chief Justice Thomas Wilson',
                    'Hon. Elizabeth Garcia',
                    'Justice David Martinez',
                    'Hon. Jennifer Taylor'
                ];
                
                $titles = ['Honorable', 'Justice', 'Chief Justice'];
                $preferences = [
                    ['morning_sessions' => true, 'max_cases_per_day' => 15, 'break_duration' => 30],
                    ['child_friendly' => true, 'mediation_preferred' => true, 'max_cases_per_day' => 12],
                    ['complex_cases' => true, 'expert_witnesses' => true, 'max_cases_per_day' => 8],
                    ['jury_trials' => true, 'plea_bargains' => true, 'max_cases_per_day' => 20],
                    ['appellate_cases' => true, 'constitutional_matters' => true, 'max_cases_per_day' => 6]
                ];
                
                for ($i = 1; $i <= $judgeCount; $i++) {
                    $judgeData = [
                        'court_id' => $courts->random()->id,
                        'name' => $judgeNames[($companyUser->id + $i - 1) % count($judgeNames)],
                        'title' => $titles[($i - 1) % count($titles)],
                        'email' => 'judge' . $i . '@' . strtolower(str_replace(' ', '', $companyUser->name)) . '.gov',
                        'phone' => '+1-555-' . str_pad($companyUser->id . $i, 4, '0', STR_PAD_LEFT),
                        'preferences' => $preferences[($i - 1) % count($preferences)],
                        'contact_info' => 'Chambers: Room ' . ($i * 100) . ', Available Mon-Fri 9AM-5PM',
                        'status' => rand(1, 10) > 9 ? 'inactive' : 'active', // 10% chance inactive
                        'notes' => 'Judge #' . $i . ' for ' . $companyUser->name . '. Experienced in various legal matters and court procedures.',
                        'created_by' => $companyUser->id,
                    ];
                    
                    Judge::firstOrCreate([
                        'name' => $judgeData['name'],
                        'created_by' => $companyUser->id
                    ], $judgeData);
                }
            }
        }
    }
}