<?php

namespace Database\Seeders;

use App\Models\ComplianceFrequency;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ComplianceFrequencySeeder extends Seeder
{
    public function run(): void
    {
        $companyUsers = User::where('type', 'company')->get();
        
        foreach ($companyUsers as $companyUser) {
            // Create 2-3 compliance frequencies per company
            $frequencyCount = rand(8, 10);
            $availableFrequencies = [
                ['name' => 'One Time', 'description' => 'One-time compliance requirement', 'days' => null],
                ['name' => 'Monthly', 'description' => 'Monthly compliance requirement', 'days' => 30],
                ['name' => 'Quarterly', 'description' => 'Quarterly compliance requirement', 'days' => 90],
                ['name' => 'Semi-Annually', 'description' => 'Semi-annual compliance requirement', 'days' => 180],
                ['name' => 'Annually', 'description' => 'Annual compliance requirement', 'days' => 365],
                ['name' => 'Bi-Annually', 'description' => 'Bi-annual compliance requirement', 'days' => 730],
                ['name' => 'Weekly', 'description' => 'Weekly compliance requirement', 'days' => 7],
                ['name' => 'Bi-Weekly', 'description' => 'Bi-weekly compliance requirement', 'days' => 14],
                ['name' => 'Tri-Annually', 'description' => 'Three times per year compliance requirement', 'days' => 120],
                ['name' => 'Daily', 'description' => 'Daily compliance requirement', 'days' => 1],
                ['name' => 'As Needed', 'description' => 'Ad-hoc compliance requirement', 'days' => null],
            ];
            
            // Randomly select compliance frequencies for this company
            $selectedFrequencies = collect($availableFrequencies)->random($frequencyCount);
            
            foreach ($selectedFrequencies as $frequencyData) {
                ComplianceFrequency::firstOrCreate([
                    'name' => $frequencyData['name'],
                    'created_by' => $companyUser->id
                ], [
                    'description' => $frequencyData['description'],
                    'days' => $frequencyData['days'],
                    'status' => 'active',
                    'created_by' => $companyUser->id,
                ]);
            }
        }
    }
}