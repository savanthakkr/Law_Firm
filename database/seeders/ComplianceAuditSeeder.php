<?php

namespace Database\Seeders;

use App\Models\ComplianceAudit;
use App\Models\AuditType;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ComplianceAuditSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        
        // Get company users
        $companyUsers = User::where('type', 'company')->get();
        
        foreach ($companyUsers as $companyUser) {
            $auditTypes = AuditType::where('created_by', $companyUser->id)->get();
            
            if ($auditTypes->count() > 0) {
                // Create 2-3 compliance audits per company
                $auditCount = rand(8, 10);
                $auditTitles = [
                    'Annual Compliance Review',
                    'Data Protection Audit',
                    'Financial Controls Review',
                    'Operational Procedures Audit',
                    'Regulatory Compliance Assessment',
                    'Quality Assurance Review',
                    'Internal Controls Evaluation',
                    'Risk Management Audit'
                ];
                
                $descriptions = [
                    'Comprehensive review of all compliance requirements and procedures',
                    'Data protection compliance audit for client information security',
                    'Review of financial controls and trust account management',
                    'Operational procedures and workflow compliance assessment',
                    'Regulatory compliance assessment and gap analysis',
                    'Quality assurance review of service delivery processes',
                    'Internal controls evaluation and effectiveness review',
                    'Risk management framework and controls audit'
                ];
                
                $scopes = [
                    'All compliance policies, procedures, and documentation',
                    'Data processing activities, consent management, security measures',
                    'Trust account procedures, financial reporting, internal controls',
                    'Operational workflows, process documentation, staff procedures',
                    'Regulatory requirements, compliance monitoring, reporting',
                    'Service quality standards, client satisfaction, process improvement',
                    'Internal control systems, authorization procedures, segregation of duties',
                    'Risk identification, assessment, mitigation, and monitoring procedures'
                ];
                
                $statuses = ['planned', 'in_progress', 'completed', 'cancelled'];
                $riskLevels = ['low', 'medium', 'high', 'critical'];
                $auditorNames = ['John Smith', 'Sarah Johnson', 'Michael Brown', 'Lisa Davis', 'Robert Wilson'];
                $auditorOrgs = ['Internal Audit Team', 'External Compliance Consultants', 'External Auditing Firm', 'Regulatory Compliance Partners'];
                
                for ($i = 1; $i <= $auditCount; $i++) {
                    $auditDate = now()->subDays(rand(1, 120));
                    $status = $statuses[rand(0, count($statuses) - 1)];
                    $completionDate = $status === 'completed' ? $auditDate->copy()->addDays(rand(7, 30)) : null;
                    $followUpDate = $auditDate->copy()->addDays(rand(30, 180));
                    
                    $auditData = [
                        'audit_title' => $auditTitles[($companyUser->id + $i - 1) % count($auditTitles)],
                        'audit_type_id' => $auditTypes->random()->id,
                        'description' => $descriptions[($companyUser->id + $i - 1) % count($descriptions)] . ' for ' . $companyUser->name . '.',
                        'audit_date' => $auditDate,
                        'completion_date' => $completionDate,
                        'status' => $status,
                        'scope' => $scopes[($companyUser->id + $i - 1) % count($scopes)],
                        'findings' => $status === 'completed' ? 'Audit findings documented and reviewed' : ($status === 'in_progress' ? 'Preliminary findings under review' : null),
                        'recommendations' => $status === 'completed' ? 'Recommendations provided for improvement' : null,
                        'risk_level' => $riskLevels[rand(0, count($riskLevels) - 1)],
                        'auditor_name' => $auditorNames[rand(0, count($auditorNames) - 1)],
                        'auditor_organization' => $auditorOrgs[rand(0, count($auditorOrgs) - 1)],
                        'corrective_actions' => $status === 'completed' ? 'Corrective actions implemented as recommended' : null,
                        'follow_up_date' => $followUpDate,
                        'created_by' => $companyUser->id,
                    ];
                    
                    ComplianceAudit::firstOrCreate([
                        'audit_title' => $auditData['audit_title'],
                        'created_by' => $companyUser->id
                    ], $auditData);
                }
            }
        }
    }
}