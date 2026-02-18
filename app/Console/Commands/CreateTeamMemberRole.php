<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Role;
use App\Models\User;

class CreateTeamMemberRole extends Command
{
    protected $signature = 'role:create-team-member {company_id}';
    protected $description = 'Create team member role for a specific company';

    public function handle()
    {
        $companyId = $this->argument('company_id');
        
        // Verify company exists
        $company = User::where('id', $companyId)->where('type', 'company')->first();
        if (!$company) {
            $this->error("Company with ID {$companyId} not found");
            return 1;
        }

        // Create team member role
        $teamRole = Role::firstOrCreate([
            'name' => 'team_member',
            'guard_name' => 'web',
            'created_by' => $companyId
        ], [
            'label' => 'Team Member',
            'description' => 'Team member with limited access to company modules',
        ]);

        $permissions = [
            'manage-tasks', 'view-tasks', 'create-tasks', 'edit-tasks', 'assign-tasks', 'toggle-status-tasks',
            'manage-time-entries', 'view-time-entries', 'create-time-entries', 'edit-time-entries', 'start-timer', 'stop-timer',
            'manage-cases', 'view-cases', 'create-cases', 'edit-cases', 'toggle-status-cases',
            'manage-case-documents', 'view-case-documents', 'create-case-documents', 'edit-case-documents', 'download-case-documents',
            'manage-case-notes', 'view-case-notes', 'create-case-notes', 'edit-case-notes',
            'manage-case-timelines', 'view-case-timelines', 'create-case-timelines', 'edit-case-timelines',
            'manage-clients', 'view-clients', 'create-clients', 'edit-clients',

            'manage-documents', 'view-documents', 'create-documents', 'edit-documents', 'download-documents',

            'manage-document-comments', 'view-document-comments', 'create-document-comments', 'edit-document-comments',
            'manage-document-permissions', 'view-document-permissions',
            'manage-billing-rates', 'view-billing-rates',
            'manage-hearings', 'view-hearings', 'create-hearings', 'edit-hearings',
            'manage-research-projects', 'view-research-projects', 'create-research-projects', 'edit-research-projects',
            'manage-knowledge-articles', 'view-knowledge-articles', 'create-knowledge-articles', 'edit-knowledge-articles',
            'manage-legal-precedents', 'view-legal-precedents', 'create-legal-precedents', 'edit-legal-precedents',
            'manage-messages', 'view-messages', 'send-messages'
        ];

        $teamRole->syncPermissions($permissions);

        $this->info("Team member role created successfully for company: {$company->name}");
        return 0;
    }
}