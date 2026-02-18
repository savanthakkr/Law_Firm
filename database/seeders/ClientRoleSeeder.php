<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\User;

class ClientRoleSeeder extends Seeder
{
    public function run(): void
    {
        $companyUser = auth()->check() && auth()->user()->type === 'company'
            ? auth()->user()
            : User::where('type', 'company')->first();

        if (!$companyUser) {
            throw new \Exception('No company user found');
        }

        $clientRole = Role::firstOrCreate([
            'name' => 'client',
            'guard_name' => 'web'
        ], [
            'label' => 'Client',
            'description' => 'Client with limited access to their own data',
            'created_by' => $companyUser->id
        ]);

        $permissions = [
            // Dashboard
            'manage-dashboard',

            // Calender
            'manage-calendar',
            'view-calendar',

            // Cases
            'manage-cases',
            'view-cases',

            // Case Documents
            'manage-case-documents',
            'view-case-documents',
            'download-case-documents',

            'manage-media',
            'manage-own-media',

            // Case Notes
            'manage-case-notes',
            'view-case-notes',

            // Case Timelines
            'manage-case-timelines',
            'view-case-timelines',

            // Client Communications


            // Client Documents
            'manage-client-documents',
            'view-client-documents',
            'download-client-documents',

            // Client Billing
            'manage-client-billing',
            'view-client-billing',

            // Hearings
            'manage-hearings',
            'view-hearings',

            // Documents
            'manage-documents',
            'view-documents',
            'download-documents',



            // Document Comments (limited access)
            'manage-document-comments',
            'view-document-comments',
            'create-document-comments',

            // Messages
            'manage-messages',
            'view-messages',
            'send-messages',

            // Invoices
            'manage-invoices',
            'view-invoices',

            // Payments
            'manage-payments',
            'view-payments',

            // Time Entries
            'manage-time-entries',
            'view-time-entries',

            // Knowledge Articles
            'manage-knowledge-articles',
            'view-knowledge-articles',

            // Legal Precedents
            'manage-legal-precedents',
            'view-legal-precedents'
        ];

        $clientRole->syncPermissions($permissions);
    }
}
