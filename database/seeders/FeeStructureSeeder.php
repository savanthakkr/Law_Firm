<?php

namespace Database\Seeders;

use App\Models\FeeStructure;
use App\Models\Client;
use App\Models\User;
use App\Models\FeeType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FeeStructureSeeder extends Seeder
{
    public function run(): void
    {
        $companies = User::where('type', 'company')->get();

        foreach ($companies as $company) {
            $clients = Client::where('created_by', $company->id)->get();
            $cases = \App\Models\CaseModel::where('created_by', $company->id)->get();
            $feeTypes = FeeType::where('created_by', $company->id)->get();
            
            if ($feeTypes->isEmpty()) continue;

            // Create 2-3 fee structures per company
            $structureCount = rand(8, 10);
            
            for ($i = 1; $i <= $structureCount; $i++) {
                $feeType = $feeTypes->random();
                $effectiveDate = now()->subDays(rand(1, 60));
                $endDate = rand(1, 10) > 7 ? now()->addMonths(rand(6, 24)) : null; // 30% chance of end date
                
                $structureData = [
                    'created_by' => $company->id,
                    'client_id' => $clients->count() > 0 ? $clients->random()->id : null,
                    'case_id' => rand(1, 10) > 6 && $cases->count() > 0 ? $cases->random()->id : null, // 40% chance case-specific
                    'fee_type_id' => $feeType->id,
                    'amount' => in_array(strtolower($feeType->name), ['fixed fee', 'retainer']) ? rand(2000, 15000) : null,
                    'percentage' => in_array(strtolower($feeType->name), ['contingency fee', 'success fee']) ? rand(20, 40) : null,
                    'hourly_rate' => in_array(strtolower($feeType->name), ['hourly rate', 'blended rate']) ? rand(150, 400) : null,
                    'description' => 'Fee structure #' . $i . ' for ' . $company->name . '. ' . $feeType->description . '.',
                    'effective_date' => $effectiveDate,
                    'end_date' => $endDate,
                    'is_active' => rand(1, 10) > 2, // 80% chance active
                ];
                
                FeeStructure::firstOrCreate([
                    'client_id' => $structureData['client_id'],
                    'fee_type_id' => $structureData['fee_type_id'],
                    'created_by' => $company->id
                ], $structureData);
            }
        }
    }
}