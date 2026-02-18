<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create super admin role
        $superAdminRole = Role::firstOrCreate(
            ['name' => 'superadmin', 'guard_name' => 'web'],
            [
                'label' => 'Super Admin',
                'description' => 'Super Admin has full access to all features',
            ]
        );

        // Create admin role
        $adminRole = Role::firstOrCreate(
            ['name' => 'company', 'guard_name' => 'web'],
            [
                'label' => 'Company',
                'description' => 'Company has access to manage buissness',
            ]
        );

        // Get all permissions
        $permissions = Permission::all();

        // Assign all permissions to super admin
        $superAdminRole->syncPermissions($permissions);

        // Assign specific permissions to company role
        $adminPermissions = Permission::whereIn('name', [
            'manage-dashboard',
            'view-dashboard',
            'manage-users',
            'manage-any-users',
            'manage-own-users',
            'create-users',
            'manage-calendar',
            'manage-any-calendar',
            'manage-own-calendar',
            'view-calendar',
            'edit-users',
            'delete-users',
            'view-users',
            'reset-password-users',
            'toggle-status-users',
            'manage-roles',
            'manage-any-roles',
            'manage-own-roles',
            'create-roles',
            'edit-roles',
            'delete-roles',
            'view-roles',
            'view-permissions',
            'manage-permissions',
            'manage-any-permissions',
            'manage-own-permissions',
            'manage-plans',
            'manage-any-plans',
            'manage-own-plans',
            'view-plans',
            'request-plans',
            'trial-plans',
            'subscribe-plans',
            'manage-companies',
            'manage-any-companies',
            'manage-own-companies',
            'manage-coupons',
            'manage-any-coupons',
            'manage-own-coupons',
            'manage-currencies',
            'manage-any-currencies',
            'manage-own-currencies',
            'manage-plan-requests',
            'manage-any-plan-requests',
            'manage-own-plan-requests',
            'manage-plan-orders',
            'manage-any-plan-orders',
            'manage-own-plan-orders',
            'manage-email-settings',
            'manage-brand-settings',
            'manage-webhook-settings',
            'manage-settings',
            'manage-media',
            'manage-any-media',
            'manage-own-media',
            'create-media',
            'edit-media',
            'delete-media',
            'view-media',
            'download-media',
            'manage-system-settings',
            'manage-currency-settings',
            'manage-payment-settings',
            'manage-language',
            'edit-language',
            'view-language',
            'manage-referral',
            'manage-any-referral',
            'manage-own-referral',
            'manage-users-referral',
            'view-landing-page',
            'manage-any-landing-page',
            'manage-own-landing-page',
            'manage-analytics',
            'manage-any-language',
            'manage-own-language',



            // Client Type permissions
            'manage-client-types',
            'manage-any-client-types',
            'manage-own-client-types',
            'view-client-types',
            'create-client-types',
            'edit-client-types',
            'delete-client-types',
            'toggle-status-client-types',

            // Client permissions
            'manage-clients',
            'manage-any-clients',
            'manage-own-clients',
            'view-clients',
            'create-clients',
            'edit-clients',
            'delete-clients',
            'toggle-status-clients',
            'reset-client-password',

            // Client Communication permissions


            // Client Document permissions
            'manage-client-documents',
            'manage-any-client-documents',
            'manage-own-client-documents',
            'view-client-documents',
            'create-client-documents',
            'edit-client-documents',
            'delete-client-documents',
            'download-client-documents',

            // Client Billing permissions
            'manage-client-billing',
            'manage-any-client-billing',
            'manage-own-client-billing',
            'view-client-billing',
            'create-client-billing',
            'edit-client-billing',
            'delete-client-billing',

            // Client Billing Currency permissions
            'manage-client-billing-currencies',
            'manage-any-client-billing-currencies',
            'manage-own-client-billing-currencies',
            'view-client-billing-currencies',
            'create-client-billing-currencies',
            'edit-client-billing-currencies',
            'delete-client-billing-currencies',

            // Company Profile permissions
            'manage-company-profiles',
            'manage-any-company-profiles',
            'manage-own-company-profiles',
            'view-company-profiles',
            'create-company-profiles',
            'edit-company-profiles',
            'delete-company-profiles',
            'toggle-status-company-profiles',

            // Practice Area permissions
            'manage-practice-areas',
            'manage-any-practice-areas',
            'manage-own-practice-areas',
            'view-practice-areas',
            'create-practice-areas',
            'edit-practice-areas',
            'delete-practice-areas',
            'toggle-status-practice-areas',

            // Company Setting permissions
            'manage-company-settings',
            'manage-any-company-settings',
            'manage-own-company-settings',
            'view-company-settings',
            'edit-company-settings',

            // Case Document permissions
            'manage-case-documents',
            'manage-any-case-documents',
            'manage-own-case-documents',
            'view-case-documents',
            'create-case-documents',
            'edit-case-documents',
            'delete-case-documents',
            'download-case-documents',

            // Case Note permissions
            'manage-case-notes',
            'manage-any-case-notes',
            'manage-own-case-notes',
            'view-case-notes',
            'create-case-notes',
            'edit-case-notes',
            'delete-case-notes',

            // Case Management permissions
            'manage-cases',
            'manage-any-cases',
            'manage-own-cases',
            'view-cases',
            'create-cases',
            'edit-cases',
            'delete-cases',
            'toggle-status-cases',

            // Case Types permissions
            'manage-case-types',
            'manage-any-case-types',
            'manage-own-case-types',
            'view-case-types',
            'create-case-types',
            'edit-case-types',
            'delete-case-types',
            'toggle-status-case-types',

            // Case Statuses permissions
            'manage-case-statuses',
            'manage-any-case-statuses',
            'manage-own-case-statuses',
            'view-case-statuses',
            'create-case-statuses',
            'edit-case-statuses',
            'delete-case-statuses',
            'toggle-status-case-statuses',

            // Case Timelines permissions
            'manage-case-timelines',
            'manage-any-case-timelines',
            'manage-own-case-timelines',
            'view-case-timelines',
            'create-case-timelines',
            'edit-case-timelines',
            'delete-case-timelines',
            'toggle-status-case-timelines',

            // Case Team Members permissions
            'manage-case-team-members',
            'manage-any-case-team-members',
            'manage-own-case-team-members',
            'view-case-team-members',
            'create-case-team-members',
            'edit-case-team-members',
            'delete-case-team-members',
            'toggle-status-case-team-members',

            // Document Types permissions
            'manage-document-types',
            'manage-any-document-types',
            'manage-own-document-types',
            'view-document-types',
            'create-document-types',
            'edit-document-types',
            'delete-document-types',

            // Document Categories permissions
            'manage-document-categories',
            'manage-any-document-categories',
            'manage-own-document-categories',
            'view-document-categories',
            'create-document-categories',
            'edit-document-categories',
            'delete-document-categories',
            'toggle-status-document-categories',

            // Event Types permissions
            'manage-event-types',
            'manage-any-event-types',
            'manage-own-event-types',
            'view-event-types',
            'create-event-types',
            'edit-event-types',
            'delete-event-types',

            // Court Types permissions
            'manage-court-types',
            'manage-any-court-types',
            'manage-own-court-types',
            'view-court-types',
            'create-court-types',
            'edit-court-types',
            'delete-court-types',

            // Hearing permissions
            'manage-hearings',
            'manage-any-hearings',
            'manage-own-hearings',
            'view-hearings',
            'create-hearings',
            'edit-hearings',
            'delete-hearings',

            // Court Management permissions
            'manage-courts',
            'manage-any-courts',
            'manage-own-courts',
            'view-courts',
            'create-courts',
            'edit-courts',
            'delete-courts',
            'toggle-status-courts',

            // Judge Management permissions
            'manage-judges',
            'manage-any-judges',
            'manage-own-judges',
            'view-judges',
            'create-judges',
            'edit-judges',
            'delete-judges',
            'toggle-status-judges',

            // Hearing Type Management permissions
            'manage-hearing-types',
            'manage-any-hearing-types',
            'manage-own-hearing-types',
            'view-hearing-types',
            'create-hearing-types',
            'edit-hearing-types',
            'delete-hearing-types',
            'toggle-status-hearing-types',

            // Documents permissions
            'manage-documents',
            'manage-any-documents',
            'manage-own-documents',
            'view-documents',
            'create-documents',
            'edit-documents',
            'delete-documents',
            'download-documents',
            'toggle-status-documents',



            // Document Versions permissions
            'manage-document-versions',
            'manage-any-document-versions',
            'manage-own-document-versions',
            'view-document-versions',
            'create-document-versions',
            'delete-document-versions',
            'download-document-versions',
            'restore-document-versions',

            // Document Comments permissions
            'manage-document-comments',
            'manage-any-document-comments',
            'manage-own-document-comments',
            'view-document-comments',
            'create-document-comments',
            'edit-document-comments',
            'delete-document-comments',
            'resolve-document-comments',

            // Document Permissions permissions
            'manage-document-permissions',
            'manage-any-document-permissions',
            'manage-own-document-permissions',
            'view-document-permissions',
            'create-document-permissions',
            'edit-document-permissions',
            'delete-document-permissions',



            // Research Projects permissions
            'manage-research-projects',
            'manage-any-research-projects',
            'manage-own-research-projects',
            'view-research-projects',
            'create-research-projects',
            'edit-research-projects',
            'delete-research-projects',
            'toggle-status-research-projects',

            // Research Sources permissions
            'manage-research-sources',
            'manage-any-research-sources',
            'manage-own-research-sources',
            'view-research-sources',
            'create-research-sources',
            'edit-research-sources',
            'delete-research-sources',
            'toggle-status-research-sources',

            // Research Categories permissions
            'manage-research-categories',
            'manage-any-research-categories',
            'manage-own-research-categories',
            'view-research-categories',
            'create-research-categories',
            'edit-research-categories',
            'delete-research-categories',
            'toggle-status-research-categories',

            // Knowledge Articles permissions
            'manage-knowledge-articles',
            'manage-any-knowledge-articles',
            'manage-own-knowledge-articles',
            'view-knowledge-articles',
            'create-knowledge-articles',
            'edit-knowledge-articles',
            'delete-knowledge-articles',
            'publish-knowledge-articles',

            // Legal Precedents permissions
            'manage-legal-precedents',
            'manage-any-legal-precedents',
            'manage-own-legal-precedents',
            'view-legal-precedents',
            'create-legal-precedents',
            'edit-legal-precedents',
            'delete-legal-precedents',
            'toggle-status-legal-precedents',

            // Research Notes permissions
            'manage-research-notes',
            'manage-any-research-notes',
            'manage-own-research-notes',
            'view-research-notes',
            'create-research-notes',
            'edit-research-notes',
            'delete-research-notes',

            // Research Citations permissions
            'manage-research-citations',
            'manage-any-research-citations',
            'manage-own-research-citations',
            'view-research-citations',
            'create-research-citations',
            'edit-research-citations',
            'delete-research-citations',

            // Research Types permissions
            'manage-research-types',
            'manage-any-research-types',
            'manage-own-research-types',
            'view-research-types',
            'create-research-types',
            'edit-research-types',
            'delete-research-types',
            'toggle-status-research-types',

            // Compliance Requirements permissions
            'manage-compliance-requirements',
            'manage-any-compliance-requirements',
            'manage-own-compliance-requirements',
            'view-compliance-requirements',
            'create-compliance-requirements',
            'edit-compliance-requirements',
            'delete-compliance-requirements',
            'toggle-status-compliance-requirements',

            // Compliance Categories permissions
            'manage-compliance-categories',
            'manage-any-compliance-categories',
            'manage-own-compliance-categories',
            'view-compliance-categories',
            'create-compliance-categories',
            'edit-compliance-categories',
            'delete-compliance-categories',
            'toggle-status-compliance-categories',

            // Compliance Frequencies permissions
            'manage-compliance-frequencies',
            'manage-any-compliance-frequencies',
            'manage-own-compliance-frequencies',
            'view-compliance-frequencies',
            'create-compliance-frequencies',
            'edit-compliance-frequencies',
            'delete-compliance-frequencies',
            'toggle-status-compliance-frequencies',

            // Professional Licenses permissions
            'manage-professional-licenses',
            'manage-any-professional-licenses',
            'manage-own-professional-licenses',
            'view-professional-licenses',
            'create-professional-licenses',
            'edit-professional-licenses',
            'delete-professional-licenses',
            'toggle-status-professional-licenses',

            // Regulatory Bodies permissions
            'manage-regulatory-bodies',
            'manage-any-regulatory-bodies',
            'manage-own-regulatory-bodies',
            'view-regulatory-bodies',
            'create-regulatory-bodies',
            'edit-regulatory-bodies',
            'delete-regulatory-bodies',
            'toggle-status-regulatory-bodies',

            // Compliance Policies permissions
            'manage-compliance-policies',
            'manage-any-compliance-policies',
            'manage-own-compliance-policies',
            'view-compliance-policies',
            'create-compliance-policies',
            'edit-compliance-policies',
            'delete-compliance-policies',
            'toggle-status-compliance-policies',

            // CLE Tracking permissions
            'manage-cle-tracking',
            'manage-any-cle-tracking',
            'manage-own-cle-tracking',
            'view-cle-tracking',
            'create-cle-tracking',
            'edit-cle-tracking',
            'delete-cle-tracking',
            'download-cle-tracking',

            // Risk Categories permissions
            'manage-risk-categories',
            'manage-any-risk-categories',
            'manage-own-risk-categories',
            'view-risk-categories',
            'create-risk-categories',
            'edit-risk-categories',
            'delete-risk-categories',
            'toggle-status-risk-categories',

            // Risk Assessments permissions
            'manage-risk-assessments',
            'manage-any-risk-assessments',
            'manage-own-risk-assessments',
            'view-risk-assessments',
            'create-risk-assessments',
            'edit-risk-assessments',
            'delete-risk-assessments',

            // Audit Types permissions
            'manage-audit-types',
            'manage-any-audit-types',
            'manage-own-audit-types',
            'view-audit-types',
            'create-audit-types',
            'edit-audit-types',
            'delete-audit-types',
            'toggle-status-audit-types',

            // Compliance Audits permissions
            'manage-compliance-audits',
            'manage-any-compliance-audits',
            'manage-own-compliance-audits',
            'view-compliance-audits',
            'create-compliance-audits',
            'edit-compliance-audits',
            'delete-compliance-audits',

            // Time Entries permissions
            'manage-time-entries',
            'manage-any-time-entries',
            'manage-own-time-entries',
            'view-time-entries',
            'create-time-entries',
            'edit-time-entries',
            'delete-time-entries',
            'approve-time-entries',
            'start-timer',
            'stop-timer',

            // Billing Rates permissions
            'manage-billing-rates',
            'manage-any-billing-rates',
            'manage-own-billing-rates',
            'view-billing-rates',
            'create-billing-rates',
            'edit-billing-rates',
            'delete-billing-rates',
            'toggle-status-billing-rates',

            // Fee Types permissions
            'manage-fee-types',
            'manage-any-fee-types',
            'manage-own-fee-types',
            'view-fee-types',
            'create-fee-types',
            'edit-fee-types',
            'delete-fee-types',
            'toggle-status-fee-types',

            // Fee Structures permissions
            'manage-fee-structures',
            'manage-any-fee-structures',
            'manage-own-fee-structures',
            'view-fee-structures',
            'create-fee-structures',
            'edit-fee-structures',
            'delete-fee-structures',
            'toggle-status-fee-structures',

            // Expenses permissions
            'manage-expenses',
            'manage-any-expenses',
            'manage-own-expenses',
            'view-expenses',
            'create-expenses',
            'edit-expenses',
            'delete-expenses',
            'approve-expenses',

            // Expense Categories permissions
            'manage-expense-categories',
            'manage-any-expense-categories',
            'manage-own-expense-categories',
            'view-expense-categories',
            'create-expense-categories',
            'edit-expense-categories',
            'delete-expense-categories',
            'toggle-status-expense-categories',

            // Invoices permissions
            'manage-invoices',
            'manage-any-invoices',
            'manage-own-invoices',
            'view-invoices',
            'create-invoices',
            'edit-invoices',
            'delete-invoices',
            'send-invoices',

            // Payments permissions
            'manage-payments',
            'manage-any-payments',
            'manage-own-payments',
            'view-payments',
            'create-payments',
            'edit-payments',
            'delete-payments',

            // Task Management permissions
            'manage-tasks',
            'manage-any-tasks',
            'manage-own-tasks',
            'view-tasks',
            'create-tasks',
            'edit-tasks',
            'delete-tasks',
            'assign-tasks',
            'toggle-status-tasks',

            // Task Types permissions
            'manage-task-types',
            'manage-any-task-types',
            'manage-own-task-types',
            'view-task-types',
            'create-task-types',
            'edit-task-types',
            'delete-task-types',
            'toggle-status-task-types',

            // Task Statuses permissions
            'manage-task-statuses',
            'manage-any-task-statuses',
            'manage-own-task-statuses',
            'view-task-statuses',
            'create-task-statuses',
            'edit-task-statuses',
            'delete-task-statuses',
            'toggle-status-task-statuses',

            // Workflows permissions
            'manage-workflows',
            'manage-any-workflows',
            'manage-own-workflows',
            'view-workflows',
            'create-workflows',
            'edit-workflows',
            'delete-workflows',
            'toggle-status-workflows',

            // Task Dependencies permissions






            // Task Comments permissions
            'manage-task-comments',
            'manage-any-task-comments',
            'manage-own-task-comments',
            'view-task-comments',
            'create-task-comments',
            'edit-task-comments',
            'delete-task-comments',

            // Communication & Collaboration permissions
            'manage-messages',
            'manage-any-messages',
            'manage-own-messages',
            'view-messages',
            'send-messages',
            'delete-messages',

        ])->get();

        $adminRole->syncPermissions($adminPermissions);
    }
}
