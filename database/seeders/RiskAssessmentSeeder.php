<?php

namespace Database\Seeders;

use App\Models\RiskAssessment;
use App\Models\RiskCategory;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RiskAssessmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get company users
        $companyUsers = User::where('type', 'company')->get();
        
        foreach ($companyUsers as $companyUser) {
            $riskCategories = RiskCategory::where('created_by', $companyUser->id)->get();
            
            if ($riskCategories->count() > 0) {
                // Create 2-3 risk assessments per company
                $assessmentCount = rand(8, 10);
                $riskTitles = [
                    'Client Data Breach',
                    'Regulatory Compliance Violation',
                    'Key Personnel Departure',
                    'Technology System Failure',
                    'Financial Fraud Risk',
                    'Professional Liability Exposure',
                    'Cybersecurity Threat',
                    'Business Continuity Risk'
                ];
                
                $descriptions = [
                    'Risk of unauthorized access to confidential client information',
                    'Risk of non-compliance with legal practice regulations',
                    'Risk of losing critical staff members',
                    'Risk of critical technology systems failing',
                    'Risk of financial fraud or embezzlement',
                    'Risk of professional malpractice claims',
                    'Risk of cyber attacks and security breaches',
                    'Risk of business operations disruption'
                ];
                
                $mitigationPlans = [
                    'Implement encryption, access controls, and regular security audits',
                    'Regular compliance monitoring and staff training',
                    'Knowledge documentation and succession planning',
                    'Backup systems and disaster recovery procedures',
                    'Internal controls and financial audits',
                    'Professional insurance and quality assurance',
                    'Security protocols and incident response plans',
                    'Business continuity and emergency procedures'
                ];
                
                $probabilities = ['very_low', 'low', 'medium', 'high', 'very_high'];
                $impacts = ['very_low', 'low', 'medium', 'high', 'very_high'];
                $statuses = ['identified', 'assessed', 'mitigated', 'monitored', 'closed'];
                $responsiblePersons = ['Risk Manager', 'Compliance Officer', 'IT Manager', 'HR Manager', 'Managing Partner'];
                
                for ($i = 1; $i <= $assessmentCount; $i++) {
                    $assessmentDate = now()->subDays(rand(1, 90));
                    $reviewDate = $assessmentDate->copy()->addDays(rand(30, 180));
                    
                    $riskData = [
                        'risk_title' => $riskTitles[($companyUser->id + $i - 1) % count($riskTitles)],
                        'risk_category_id' => $riskCategories->random()->id,
                        'description' => $descriptions[($companyUser->id + $i - 1) % count($descriptions)] . ' for ' . $companyUser->name . '.',
                        'probability' => $probabilities[rand(0, count($probabilities) - 1)],
                        'impact' => $impacts[rand(0, count($impacts) - 1)],
                        'mitigation_plan' => $mitigationPlans[($companyUser->id + $i - 1) % count($mitigationPlans)],
                        'control_measures' => 'Established control measures and monitoring procedures for risk management',
                        'assessment_date' => $assessmentDate,
                        'review_date' => $reviewDate,
                        'status' => $statuses[rand(0, count($statuses) - 1)],
                        'responsible_person' => $responsiblePersons[rand(0, count($responsiblePersons) - 1)],
                        'created_by' => $companyUser->id,
                    ];
                    
                    RiskAssessment::firstOrCreate([
                        'risk_title' => $riskData['risk_title'],
                        'created_by' => $companyUser->id
                    ], $riskData);
                }
            }
        }
    }
}