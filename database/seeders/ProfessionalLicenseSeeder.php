<?php

namespace Database\Seeders;

use App\Models\ProfessionalLicense;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProfessionalLicenseSeeder extends Seeder
{
    public function run(): void
    {
        $companyUsers = User::where('type', 'company')->get();
        
        foreach ($companyUsers as $companyUser) {
            $users = User::where('created_by', $companyUser->id)->get();
            
            // If no users exist, use the company user itself
            if ($users->isEmpty()) {
                $users = collect([$companyUser]);
            }
            
            // Create 2-3 professional licenses per company
            $licenseCount = rand(8, 10);
            $licenseTypes = [
                'Bar License',
                'Federal Court License',
                'Supreme Court License',
                'Patent Attorney License',
                'Notary Public License',
                'Mediator License',
                'Tax Attorney License',
                'Immigration Attorney License'
            ];
            
            $issuingAuthorities = [
                'State Bar Association',
                'Federal District Court',
                'Supreme Court',
                'Patent and Trademark Office',
                'Secretary of State',
                'Mediation Board',
                'Tax Court',
                'Immigration Court'
            ];
            
            $jurisdictions = ['State', 'Federal', 'Local', 'Multi-State'];
            $statuses = ['active', 'expired', 'suspended', 'revoked'];
            
            for ($i = 1; $i <= $licenseCount; $i++) {
                $licenseType = $licenseTypes[($companyUser->id + $i - 1) % count($licenseTypes)];
                $issueDate = now()->subYears(rand(1, 5));
                $expiryDate = $issueDate->copy()->addYears(rand(1, 3));
                
                $licenseData = [
                    'user_id' => $users->random()->id,
                    'license_type' => $licenseType,
                    'license_number' => strtoupper(substr($licenseType, 0, 3)) . str_pad($companyUser->id * 100 + $i, 6, '0', STR_PAD_LEFT),
                    'issuing_authority' => $issuingAuthorities[($companyUser->id + $i - 1) % count($issuingAuthorities)],
                    'jurisdiction' => $jurisdictions[rand(0, count($jurisdictions) - 1)],
                    'issue_date' => $issueDate,
                    'expiry_date' => $expiryDate,
                    'status' => $statuses[rand(0, count($statuses) - 1)],
                    'notes' => 'Professional license #' . $i . ' for ' . $companyUser->name . '. Required for legal practice and professional services.',
                    'created_by' => $companyUser->id,
                ];
                
                ProfessionalLicense::firstOrCreate([
                    'license_type' => $licenseData['license_type'],
                    'user_id' => $licenseData['user_id'],
                    'created_by' => $companyUser->id
                ], $licenseData);
            }
        }
    }
}