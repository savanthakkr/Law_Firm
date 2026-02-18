<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\BillingRate;
use App\Models\User;
use App\Models\Client;
use Illuminate\Support\Facades\DB;

class BillingRateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $companyUsers = User::where('type', 'company')->get();
        
        foreach ($companyUsers as $companyUser) {
            $clients = Client::where('created_by', $companyUser->id)->get();
            $users = User::where('created_by', $companyUser->id)->get();
            
            // Create 2-3 billing rates per company
            $rateCount = rand(8, 10);
            $rateTypes = ['hourly', 'fixed', 'contingency'];
            $statuses = ['active', 'inactive'];
            
            for ($i = 1; $i <= $rateCount; $i++) {
                $rateType = $rateTypes[($i - 1) % count($rateTypes)];
                $effectiveDate = now()->subMonths(rand(1, 12));
                $endDate = rand(1, 10) > 7 ? now()->addMonths(rand(3, 12)) : null; // 30% chance of end date
                
                $rateData = [
                    'user_id' => $users->count() > 0 ? $users->random()->id : $companyUser->id,
                    'client_id' => rand(1, 10) > 5 && $clients->count() > 0 ? $clients->random()->id : null, // 50% chance client-specific
                    'rate_type' => $rateType,
                    'hourly_rate' => $rateType === 'hourly' ? rand(100, 400) : null,
                    'fixed_amount' => $rateType === 'fixed' ? rand(1000, 10000) : null,
                    'contingency_percentage' => $rateType === 'contingency' ? rand(15, 40) : null,
                    'effective_date' => $effectiveDate,
                    'end_date' => $endDate,
                    'status' => $statuses[rand(0, count($statuses) - 1)],
                    'notes' => 'Billing rate #' . $i . ' for ' . $companyUser->name . '. ' . ucfirst($rateType) . ' billing structure.',
                    'created_by' => $companyUser->id,
                ];
                
                BillingRate::firstOrCreate([
                    'user_id' => $rateData['user_id'],
                    'client_id' => $rateData['client_id'],
                    'rate_type' => $rateData['rate_type'],
                    'created_by' => $companyUser->id
                ], $rateData);
            }
        }
    }
}