<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class TeamMemberRoleSeeder extends Seeder
{
    public function run(): void
    {
        $companyUsers = User::where('type', 'company')->get();

        if ($companyUsers->isEmpty()) {
            throw new \Exception('No company users found');
        }

        $permissions = [
            // Dashboard
            'manage-dashboard',

            // Calender
            'manage-calendar',
            'view-calendar',
            'manage-own-calendar',

            // Tasks
            'manage-tasks',
            'view-tasks',
            'create-tasks',
            'edit-tasks',
            'assign-tasks',
            'toggle-status-tasks',

            // Time Entries
            'manage-time-entries',
            'view-time-entries',
            'create-time-entries',
            'edit-time-entries',
            'start-timer',
            'stop-timer',

            // Cases
            'manage-cases',
            'view-cases',
            'create-cases',
            'edit-cases',
            'toggle-status-cases',

            // Case Documents
            'manage-case-documents',
            'view-case-documents',
            'create-case-documents',
            'edit-case-documents',
            'download-case-documents',

            // Case Notes
            'manage-case-notes',
            'view-case-notes',
            'create-case-notes',
            'edit-case-notes',

            // Case Timelines
            'manage-case-timelines',
            'view-case-timelines',
            'create-case-timelines',
            'edit-case-timelines',

            // Clients
            'manage-clients',
            'view-clients',
            'create-clients',
            'edit-clients',

            // Client Communications


            // Documents
            'manage-documents',
            'view-documents',
            'create-documents',
            'edit-documents',
            'download-documents',



            // Document Comments (limited access)
            'manage-document-comments',
            'view-document-comments',
            'create-document-comments',
            'edit-document-comments',

            // Document Permissions (view only)
            'manage-document-permissions',
            'view-document-permissions',

            // Hearings
            'manage-hearings',
            'view-hearings',
            'create-hearings',
            'edit-hearings',

            'manage-media',
            'manage-own-media',
            // Research
            'manage-research-projects',
            'view-research-projects',
            'create-research-projects',
            'edit-research-projects',
            'manage-knowledge-articles',
            'view-knowledge-articles',
            'create-knowledge-articles',
            'edit-knowledge-articles',
            'manage-legal-precedents',
            'view-legal-precedents',
            'create-legal-precedents',
            'edit-legal-precedents',

            // Messages
            'manage-messages',
            'view-messages',
            'send-messages'
        ];

        foreach ($companyUsers as $companyUser) {
            $teamRole = Role::firstOrCreate([
                'name' => 'team_member',
                'guard_name' => 'web',
                'created_by' => $companyUser->id
            ], [
                'label' => 'Team Member',
                'description' => 'Team member with limited access to company modules'
            ]);

            $teamRole->syncPermissions($permissions);

            $teamMember = User::firstOrCreate([
                'email' => 'teammember' . $companyUser->id . '@company.com',
                'created_by' => $companyUser->id
            ], [
                'name' => 'John Doe',
                'password' => Hash::make('password'),
                'type' => 'team_member',
                'lang' => $companyUser->lang ?? 'en',
                'status' => 'active'
            ]);

            $teamMember->assignRole($teamRole);
        }
    }
}
