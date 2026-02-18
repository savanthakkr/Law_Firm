<?php

namespace Database\Seeders;

use App\Models\FeeType;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FeeTypeSeeder extends Seeder
{
    public function run(): void
    {
        $companies = User::where('type', 'company')->get();

        // Create 2-3 fee types per company
        $availableFeeTypes = [
            ['name' => 'Hourly Rate', 'description' => 'Billing based on hourly rates'],
            ['name' => 'Fixed Fee', 'description' => 'Fixed amount for specific services'],
            ['name' => 'Contingency Fee', 'description' => 'Percentage-based fee upon successful outcome'],
            ['name' => 'Retainer', 'description' => 'Upfront payment for ongoing services'],
            ['name' => 'Blended Rate', 'description' => 'Mixed hourly rates for different services'],
            ['name' => 'Success Fee', 'description' => 'Bonus fee for successful case outcomes'],
            ['name' => 'Consultation Fee', 'description' => 'Initial consultation charges'],
            ['name' => 'Administrative Fee', 'description' => 'Administrative and processing fees'],
            ['name' => 'Court Appearance Fee', 'description' => 'Flat fee for court appearances'],
            ['name' => 'Document Review Fee', 'description' => 'Fee for document review services'],
            ['name' => 'Emergency Fee', 'description' => 'Premium fee for urgent matters'],
        ];

        foreach ($companies as $company) {
            $feeTypeCount = rand(8, 10);
            $selectedTypes = collect($availableFeeTypes)->random($feeTypeCount);
            
            foreach ($selectedTypes as $feeType) {
                FeeType::firstOrCreate([
                    'name' => $feeType['name'],
                    'created_by' => $company->id
                ], [
                    'description' => $feeType['description'],
                    'status' => 'active',
                    'created_by' => $company->id,
                ]);
            }
        }
    }
}