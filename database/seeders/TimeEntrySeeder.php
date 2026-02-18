<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TimeEntry;
use App\Models\User;
use App\Models\CaseModel;
use Illuminate\Support\Facades\DB;

class TimeEntrySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $companyUsers = User::where('type', 'company')->get();
        
        foreach ($companyUsers as $companyUser) {
            $cases = CaseModel::where('created_by', $companyUser->id)->get();
            $clients = \App\Models\Client::where('created_by', $companyUser->id)->get();
            $users = User::where('created_by', $companyUser->id)->get();
            
            if ($cases->count() > 0) {
                // Create 2-3 time entries per case
                foreach ($cases as $case) {
                    $entryCount = rand(8, 10);
                    $descriptions = [
                        'Legal research on case precedents',
                        'Client consultation and case review',
                        'Document preparation and filing',
                        'Court appearance and hearing',
                        'Contract review and analysis',
                        'Discovery and evidence gathering',
                        'Settlement negotiations',
                        'Administrative tasks and filing'
                    ];
                    
                    $statuses = ['approved']; // Only approved for invoicing
                    
                    for ($i = 1; $i <= $entryCount; $i++) {
                        $entryDate = now()->subDays(rand(1, 30));
                        $startHour = rand(9, 16);
                        $duration = rand(1, 8) * 0.5;
                        $endTime = $startHour + $duration;
                        
                        $entryData = [
                            'case_id' => $case->id,
                            'client_id' => $case->client_id,
                            'invoice_id' => null,
                            'user_id' => $users->count() > 0 ? $users->random()->id : $companyUser->id,
                            'description' => $descriptions[array_rand($descriptions)],
                            'hours' => $duration,
                            'billable_rate' => rand(150, 300),
                            'is_billable' => true,
                            'entry_date' => $entryDate,
                            'start_time' => sprintf('%02d:00', $startHour),
                            'end_time' => sprintf('%02d:%02d', floor($endTime), ($endTime - floor($endTime)) * 60),
                            'status' => 'approved',
                            'notes' => 'Professional legal services for case.',
                            'created_by' => $companyUser->id,
                        ];
                        
                        TimeEntry::create($entryData);
                    }
                }
            }
        }
    }
}