<?php

namespace Database\Seeders;

use App\Models\Court;
use App\Models\CourtType;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CourtSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get company users
        $companyUsers = User::where('type', 'company')->get();
        
        foreach ($companyUsers as $companyUser) {
            // Get court types for this specific company
            $courtTypes = CourtType::where('created_by', $companyUser->id)
                ->where('status', 'active')
                ->pluck('id')
                ->toArray();
            if (empty($courtTypes)) {
                continue; // Skip if no court types available for this company
            }
            
            // Create 2-3 courts per company
            $courtCount = rand(8, 10);
            $courtNames = [
                'District Court Central',
                'Family Court North', 
                'Commercial Court Plaza',
                'Criminal Court East',
                'Appeals Court West',
                'Municipal Court South',
                'Superior Court Main',
                'Juvenile Court Center'
            ];
            
            $jurisdictions = [
                'New York County',
                'Kings County', 
                'Queens County',
                'Bronx County',
                'Richmond County'
            ];
            
            $facilitiesOptions = [
                ['parking', 'wheelchair_access', 'security', 'cafeteria'],
                ['child_care', 'mediation_rooms', 'parking', 'wheelchair_access'],
                ['video_conferencing', 'presentation_equipment', 'parking', 'security'],
                ['holding_cells', 'security', 'victim_services', 'parking'],
                ['law_library', 'research_facilities', 'parking', 'security']
            ];
            
            for ($i = 1; $i <= $courtCount; $i++) {
                $courtData = [
                    'name' => $courtNames[($companyUser->id + $i - 1) % count($courtNames)] . ' #' . $i,
                    'address' => ($i * 100) . ' Justice Avenue, District ' . $i . ', NY 1000' . $i,
                    'phone' => '+1-555-' . str_pad($companyUser->id . $i, 4, '0', STR_PAD_LEFT),
                    'email' => 'court' . $i . '@' . strtolower(str_replace(' ', '', $companyUser->name)) . '.gov',
                    'jurisdiction' => $jurisdictions[($companyUser->id + $i - 1) % count($jurisdictions)],
                    'court_type_id' => $courtTypes[($i - 1) % count($courtTypes)],
                    'status' => rand(1, 10) > 9 ? 'inactive' : 'active', // 10% chance inactive
                    'facilities' => $facilitiesOptions[($i - 1) % count($facilitiesOptions)],
                    'filing_requirements' => 'Court #' . $i . ' requires electronic filing for all documents. Physical copies needed for exhibits over 50 pages.',
                    'local_rules' => 'Court sessions begin at 9:00 AM sharp. Late arrivals may result in postponement. Professional attire required.',
                    'notes' => 'Court #' . $i . ' for ' . $companyUser->name . '. Handles various legal matters with modern facilities and procedures.',
                    'created_by' => $companyUser->id,
                ];
                
                Court::firstOrCreate([
                    'name' => $courtData['name'],
                    'created_by' => $companyUser->id
                ], $courtData);
            }
        }
    }
}