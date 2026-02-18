<?php

namespace Database\Seeders;

use App\Models\PracticeArea;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PracticeAreaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get company users
        $companyUsers = User::where('type', 'company')->get();
        
        foreach ($companyUsers as $companyUser) {
            // Create 2-3 practice areas per company
            $practiceAreaCount = rand(8, 10);
            $availablePracticeAreas = [
                [
                    'name' => 'Criminal Law',
                    'description' => 'Defense and prosecution of criminal cases including felonies, misdemeanors, and traffic violations.',
                    'expertise_level' => 'expert',
                    'is_primary' => true,
                    'certifications' => 'Certified Criminal Law Specialist',
                    'status' => 'active',
                ],
                [
                    'name' => 'Civil Litigation',
                    'description' => 'Representation in civil disputes, personal injury, and commercial litigation matters.',
                    'expertise_level' => 'expert',
                    'is_primary' => false,
                    'certifications' => 'Board Certified Civil Trial Lawyer',
                    'status' => 'active',
                ],
                [
                    'name' => 'Family Law',
                    'description' => 'Divorce, child custody, adoption, and other family-related legal matters.',
                    'expertise_level' => 'intermediate',
                    'is_primary' => false,
                    'certifications' => 'Family Law Mediation Certificate',
                    'status' => 'active',
                ],
                [
                    'name' => 'Corporate Law',
                    'description' => 'Business formation, contracts, mergers and acquisitions, and corporate compliance.',
                    'expertise_level' => 'intermediate',
                    'is_primary' => false,
                    'certifications' => 'Corporate Law Certificate',
                    'status' => 'active',
                ],
                [
                    'name' => 'Immigration Law',
                    'description' => 'Visa applications, citizenship, deportation defense, and immigration appeals.',
                    'expertise_level' => 'beginner',
                    'is_primary' => false,
                    'certifications' => null,
                    'status' => 'active',
                ],
                [
                    'name' => 'Real Estate Law',
                    'description' => 'Property transactions, real estate disputes, and land use matters.',
                    'expertise_level' => 'intermediate',
                    'is_primary' => false,
                    'certifications' => 'Real Estate Law Certificate',
                    'status' => 'active',
                ],
                [
                    'name' => 'Employment Law',
                    'description' => 'Workplace disputes, discrimination cases, and labor relations.',
                    'expertise_level' => 'expert',
                    'is_primary' => false,
                    'certifications' => 'Employment Law Specialist',
                    'status' => 'active',
                ],
                [
                    'name' => 'Intellectual Property',
                    'description' => 'Patents, trademarks, copyrights, and trade secrets protection.',
                    'expertise_level' => 'expert',
                    'is_primary' => false,
                    'certifications' => 'IP Law Certificate',
                    'status' => 'active',
                ],
                [
                    'name' => 'Tax Law',
                    'description' => 'Tax planning, compliance, and dispute resolution.',
                    'expertise_level' => 'intermediate',
                    'is_primary' => false,
                    'certifications' => 'Tax Law Specialist',
                    'status' => 'active',
                ],
                [
                    'name' => 'Environmental Law',
                    'description' => 'Environmental compliance, regulations, and litigation.',
                    'expertise_level' => 'beginner',
                    'is_primary' => false,
                    'certifications' => null,
                    'status' => 'active',
                ],
                [
                    'name' => 'Healthcare Law',
                    'description' => 'Medical malpractice, healthcare compliance, and regulatory matters.',
                    'expertise_level' => 'intermediate',
                    'is_primary' => false,
                    'certifications' => 'Healthcare Law Certificate',
                    'status' => 'active',
                ],
            ];
            
            // Randomly select practice areas for this company
            $selectedAreas = collect($availablePracticeAreas)->random($practiceAreaCount);
            
            foreach ($selectedAreas as $index => $areaData) {
                PracticeArea::firstOrCreate([
                    'name' => $areaData['name'],
                    'created_by' => $companyUser->id
                ], [
                    'description' => $areaData['description'],
                    'expertise_level' => $areaData['expertise_level'],
                    'is_primary' => $index === 0, // First area is primary for this company
                    'certifications' => $areaData['certifications'],
                    'status' => $areaData['status'],
                    'created_by' => $companyUser->id,
                ]);
            }
        }
    }
}