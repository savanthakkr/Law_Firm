<?php

namespace Database\Seeders;

use App\Models\Workflow;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class WorkflowSeeder extends Seeder
{
    public function run(): void
    {
        $companyUsers = User::where('type', 'company')->get();
        
        foreach ($companyUsers as $companyUser) {
            // Create 2-3 workflows per company
            $workflowCount = rand(8, 10);
            $availableWorkflows = [
                [
                    'name' => 'Case Preparation Workflow',
                    'description' => 'Standard workflow for preparing legal cases',
                    'trigger_event' => 'case_created',
                    'is_active' => true,
                ],
                [
                    'name' => 'Contract Review Process',
                    'description' => 'Workflow for reviewing client contracts',
                    'trigger_event' => 'document_uploaded',
                    'is_active' => true,
                ],
                [
                    'name' => 'Court Filing Workflow',
                    'description' => 'Process for court document filing',
                    'trigger_event' => 'hearing_scheduled',
                    'is_active' => true,
                ],
                [
                    'name' => 'Client Onboarding Process',
                    'description' => 'Automated workflow for new client onboarding',
                    'trigger_event' => 'client_created',
                    'is_active' => true,
                ],
                [
                    'name' => 'Invoice Generation Workflow',
                    'description' => 'Automated invoice generation and sending process',
                    'trigger_event' => 'time_entry_approved',
                    'is_active' => true,
                ],
                [
                    'name' => 'Document Review Workflow',
                    'description' => 'Systematic document review and approval process',
                    'trigger_event' => 'document_created',
                    'is_active' => true,
                ],
                [
                    'name' => 'Task Assignment Workflow',
                    'description' => 'Automated task assignment and tracking process',
                    'trigger_event' => 'task_created',
                    'is_active' => true,
                ],
                [
                    'name' => 'Deadline Reminder Workflow',
                    'description' => 'Automated deadline and reminder notification system',
                    'trigger_event' => 'deadline_approaching',
                    'is_active' => true,
                ],
                [
                    'name' => 'Compliance Tracking Workflow',
                    'description' => 'Automated compliance monitoring and reporting process',
                    'trigger_event' => 'compliance_due',
                    'is_active' => true,
                ],
                [
                    'name' => 'Research Project Workflow',
                    'description' => 'Structured legal research project management process',
                    'trigger_event' => 'research_initiated',
                    'is_active' => true,
                ],
                [
                    'name' => 'Payment Processing Workflow',
                    'description' => 'Automated payment processing and reconciliation workflow',
                    'trigger_event' => 'payment_received',
                    'is_active' => true,
                ],
            ];
            
            // Randomly select workflows for this company
            $selectedWorkflows = collect($availableWorkflows)->random($workflowCount);
            
            foreach ($selectedWorkflows as $workflowData) {
                Workflow::firstOrCreate([
                    'name' => $workflowData['name'],
                    'created_by' => $companyUser->id
                ], [
                    'description' => $workflowData['description'],
                    'trigger_event' => $workflowData['trigger_event'],
                    'is_active' => $workflowData['is_active'],
                    'created_by' => $companyUser->id,
                ]);
            }
        }
    }
}