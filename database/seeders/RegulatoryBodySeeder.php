<?php

namespace Database\Seeders;

use App\Models\RegulatoryBody;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RegulatoryBodySeeder extends Seeder
{
    public function run(): void
    {
        $companyUsers = User::where('type', 'company')->get();
        
        foreach ($companyUsers as $companyUser) {
            // Create 2-3 regulatory bodies per company
            $bodyCount = rand(8, 10);
            $availableBodies = [
                [
                    'name' => 'State Bar Association',
                    'description' => 'State regulatory body for legal professionals',
                    'jurisdiction' => 'State',
                    'contact_email' => 'info@statebar.gov',
                    'contact_phone' => '+1-555-0100',
                    'address' => '123 Legal Plaza, State Capital',
                    'website' => 'https://statebar.gov',
                ],
                [
                    'name' => 'Federal Bar Association',
                    'description' => 'Federal regulatory authority for legal practice',
                    'jurisdiction' => 'Federal',
                    'contact_email' => 'contact@federalbar.gov',
                    'contact_phone' => '+1-555-0200',
                    'address' => '456 Federal Building, Washington DC',
                    'website' => 'https://federalbar.gov',
                ],
                [
                    'name' => 'Data Protection Authority',
                    'description' => 'Regulatory body for data protection compliance',
                    'jurisdiction' => 'Federal',
                    'contact_email' => 'privacy@dpa.gov',
                    'contact_phone' => '+1-555-0300',
                    'address' => '789 Privacy Center, Washington DC',
                    'website' => 'https://dpa.gov',
                ],
                [
                    'name' => 'Financial Regulatory Commission',
                    'description' => 'Financial compliance and oversight authority',
                    'jurisdiction' => 'Federal',
                    'contact_email' => 'compliance@frc.gov',
                    'contact_phone' => '+1-555-0400',
                    'address' => '321 Finance Tower, New York',
                    'website' => 'https://frc.gov',
                ],
                [
                    'name' => 'Professional Standards Board',
                    'description' => 'Professional standards and ethics oversight',
                    'jurisdiction' => 'State',
                    'contact_email' => 'standards@psb.gov',
                    'contact_phone' => '+1-555-0500',
                    'address' => '555 Standards Building, State Capital',
                    'website' => 'https://psb.gov',
                ],
                [
                    'name' => 'Legal Ethics Commission',
                    'description' => 'Legal ethics and professional conduct authority',
                    'jurisdiction' => 'State',
                    'contact_email' => 'ethics@lec.gov',
                    'contact_phone' => '+1-555-0600',
                    'address' => '777 Ethics Plaza, State Capital',
                    'website' => 'https://lec.gov',
                ],
                [
                    'name' => 'Court Administration Office',
                    'description' => 'Court system administration and oversight',
                    'jurisdiction' => 'State',
                    'contact_email' => 'admin@courts.gov',
                    'contact_phone' => '+1-555-0700',
                    'address' => '888 Court House, State Capital',
                    'website' => 'https://courts.gov',
                ],
                [
                    'name' => 'Insurance Regulatory Board',
                    'description' => 'Professional liability insurance oversight',
                    'jurisdiction' => 'State',
                    'contact_email' => 'insurance@irb.gov',
                    'contact_phone' => '+1-555-0800',
                    'address' => '999 Insurance Building, State Capital',
                    'website' => 'https://irb.gov',
                ],
                [
                    'name' => 'Technology Compliance Authority',
                    'description' => 'Technology and cybersecurity compliance oversight',
                    'jurisdiction' => 'Federal',
                    'contact_email' => 'tech@tca.gov',
                    'contact_phone' => '+1-555-0900',
                    'address' => '111 Tech Center, Washington DC',
                    'website' => 'https://tca.gov',
                ],
                [
                    'name' => 'Environmental Protection Agency',
                    'description' => 'Environmental law and compliance authority',
                    'jurisdiction' => 'Federal',
                    'contact_email' => 'legal@epa.gov',
                    'contact_phone' => '+1-555-1000',
                    'address' => '222 Environmental Plaza, Washington DC',
                    'website' => 'https://epa.gov',
                ],
            ];
            
            // Randomly select regulatory bodies for this company
            $selectedBodies = collect($availableBodies)->random($bodyCount);
            
            foreach ($selectedBodies as $bodyData) {
                RegulatoryBody::firstOrCreate([
                    'name' => $bodyData['name'],
                    'created_by' => $companyUser->id
                ], [
                    'description' => $bodyData['description'],
                    'jurisdiction' => $bodyData['jurisdiction'],
                    'contact_email' => $bodyData['contact_email'],
                    'contact_phone' => $bodyData['contact_phone'],
                    'address' => $bodyData['address'],
                    'website' => $bodyData['website'],
                    'status' => 'active',
                    'created_by' => $companyUser->id,
                ]);
            }
        }
    }
}