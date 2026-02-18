<?php

namespace Database\Seeders;

use App\Models\ComplianceRequirement;
use App\Models\ComplianceCategory;
use App\Models\ComplianceFrequency;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ComplianceRequirementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get company users
        $companyUsers = User::where('type', 'company')->get();
        
        foreach ($companyUsers as $companyUser) {
            $categories = ComplianceCategory::where('created_by', $companyUser->id)->get();
            $frequencies = ComplianceFrequency::where('created_by', $companyUser->id)->get();
            
            if ($categories->count() > 0 && $frequencies->count() > 0) {
                // Create 2-3 compliance requirements per company
                $requirementCount = rand(8, 10);
                $requirementTitles = [
                    'Bar Registration Renewal',
                    'Continuing Legal Education (CLE)',
                    'Client Trust Account Reconciliation',
                    'Professional Liability Insurance',
                    'Client Data Protection Compliance',
                    'Annual Ethics Training',
                    'Court Filing Compliance Review',
                    'Client Confidentiality Audit'
                ];
                
                $descriptions = [
                    'Annual renewal of bar registration and professional license',
                    'Complete required CLE credits for professional development',
                    'Monthly reconciliation of client trust accounts',
                    'Maintain professional liability insurance coverage',
                    'Ensure compliance with data protection regulations',
                    'Complete mandatory annual ethics training requirements',
                    'Review and ensure court filing compliance procedures',
                    'Conduct annual client confidentiality audit and review'
                ];
                
                $regulatoryBodies = [
                    'State Bar Association',
                    'Federal Trade Commission',
                    'State Insurance Commission',
                    'Data Protection Authority',
                    'Professional Standards Board'
                ];
                
                $jurisdictions = ['State', 'Federal', 'Local'];
                $statuses = ['pending', 'in_progress', 'compliant', 'non_compliant', 'overdue'];
                $priorities = ['low', 'medium', 'high', 'critical'];
                
                for ($i = 1; $i <= $requirementCount; $i++) {
                    $effectiveDate = now()->subMonths(rand(1, 12));
                    $deadline = rand(1, 10) > 3 ? now()->addMonths(rand(1, 12)) : null; // 70% chance of deadline
                    
                    $requirementData = [
                        'compliance_id' => null, // Auto-generated
                        'title' => $requirementTitles[($companyUser->id + $i - 1) % count($requirementTitles)],
                        'description' => $descriptions[($companyUser->id + $i - 1) % count($descriptions)] . ' for ' . $companyUser->name . '.',
                        'regulatory_body' => $regulatoryBodies[rand(0, count($regulatoryBodies) - 1)],
                        'category_id' => $categories->random()->id,
                        'jurisdiction' => $jurisdictions[rand(0, count($jurisdictions) - 1)],
                        'scope' => 'All practicing attorneys and staff',
                        'effective_date' => $effectiveDate,
                        'deadline' => $deadline,
                        'frequency_id' => $frequencies->random()->id,
                        'responsible_party' => ['Managing Partner', 'Office Manager', 'Compliance Officer', 'IT Manager'][rand(0, 3)],
                        'evidence_requirements' => 'Documentation, certificates, and compliance records required',
                        'penalty_implications' => 'Fines, sanctions, or license suspension may apply',
                        'monitoring_procedures' => 'Regular review and monitoring procedures established',
                        'status' => $statuses[rand(0, count($statuses) - 1)],
                        'priority' => $priorities[rand(0, count($priorities) - 1)],
                        'created_by' => $companyUser->id,
                    ];
                    
                    ComplianceRequirement::firstOrCreate([
                        'title' => $requirementData['title'],
                        'created_by' => $companyUser->id
                    ], $requirementData);
                }
            }
        }
    }
}