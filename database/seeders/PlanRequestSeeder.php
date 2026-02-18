<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\PlanRequest;
use App\Models\User;
use App\Models\Plan;
use Illuminate\Support\Facades\DB;

class PlanRequestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $companies = User::where('type', 'company')->get();
        $plans = Plan::all();

        if ($companies->count() > 0 && $plans->count() > 0) {
            $statuses = ['pending', 'approved', 'rejected'];
            $durations = ['monthly', 'yearly'];
            $messages = [
                'We need more advanced features for our growing law firm.',
                'Our legal group requires enterprise-level capabilities.',
                'Looking to upgrade from free plan for better client management.',
                'Need advanced case tracking features.',
                'Require additional storage and user limits.',
                'Want to access premium legal templates.'
            ];

            foreach ($companies as $index => $company) {
                // Skip if not a company type user
                if ($company->type !== 'company') {
                    continue;
                }
                
                $plan = $plans->random();
                $status = $statuses[$index % count($statuses)];
                
                $requestData = [
                    'user_id' => $company->id,
                    'plan_id' => $plan->id,
                    'duration' => $durations[$index % count($durations)],
                    'status' => $status,
                    'message' => $messages[$index % count($messages)],
                ];
                
                // Add approval/rejection data for non-pending requests
                if ($status === 'approved') {
                    $requestData['approved_at'] = now()->subDays(rand(1, 30));
                    $requestData['approved_by'] = 1; // Super admin
                } elseif ($status === 'rejected') {
                    $requestData['rejected_at'] = now()->subDays(rand(1, 15));
                    $requestData['rejected_by'] = 1; // Super admin
                }
                
                PlanRequest::create($requestData);
            }
        }
    }
}
