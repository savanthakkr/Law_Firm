<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            // Dashboard permissions
            ['name' => 'manage-dashboard', 'module' => 'dashboard', 'label' => 'Manage Dashboard', 'description' => 'Can view dashboard'],

            // User management
            ['name' => 'manage-users', 'module' => 'users', 'label' => 'Manage Users', 'description' => 'Can manage users'],
            ['name' => 'manage-any-users', 'module' => 'users', 'label' => 'Manage All Users', 'description' => 'Manage Any Users'],
            ['name' => 'manage-own-users', 'module' => 'users', 'label' => 'Manage Own Users', 'description' => 'Manage Limited Users that is created by own'],
            ['name' => 'view-users', 'module' => 'users', 'label' => 'Manage Users', 'description' => 'View Users'],
            ['name' => 'create-users', 'module' => 'users', 'label' => 'Create Users', 'description' => 'Can create users'],
            ['name' => 'edit-users', 'module' => 'users', 'label' => 'Edit Users', 'description' => 'Can edit users'],
            ['name' => 'delete-users', 'module' => 'users', 'label' => 'Delete Users', 'description' => 'Can delete users'],
            ['name' => 'reset-password-users', 'module' => 'users', 'label' => 'Reset Password Users', 'description' => 'Can reset password users'],
            ['name' => 'toggle-status-users', 'module' => 'users', 'label' => 'Change Status Users', 'description' => 'Can change status users'],

            // Role management
            ['name' => 'manage-roles', 'module' => 'roles', 'label' => 'Manage Roles', 'description' => 'Can manage roles'],
            ['name' => 'manage-any-roles', 'module' => 'roles', 'label' => 'Manage All Roles', 'description' => 'Manage Any Roles'],
            ['name' => 'manage-own-roles', 'module' => 'roles', 'label' => 'Manage Own Roles', 'description' => 'Manage Limited Roles that is created by own'],
            ['name' => 'view-roles', 'module' => 'roles', 'label' => 'View Roles', 'description' => 'View Roles'],
            ['name' => 'create-roles', 'module' => 'roles', 'label' => 'Create Roles', 'description' => 'Can create roles'],
            ['name' => 'edit-roles', 'module' => 'roles', 'label' => 'Edit Roles', 'description' => 'Can edit roles'],
            ['name' => 'delete-roles', 'module' => 'roles', 'label' => 'Delete Roles', 'description' => 'Can delete roles'],

            // Permission management
            ['name' => 'manage-permissions', 'module' => 'permissions', 'label' => 'Manage Permissions', 'description' => 'Can manage permissions'],
            ['name' => 'manage-any-permissions', 'module' => 'permissions', 'label' => 'Manage All Permissions', 'description' => 'Manage Any Permissions'],
            ['name' => 'manage-own-permissions', 'module' => 'permissions', 'label' => 'Manage Own Permissions', 'description' => 'Manage Limited Permissions that is created by own'],
            ['name' => 'view-permissions', 'module' => 'permissions', 'label' => 'View Permissions', 'description' => 'View Permissions'],
            ['name' => 'create-permissions', 'module' => 'permissions', 'label' => 'Create Permissions', 'description' => 'Can create permissions'],
            ['name' => 'edit-permissions', 'module' => 'permissions', 'label' => 'Edit Permissions', 'description' => 'Can edit permissions'],
            ['name' => 'delete-permissions', 'module' => 'permissions', 'label' => 'Delete Permissions', 'description' => 'Can delete permissions'],

            // Company management
            ['name' => 'manage-companies', 'module' => 'companies', 'label' => 'Manage Companies', 'description' => 'Can manage Companies'],
            ['name' => 'manage-any-companies', 'module' => 'companies', 'label' => 'Manage All Companies', 'description' => 'Manage Any Companies'],
            ['name' => 'manage-own-companies', 'module' => 'companies', 'label' => 'Manage Own Companies', 'description' => 'Manage Limited Companies that is created by own'],
            ['name' => 'view-companies', 'module' => 'companies', 'label' => 'View Companies', 'description' => 'View Companies'],
            ['name' => 'create-companies', 'module' => 'companies', 'label' => 'Create Companies', 'description' => 'Can create Companies'],
            ['name' => 'edit-companies', 'module' => 'companies', 'label' => 'Edit Companies', 'description' => 'Can edit Companies'],
            ['name' => 'delete-companies', 'module' => 'companies', 'label' => 'Delete Companies', 'description' => 'Can delete Companies'],
            ['name' => 'reset-password-companies', 'module' => 'companies', 'label' => 'Reset Password Companies', 'description' => 'Can reset password Companies'],
            ['name' => 'toggle-status-companies', 'module' => 'companies', 'label' => 'Change Status Companies', 'description' => 'Can change status companies'],
            ['name' => 'manage-plans-companies', 'module' => 'companies', 'label' => 'Manage Plan Companies', 'description' => 'Can manage plans companies'],
            ['name' => 'upgrade-plan-companies', 'module' => 'companies', 'label' => 'Upgrade Plan Companies', 'description' => 'Can upgrade plan of companies'],

            // Plan management
            ['name' => 'manage-plans', 'module' => 'plans', 'label' => 'Manage Plans', 'description' => 'Can manage subscription plans'],
            ['name' => 'manage-any-plans', 'module' => 'plans', 'label' => 'Manage All Plans', 'description' => 'Manage Any Plans'],
            ['name' => 'manage-own-plans', 'module' => 'plans', 'label' => 'Manage Own Plans', 'description' => 'Manage Limited Plans that is created by own'],
            ['name' => 'view-plans', 'module' => 'plans', 'label' => 'View Plans', 'description' => 'View Plans'],
            ['name' => 'create-plans', 'module' => 'plans', 'label' => 'Create Plans', 'description' => 'Can create subscription plans'],
            ['name' => 'edit-plans', 'module' => 'plans', 'label' => 'Edit Plans', 'description' => 'Can edit subscription plans'],
            ['name' => 'delete-plans', 'module' => 'plans', 'label' => 'Delete Plans', 'description' => 'Can delete subscription plans'],
            ['name' => 'request-plans', 'module' => 'plans', 'label' => 'Request Plans', 'description' => 'Can request subscription plans'],
            ['name' => 'trial-plans', 'module' => 'plans', 'label' => 'Trial Plans', 'description' => 'Can start trial for subscription plans'],
            ['name' => 'subscribe-plans', 'module' => 'plans', 'label' => 'Subscribe Plans', 'description' => 'Can subscribe to subscription plans'],


            // Coupon management
            ['name' => 'manage-coupons', 'module' => 'coupons', 'label' => 'Manage Coupons', 'description' => 'Can manage subscription Coupons'],
            ['name' => 'manage-any-coupons', 'module' => 'coupons', 'label' => 'Manage All Coupons', 'description' => 'Manage Any Coupons'],
            ['name' => 'manage-own-coupons', 'module' => 'coupons', 'label' => 'Manage Own Coupons', 'description' => 'Manage Limited Coupons that is created by own'],
            ['name' => 'view-coupons', 'module' => 'coupons', 'label' => 'View Coupons', 'description' => 'View Coupons'],
            ['name' => 'create-coupons', 'module' => 'coupons', 'label' => 'Create Coupons', 'description' => 'Can create subscription Coupons'],
            ['name' => 'edit-coupons', 'module' => 'coupons', 'label' => 'Edit Coupons', 'description' => 'Can edit subscription Coupons'],
            ['name' => 'delete-coupons', 'module' => 'coupons', 'label' => 'Delete Coupons', 'description' => 'Can delete subscription Coupons'],
            ['name' => 'toggle-status-coupons', 'module' => 'coupons', 'label' => 'Change Status Coupons', 'description' => 'Can change status Coupons'],

            // Plan Requests management
            ['name' => 'manage-plan-requests', 'module' => 'plan_requests', 'label' => 'Manage Plan Requests', 'description' => 'Can manage plan requests'],
            ['name' => 'manage-any-plan-requests', 'module' => 'plan_requests', 'label' => 'Manage All Plan Requests', 'description' => 'Manage Any Plan Requests'],
            ['name' => 'manage-own-plan-requests', 'module' => 'plan_requests', 'label' => 'Manage Own Plan Requests', 'description' => 'Manage Limited Plan Requests that is created by own'],
            ['name' => 'view-plan-requests', 'module' => 'plan_requests', 'label' => 'View Plan Requests', 'description' => 'View Plan Requests'],
            ['name' => 'create-plan-requests', 'module' => 'plan_requests', 'label' => 'Create Plan Requests', 'description' => 'Can create plan requests'],
            ['name' => 'edit-plan-requests', 'module' => 'plan_requests', 'label' => 'Edit Plan Requests', 'description' => 'Can edit plan requests'],
            ['name' => 'delete-plan-requests', 'module' => 'plan_requests', 'label' => 'Delete Plan Requests', 'description' => 'Can delete plan requests'],
            ['name' => 'approve-plan-requests', 'module' => 'plan_requests', 'label' => 'Approve plan requests', 'description' => 'Can approve plan requests'],
            ['name' => 'reject-plan-requests', 'module' => 'plan_requests', 'label' => 'Reject plan requests', 'description' => 'Can reject plplan requests'],

            // Plan Orders management
            ['name' => 'manage-plan-orders', 'module' => 'plan_orders', 'label' => 'Manage Plan Orders', 'description' => 'Can manage plan orders'],
            ['name' => 'manage-any-plan-orders', 'module' => 'plan_orders', 'label' => 'Manage All Plan Orders', 'description' => 'Manage Any Plan Orders'],
            ['name' => 'manage-own-plan-orders', 'module' => 'plan_orders', 'label' => 'Manage Own Plan Orders', 'description' => 'Manage Limited Plan Orders that is created by own'],
            ['name' => 'view-plan-orders', 'module' => 'plan_orders', 'label' => 'View Plan Orders', 'description' => 'View Plan Orders'],
            ['name' => 'create-plan-orders', 'module' => 'plan_orders', 'label' => 'Create Plan Orders', 'description' => 'Can create plan orders'],
            ['name' => 'edit-plan-orders', 'module' => 'plan_orders', 'label' => 'Edit Plan Orders', 'description' => 'Can edit plan orders'],
            ['name' => 'delete-plan-orders', 'module' => 'plan_orders', 'label' => 'Delete Plan Orders', 'description' => 'Can delete plan orders'],
            ['name' => 'approve-plan-orders', 'module' => 'plan_orders', 'label' => 'Approve Plan Orders', 'description' => 'Can approve plan orders'],
            ['name' => 'reject-plan-orders', 'module' => 'plan_orders', 'label' => 'Reject Plan Orders', 'description' => 'Can reject plan orders'],


            // Settings
            ['name' => 'manage-settings', 'module' => 'settings', 'label' => 'Manage Settings', 'description' => 'Can manage All settings'],
            ['name' => 'manage-system-settings', 'module' => 'settings', 'label' => 'Manage System Settings', 'description' => 'Can manage system settings'],
            ['name' => 'manage-email-settings', 'module' => 'settings', 'label' => 'Manage Email Settings', 'description' => 'Can manage email settings'],
            ['name' => 'manage-brand-settings', 'module' => 'settings', 'label' => 'Manage Brand Settings', 'description' => 'Can manage brand settings'],
            ['name' => 'manage-company-settings', 'module' => 'settings', 'label' => 'Manage Company Settings', 'description' => 'Can manage Company settings'],
            ['name' => 'manage-storage-settings', 'module' => 'settings', 'label' => 'Manage Storage Settings', 'description' => 'Can manage storage settings'],
            ['name' => 'manage-payment-settings', 'module' => 'settings', 'label' => 'Manage Payment Settings', 'description' => 'Can manage payment settings'],
            ['name' => 'manage-currency-settings', 'module' => 'settings', 'label' => 'Manage Currency Settings', 'description' => 'Can manage currency settings'],
            ['name' => 'manage-recaptcha-settings', 'module' => 'settings', 'label' => 'Manage ReCaptch Settings', 'description' => 'Can manage recaptcha settings'],
            ['name' => 'manage-chatgpt-settings', 'module' => 'settings', 'label' => 'Manage ChatGpt Settings', 'description' => 'Can manage chatgpt settings'],
            ['name' => 'manage-cookie-settings', 'module' => 'settings', 'label' => 'Manage Cookie(GDPR) Settings', 'description' => 'Can manage cookie settings'],
            ['name' => 'manage-seo-settings', 'module' => 'settings', 'label' => 'Manage Seo Settings', 'description' => 'Can manage seo settings'],
            ['name' => 'manage-cache-settings', 'module' => 'settings', 'label' => 'Manage Cache Settings', 'description' => 'Can manage cache settings'],
            ['name' => 'manage-account-settings', 'module' => 'settings', 'label' => 'Manage Account Settings', 'description' => 'Can manage account settings'],


            // Contact Us management
            ['name' => 'manage-contact-us', 'module' => 'contact-us', 'label' => 'Manage Contact Us', 'description' => 'Can manage contact us messages'],
            ['name' => 'view-contact-us', 'module' => 'contact-us', 'label' => 'View Contact Us', 'description' => 'View Contact Us messages'],

            // Currency management
            ['name' => 'manage-currencies', 'module' => 'currencies', 'label' => 'Manage Currencies', 'description' => 'Can manage currencies'],
            ['name' => 'manage-any-currencies', 'module' => 'currencies', 'label' => 'Manage All currencies', 'description' => 'Manage Any currencies'],
            ['name' => 'manage-own-currencies', 'module' => 'currencies', 'label' => 'Manage Own currencies', 'description' => 'Manage Limited currencies that is created by own'],
            ['name' => 'view-currencies', 'module' => 'currencies', 'label' => 'View Currencies', 'description' => 'View Currencies'],
            ['name' => 'create-currencies', 'module' => 'currencies', 'label' => 'Create Currencies', 'description' => 'Can create currencies'],
            ['name' => 'edit-currencies', 'module' => 'currencies', 'label' => 'Edit Currencies', 'description' => 'Can edit currencies'],
            ['name' => 'delete-currencies', 'module' => 'currencies', 'label' => 'Delete Currencies', 'description' => 'Can delete currencies'],

            // Client Billing Currency management
            ['name' => 'manage-client-billing-currencies', 'module' => 'client_billing_currencies', 'label' => 'Manage Client Billing Currencies', 'description' => 'Can manage client billing currencies'],
            ['name' => 'manage-any-client-billing-currencies', 'module' => 'client_billing_currencies', 'label' => 'Manage All Client Billing Currencies', 'description' => 'Manage Any Client Billing Currencies'],
            ['name' => 'manage-own-client-billing-currencies', 'module' => 'client_billing_currencies', 'label' => 'Manage Own Client Billing Currencies', 'description' => 'Manage Limited Client Billing Currencies that is created by own'],
            ['name' => 'view-client-billing-currencies', 'module' => 'client_billing_currencies', 'label' => 'View Client Billing Currencies', 'description' => 'View Client Billing Currencies'],
            ['name' => 'create-client-billing-currencies', 'module' => 'client_billing_currencies', 'label' => 'Create Client Billing Currencies', 'description' => 'Can create client billing currencies'],
            ['name' => 'edit-client-billing-currencies', 'module' => 'client_billing_currencies', 'label' => 'Edit Client Billing Currencies', 'description' => 'Can edit client billing currencies'],
            ['name' => 'delete-client-billing-currencies', 'module' => 'client_billing_currencies', 'label' => 'Delete Client Billing Currencies', 'description' => 'Can delete client billing currencies'],



            // Referral management
            ['name' => 'manage-referral', 'module' => 'referral', 'label' => 'Manage Referral', 'description' => 'Can manage referral program'],
            ['name' => 'manage-any-referral', 'module' => 'referral', 'label' => 'Manage All Referral', 'description' => 'Manage Any Referral'],
            ['name' => 'manage-own-referral', 'module' => 'referral', 'label' => 'Manage Own Referral', 'description' => 'Manage Limited Referral that is created by own'],
            ['name' => 'manage-users-referral', 'module' => 'referral', 'label' => 'Manage User Referral', 'description' => 'Can manage user referral program'],
            ['name' => 'manage-setting-referral', 'module' => 'referral', 'label' => 'Manage Referral Setting', 'description' => 'Can manage Referral Setting'],
            ['name' => 'manage-payout-referral', 'module' => 'referral', 'label' => 'Manage Referral Payout', 'description' => 'Can manage Referral Payout program'],
            ['name' => 'approve-payout-referral', 'module' => 'referral', 'label' => 'Manage Referral', 'description' => 'Can approve payout request'],
            ['name' => 'reject-payout-referral', 'module' => 'referral', 'label' => 'Manage Referral', 'description' => 'Can approve payout request'],

            // Language management
            ['name' => 'manage-language', 'module' => 'language', 'label' => 'Manage Language', 'description' => 'Can manage language'],
            ['name' => 'manage-any-language', 'module' => 'language', 'label' => 'Manage All Language', 'description' => 'Manage Any Language'],
            ['name' => 'manage-own-language', 'module' => 'language', 'label' => 'Manage Own Language', 'description' => 'Manage Limited Language that is created by own'],
            ['name' => 'edit-language', 'module' => 'language', 'label' => 'Edit Language', 'description' => 'Edit Language'],
            ['name' => 'view-language', 'module' => 'language', 'label' => 'View Language', 'description' => 'View Language'],

            // Media management
            ['name' => 'manage-media', 'module' => 'media', 'label' => 'Manage Media', 'description' => 'Can manage media'],
            ['name' => 'manage-any-media', 'module' => 'media', 'label' => 'Manage All Media', 'description' => 'Manage Any media'],
            ['name' => 'manage-own-media', 'module' => 'media', 'label' => 'Manage Own Media', 'description' => 'Manage Limited media that is created by own'],
            ['name' => 'create-media', 'module' => 'media', 'label' => 'Create media', 'description' => 'Create media'],
            ['name' => 'edit-media', 'module' => 'media', 'label' => 'Edit media', 'description' => 'Edit media'],
            ['name' => 'delete-media', 'module' => 'media', 'label' => 'Delete media', 'description' => 'Delete media'],
            ['name' => 'view-media', 'module' => 'media', 'label' => 'View media', 'description' => 'View media'],
            ['name' => 'download-media', 'module' => 'media', 'label' => 'Download media', 'description' => 'Download media'],

            // Webhook management
            ['name' => 'manage-webhook-settings', 'module' => 'settings', 'label' => 'Manage Webhook Settings', 'description' => 'Can manage webhook settings'],
            // Landing Page management
            ['name' => 'manage-landing-page', 'module' => 'landing_page', 'label' => 'Manage Landing Page', 'description' => 'Can manage landing page'],
            ['name' => 'manage-any-landing-page', 'module' => 'landing_page', 'label' => 'Manage All Landing Page', 'description' => 'Manage Any Landing Page'],
            ['name' => 'manage-own-landing-page', 'module' => 'landing_page', 'label' => 'Manage Own Landing Page', 'description' => 'Manage Limited Landing Page that is created by own'],
            ['name' => 'view-landing-page', 'module' => 'landing_page', 'label' => 'View Landing Page', 'description' => 'View landing page'],
            ['name' => 'edit-landing-page', 'module' => 'landing_page', 'label' => 'Edit Landing Page', 'description' => 'Edit landing page'],



            // Client Type management
            ['name' => 'manage-client-types', 'module' => 'client_types', 'label' => 'Manage Client Types', 'description' => 'Can manage client types'],
            ['name' => 'manage-any-client-types', 'module' => 'client_types', 'label' => 'Manage All Client Types', 'description' => 'Manage Any Client Types'],
            ['name' => 'manage-own-client-types', 'module' => 'client_types', 'label' => 'Manage Own Client Types', 'description' => 'Manage Limited Client Types that is created by own'],
            ['name' => 'view-client-types', 'module' => 'client_types', 'label' => 'View Client Types', 'description' => 'View Client Types'],
            ['name' => 'create-client-types', 'module' => 'client_types', 'label' => 'Create Client Types', 'description' => 'Can create client types'],
            ['name' => 'edit-client-types', 'module' => 'client_types', 'label' => 'Edit Client Types', 'description' => 'Can edit client types'],
            ['name' => 'delete-client-types', 'module' => 'client_types', 'label' => 'Delete Client Types', 'description' => 'Can delete client types'],
            ['name' => 'toggle-status-client-types', 'module' => 'client_types', 'label' => 'Toggle Status Client Types', 'description' => 'Can toggle status of client types'],

            // Client management
            ['name' => 'manage-clients', 'module' => 'clients', 'label' => 'Manage Clients', 'description' => 'Can manage clients'],
            ['name' => 'manage-any-clients', 'module' => 'clients', 'label' => 'Manage All Clients', 'description' => 'Manage Any Clients'],
            ['name' => 'manage-own-clients', 'module' => 'clients', 'label' => 'Manage Own Clients', 'description' => 'Manage Limited Clients that is created by own'],
            ['name' => 'view-clients', 'module' => 'clients', 'label' => 'View Clients', 'description' => 'View Clients'],
            ['name' => 'create-clients', 'module' => 'clients', 'label' => 'Create Clients', 'description' => 'Can create clients'],
            ['name' => 'edit-clients', 'module' => 'clients', 'label' => 'Edit Clients', 'description' => 'Can edit clients'],
            ['name' => 'delete-clients', 'module' => 'clients', 'label' => 'Delete Clients', 'description' => 'Can delete clients'],
            ['name' => 'toggle-status-clients', 'module' => 'clients', 'label' => 'Toggle Status Clients', 'description' => 'Can toggle status of clients'],
            ['name' => 'reset-client-password', 'module' => 'clients', 'label' => 'Reset Client Password', 'description' => 'Can reset client passwords'],

            // Client Communication management


            // Client Document management
            ['name' => 'manage-client-documents', 'module' => 'client_documents', 'label' => 'Manage Client Documents', 'description' => 'Can manage client documents'],
            ['name' => 'manage-any-client-documents', 'module' => 'client_documents', 'label' => 'Manage All Client Documents', 'description' => 'Manage Any Client Documents'],
            ['name' => 'manage-own-client-documents', 'module' => 'client_documents', 'label' => 'Manage Own Client Documents', 'description' => 'Manage Limited Client Documents that is created by own'],
            ['name' => 'view-client-documents', 'module' => 'client_documents', 'label' => 'View Client Documents', 'description' => 'View Client Documents'],
            ['name' => 'create-client-documents', 'module' => 'client_documents', 'label' => 'Create Client Documents', 'description' => 'Can create client documents'],
            ['name' => 'edit-client-documents', 'module' => 'client_documents', 'label' => 'Edit Client Documents', 'description' => 'Can edit client documents'],
            ['name' => 'delete-client-documents', 'module' => 'client_documents', 'label' => 'Delete Client Documents', 'description' => 'Can delete client documents'],
            ['name' => 'download-client-documents', 'module' => 'client_documents', 'label' => 'Download Client Documents', 'description' => 'Can download client documents'],

            // Client Billing Info management
            ['name' => 'manage-client-billing', 'module' => 'client_billing', 'label' => 'Manage Client Billing', 'description' => 'Can manage client billing information'],
            ['name' => 'manage-any-client-billing', 'module' => 'client_billing', 'label' => 'Manage All Client Billing', 'description' => 'Manage Any Client Billing'],
            ['name' => 'manage-own-client-billing', 'module' => 'client_billing', 'label' => 'Manage Own Client Billing', 'description' => 'Manage Limited Client Billing that is created by own'],
            ['name' => 'view-client-billing', 'module' => 'client_billing', 'label' => 'View Client Billing', 'description' => 'View Client Billing'],
            ['name' => 'create-client-billing', 'module' => 'client_billing', 'label' => 'Create Client Billing', 'description' => 'Can create client billing information'],
            ['name' => 'edit-client-billing', 'module' => 'client_billing', 'label' => 'Edit Client Billing', 'description' => 'Can edit client billing information'],
            ['name' => 'delete-client-billing', 'module' => 'client_billing', 'label' => 'Delete Client Billing', 'description' => 'Can delete client billing information'],

            // Company Profile management
            ['name' => 'manage-company-profiles', 'module' => 'company_profiles', 'label' => 'Manage Company Profiles', 'description' => 'Can manage company profiles'],
            ['name' => 'manage-any-company-profiles', 'module' => 'company_profiles', 'label' => 'Manage All Company Profiles', 'description' => 'Manage Any Company Profiles'],
            ['name' => 'manage-own-company-profiles', 'module' => 'company_profiles', 'label' => 'Manage Own Company Profiles', 'description' => 'Manage Limited Company Profiles that is created by own'],
            ['name' => 'view-company-profiles', 'module' => 'company_profiles', 'label' => 'View Company Profiles', 'description' => 'View Company Profiles'],
            ['name' => 'create-company-profiles', 'module' => 'company_profiles', 'label' => 'Create Company Profiles', 'description' => 'Can create company profiles'],
            ['name' => 'edit-company-profiles', 'module' => 'company_profiles', 'label' => 'Edit Company Profiles', 'description' => 'Can edit company profiles'],
            ['name' => 'delete-company-profiles', 'module' => 'company_profiles', 'label' => 'Delete Company Profiles', 'description' => 'Can delete company profiles'],
            ['name' => 'toggle-status-company-profiles', 'module' => 'company_profiles', 'label' => 'Toggle Status Company Profiles', 'description' => 'Can toggle status of company profiles'],

            // Practice Area management
            ['name' => 'manage-practice-areas', 'module' => 'practice_areas', 'label' => 'Manage Practice Areas', 'description' => 'Can manage practice areas'],
            ['name' => 'manage-any-practice-areas', 'module' => 'practice_areas', 'label' => 'Manage All Practice Areas', 'description' => 'Manage Any Practice Areas'],
            ['name' => 'manage-own-practice-areas', 'module' => 'practice_areas', 'label' => 'Manage Own Practice Areas', 'description' => 'Manage Limited Practice Areas that is created by own'],
            ['name' => 'view-practice-areas', 'module' => 'practice_areas', 'label' => 'View Practice Areas', 'description' => 'View Practice Areas'],
            ['name' => 'create-practice-areas', 'module' => 'practice_areas', 'label' => 'Create Practice Areas', 'description' => 'Can create practice areas'],
            ['name' => 'edit-practice-areas', 'module' => 'practice_areas', 'label' => 'Edit Practice Areas', 'description' => 'Can edit practice areas'],
            ['name' => 'delete-practice-areas', 'module' => 'practice_areas', 'label' => 'Delete Practice Areas', 'description' => 'Can delete practice areas'],
            ['name' => 'toggle-status-practice-areas', 'module' => 'practice_areas', 'label' => 'Toggle Status Practice Areas', 'description' => 'Can toggle status of practice areas'],

            // Company Setting management
            ['name' => 'manage-company-settings', 'module' => 'company_settings', 'label' => 'Manage Company Settings', 'description' => 'Can manage company settings'],
            ['name' => 'manage-any-company-settings', 'module' => 'company_settings', 'label' => 'Manage All Company Settings', 'description' => 'Manage Any Company Settings'],
            ['name' => 'manage-own-company-settings', 'module' => 'company_settings', 'label' => 'Manage Own Company Settings', 'description' => 'Manage Limited Company Settings that is created by own'],
            ['name' => 'view-company-settings', 'module' => 'company_settings', 'label' => 'View Company Settings', 'description' => 'View Company Settings'],
            ['name' => 'edit-company-settings', 'module' => 'company_settings', 'label' => 'Edit Company Settings', 'description' => 'Can edit company settings'],

            // Case Document management
            ['name' => 'manage-case-documents', 'module' => 'case_documents', 'label' => 'Manage Case Documents', 'description' => 'Can manage case documents'],
            ['name' => 'manage-any-case-documents', 'module' => 'case_documents', 'label' => 'Manage All Case Documents', 'description' => 'Manage Any Case Documents'],
            ['name' => 'manage-own-case-documents', 'module' => 'case_documents', 'label' => 'Manage Own Case Documents', 'description' => 'Manage Limited Case Documents that is created by own'],
            ['name' => 'view-case-documents', 'module' => 'case_documents', 'label' => 'View Case Documents', 'description' => 'View Case Documents'],
            ['name' => 'create-case-documents', 'module' => 'case_documents', 'label' => 'Create Case Documents', 'description' => 'Can create case documents'],
            ['name' => 'edit-case-documents', 'module' => 'case_documents', 'label' => 'Edit Case Documents', 'description' => 'Can edit case documents'],
            ['name' => 'delete-case-documents', 'module' => 'case_documents', 'label' => 'Delete Case Documents', 'description' => 'Can delete case documents'],
            ['name' => 'download-case-documents', 'module' => 'case_documents', 'label' => 'Download Case Documents', 'description' => 'Can download case documents'],

            // Case Note management
            ['name' => 'manage-case-notes', 'module' => 'case_notes', 'label' => 'Manage Case Notes', 'description' => 'Can manage case notes'],
            ['name' => 'manage-any-case-notes', 'module' => 'case_notes', 'label' => 'Manage All Case Notes', 'description' => 'Manage Any Case Notes'],
            ['name' => 'manage-own-case-notes', 'module' => 'case_notes', 'label' => 'Manage Own Case Notes', 'description' => 'Manage Limited Case Notes that is created by own'],
            ['name' => 'view-case-notes', 'module' => 'case_notes', 'label' => 'View Case Notes', 'description' => 'View Case Notes'],
            ['name' => 'create-case-notes', 'module' => 'case_notes', 'label' => 'Create Case Notes', 'description' => 'Can create case notes'],
            ['name' => 'edit-case-notes', 'module' => 'case_notes', 'label' => 'Edit Case Notes', 'description' => 'Can edit case notes'],
            ['name' => 'delete-case-notes', 'module' => 'case_notes', 'label' => 'Delete Case Notes', 'description' => 'Can delete case notes'],

            // Case Management
            ['name' => 'manage-cases', 'module' => 'cases', 'label' => 'Manage Cases', 'description' => 'Can manage cases'],
            ['name' => 'manage-any-cases', 'module' => 'cases', 'label' => 'Manage All Cases', 'description' => 'Manage Any Cases'],
            ['name' => 'manage-own-cases', 'module' => 'cases', 'label' => 'Manage Own Cases', 'description' => 'Manage Limited Cases that is created by own'],
            ['name' => 'view-cases', 'module' => 'cases', 'label' => 'View Cases', 'description' => 'View Cases'],
            ['name' => 'create-cases', 'module' => 'cases', 'label' => 'Create Cases', 'description' => 'Can create cases'],
            ['name' => 'edit-cases', 'module' => 'cases', 'label' => 'Edit Cases', 'description' => 'Can edit cases'],
            ['name' => 'delete-cases', 'module' => 'cases', 'label' => 'Delete Cases', 'description' => 'Can delete cases'],
            ['name' => 'toggle-status-cases', 'module' => 'cases', 'label' => 'Toggle Status Cases', 'description' => 'Can toggle status of cases'],

            // Case Types
            ['name' => 'manage-case-types', 'module' => 'case_types', 'label' => 'Manage Case Types', 'description' => 'Can manage case types'],
            ['name' => 'manage-any-case-types', 'module' => 'case_types', 'label' => 'Manage All Case Types', 'description' => 'Manage Any Case Types'],
            ['name' => 'manage-own-case-types', 'module' => 'case_types', 'label' => 'Manage Own Case Types', 'description' => 'Manage Limited Case Types that is created by own'],
            ['name' => 'view-case-types', 'module' => 'case_types', 'label' => 'View Case Types', 'description' => 'View Case Types'],
            ['name' => 'create-case-types', 'module' => 'case_types', 'label' => 'Create Case Types', 'description' => 'Can create case types'],
            ['name' => 'edit-case-types', 'module' => 'case_types', 'label' => 'Edit Case Types', 'description' => 'Can edit case types'],
            ['name' => 'delete-case-types', 'module' => 'case_types', 'label' => 'Delete Case Types', 'description' => 'Can delete case types'],
            ['name' => 'toggle-status-case-types', 'module' => 'case_types', 'label' => 'Toggle Status Case Types', 'description' => 'Can toggle status of case types'],

            // Case Statuses
            ['name' => 'manage-case-statuses', 'module' => 'case_statuses', 'label' => 'Manage Case Statuses', 'description' => 'Can manage case statuses'],
            ['name' => 'manage-any-case-statuses', 'module' => 'case_statuses', 'label' => 'Manage All Case Statuses', 'description' => 'Manage Any Case Statuses'],
            ['name' => 'manage-own-case-statuses', 'module' => 'case_statuses', 'label' => 'Manage Own Case Statuses', 'description' => 'Manage Limited Case Statuses that is created by own'],
            ['name' => 'view-case-statuses', 'module' => 'case_statuses', 'label' => 'View Case Statuses', 'description' => 'View Case Statuses'],
            ['name' => 'create-case-statuses', 'module' => 'case_statuses', 'label' => 'Create Case Statuses', 'description' => 'Can create case statuses'],
            ['name' => 'edit-case-statuses', 'module' => 'case_statuses', 'label' => 'Edit Case Statuses', 'description' => 'Can edit case statuses'],
            ['name' => 'delete-case-statuses', 'module' => 'case_statuses', 'label' => 'Delete Case Statuses', 'description' => 'Can delete case statuses'],
            ['name' => 'toggle-status-case-statuses', 'module' => 'case_statuses', 'label' => 'Toggle Status Case Statuses', 'description' => 'Can toggle status of case statuses'],

            // Case Timelines
            ['name' => 'manage-case-timelines', 'module' => 'case_timelines', 'label' => 'Manage Case Timelines', 'description' => 'Can manage case timelines'],
            ['name' => 'manage-any-case-timelines', 'module' => 'case_timelines', 'label' => 'Manage All Case Timelines', 'description' => 'Manage Any Case Timelines'],
            ['name' => 'manage-own-case-timelines', 'module' => 'case_timelines', 'label' => 'Manage Own Case Timelines', 'description' => 'Manage Limited Case Timelines that is created by own'],
            ['name' => 'view-case-timelines', 'module' => 'case_timelines', 'label' => 'View Case Timelines', 'description' => 'View Case Timelines'],
            ['name' => 'create-case-timelines', 'module' => 'case_timelines', 'label' => 'Create Case Timelines', 'description' => 'Can create case timelines'],
            ['name' => 'edit-case-timelines', 'module' => 'case_timelines', 'label' => 'Edit Case Timelines', 'description' => 'Can edit case timelines'],
            ['name' => 'delete-case-timelines', 'module' => 'case_timelines', 'label' => 'Delete Case Timelines', 'description' => 'Can delete case timelines'],
            ['name' => 'toggle-status-case-timelines', 'module' => 'case_timelines', 'label' => 'Toggle Status Case Timelines', 'description' => 'Can toggle status of case timelines'],

            // Case Team Members
            ['name' => 'manage-case-team-members', 'module' => 'case_team_members', 'label' => 'Manage Case Team Members', 'description' => 'Can manage case team members'],
            ['name' => 'manage-any-case-team-members', 'module' => 'case_team_members', 'label' => 'Manage All Case Team Members', 'description' => 'Manage Any Case Team Members'],
            ['name' => 'manage-own-case-team-members', 'module' => 'case_team_members', 'label' => 'Manage Own Case Team Members', 'description' => 'Manage Limited Case Team Members that is created by own'],
            ['name' => 'view-case-team-members', 'module' => 'case_team_members', 'label' => 'View Case Team Members', 'description' => 'View Case Team Members'],
            ['name' => 'create-case-team-members', 'module' => 'case_team_members', 'label' => 'Create Case Team Members', 'description' => 'Can create case team members'],
            ['name' => 'edit-case-team-members', 'module' => 'case_team_members', 'label' => 'Edit Case Team Members', 'description' => 'Can edit case team members'],
            ['name' => 'delete-case-team-members', 'module' => 'case_team_members', 'label' => 'Delete Case Team Members', 'description' => 'Can delete case team members'],
            ['name' => 'toggle-status-case-team-members', 'module' => 'case_team_members', 'label' => 'Toggle Status Case Team Members', 'description' => 'Can toggle status of case team members'],

            // Document Types
            ['name' => 'manage-document-types', 'module' => 'document_types', 'label' => 'Manage Document Types', 'description' => 'Can manage document types'],
            ['name' => 'manage-any-document-types', 'module' => 'document_types', 'label' => 'Manage All Document Types', 'description' => 'Manage Any Document Types'],
            ['name' => 'manage-own-document-types', 'module' => 'document_types', 'label' => 'Manage Own Document Types', 'description' => 'Manage Limited Document Types that is created by own'],
            ['name' => 'view-document-types', 'module' => 'document_types', 'label' => 'View Document Types', 'description' => 'View Document Types'],
            ['name' => 'create-document-types', 'module' => 'document_types', 'label' => 'Create Document Types', 'description' => 'Can create document types'],
            ['name' => 'edit-document-types', 'module' => 'document_types', 'label' => 'Edit Document Types', 'description' => 'Can edit document types'],
            ['name' => 'delete-document-types', 'module' => 'document_types', 'label' => 'Delete Document Types', 'description' => 'Can delete document types'],

            // Document Categories
            ['name' => 'manage-document-categories', 'module' => 'document_categories', 'label' => 'Manage Document Categories', 'description' => 'Can manage document categories'],
            ['name' => 'manage-any-document-categories', 'module' => 'document_categories', 'label' => 'Manage All Document Categories', 'description' => 'Manage Any Document Categories'],
            ['name' => 'manage-own-document-categories', 'module' => 'document_categories', 'label' => 'Manage Own Document Categories', 'description' => 'Manage Limited Document Categories that is created by own'],
            ['name' => 'view-document-categories', 'module' => 'document_categories', 'label' => 'View Document Categories', 'description' => 'View Document Categories'],
            ['name' => 'create-document-categories', 'module' => 'document_categories', 'label' => 'Create Document Categories', 'description' => 'Can create document categories'],
            ['name' => 'edit-document-categories', 'module' => 'document_categories', 'label' => 'Edit Document Categories', 'description' => 'Can edit document categories'],
            ['name' => 'delete-document-categories', 'module' => 'document_categories', 'label' => 'Delete Document Categories', 'description' => 'Can delete document categories'],
            ['name' => 'toggle-status-document-categories', 'module' => 'document_categories', 'label' => 'Toggle Status Document Categories', 'description' => 'Can toggle status of document categories'],

            // Event Types
            ['name' => 'manage-event-types', 'module' => 'event_types', 'label' => 'Manage Event Types', 'description' => 'Can manage event types'],
            ['name' => 'manage-any-event-types', 'module' => 'event_types', 'label' => 'Manage All Event Types', 'description' => 'Manage Any Event Types'],
            ['name' => 'manage-own-event-types', 'module' => 'event_types', 'label' => 'Manage Own Event Types', 'description' => 'Manage Limited Event Types that is created by own'],
            ['name' => 'view-event-types', 'module' => 'event_types', 'label' => 'View Event Types', 'description' => 'View Event Types'],
            ['name' => 'create-event-types', 'module' => 'event_types', 'label' => 'Create Event Types', 'description' => 'Can create event types'],
            ['name' => 'edit-event-types', 'module' => 'event_types', 'label' => 'Edit Event Types', 'description' => 'Can edit event types'],
            ['name' => 'delete-event-types', 'module' => 'event_types', 'label' => 'Delete Event Types', 'description' => 'Can delete event types'],

            // Court Types
            ['name' => 'manage-court-types', 'module' => 'court_types', 'label' => 'Manage Court Types', 'description' => 'Can manage court types'],
            ['name' => 'manage-any-court-types', 'module' => 'court_types', 'label' => 'Manage All Court Types', 'description' => 'Manage Any Court Types'],
            ['name' => 'manage-own-court-types', 'module' => 'court_types', 'label' => 'Manage Own Court Types', 'description' => 'Manage Limited Court Types that is created by own'],
            ['name' => 'view-court-types', 'module' => 'court_types', 'label' => 'View Court Types', 'description' => 'View Court Types'],
            ['name' => 'create-court-types', 'module' => 'court_types', 'label' => 'Create Court Types', 'description' => 'Can create court types'],
            ['name' => 'edit-court-types', 'module' => 'court_types', 'label' => 'Edit Court Types', 'description' => 'Can edit court types'],
            ['name' => 'delete-court-types', 'module' => 'court_types', 'label' => 'Delete Court Types', 'description' => 'Can delete court types'],

            // Hearings
            ['name' => 'manage-hearings', 'module' => 'hearings', 'label' => 'Manage Hearings', 'description' => 'Can manage hearings'],
            ['name' => 'manage-any-hearings', 'module' => 'hearings', 'label' => 'Manage All Hearings', 'description' => 'Manage Any Hearings'],
            ['name' => 'manage-own-hearings', 'module' => 'hearings', 'label' => 'Manage Own Hearings', 'description' => 'Manage Limited Hearings that is created by own'],
            ['name' => 'view-hearings', 'module' => 'hearings', 'label' => 'View Hearings', 'description' => 'View Hearings'],
            ['name' => 'create-hearings', 'module' => 'hearings', 'label' => 'Create Hearings', 'description' => 'Can create hearings'],
            ['name' => 'edit-hearings', 'module' => 'hearings', 'label' => 'Edit Hearings', 'description' => 'Can edit hearings'],
            ['name' => 'delete-hearings', 'module' => 'hearings', 'label' => 'Delete Hearings', 'description' => 'Can delete hearings'],

            // Court Management
            ['name' => 'manage-courts', 'module' => 'courts', 'label' => 'Manage Courts', 'description' => 'Can manage courts'],
            ['name' => 'manage-any-courts', 'module' => 'courts', 'label' => 'Manage All Courts', 'description' => 'Manage Any Courts'],
            ['name' => 'manage-own-courts', 'module' => 'courts', 'label' => 'Manage Own Courts', 'description' => 'Manage Limited Courts that is created by own'],
            ['name' => 'view-courts', 'module' => 'courts', 'label' => 'View Courts', 'description' => 'View Courts'],
            ['name' => 'create-courts', 'module' => 'courts', 'label' => 'Create Courts', 'description' => 'Can create courts'],
            ['name' => 'edit-courts', 'module' => 'courts', 'label' => 'Edit Courts', 'description' => 'Can edit courts'],
            ['name' => 'delete-courts', 'module' => 'courts', 'label' => 'Delete Courts', 'description' => 'Can delete courts'],
            ['name' => 'toggle-status-courts', 'module' => 'courts', 'label' => 'Toggle Status Courts', 'description' => 'Can toggle status of courts'],

            // Judge Management
            ['name' => 'manage-judges', 'module' => 'judges', 'label' => 'Manage Judges', 'description' => 'Can manage judges'],
            ['name' => 'manage-any-judges', 'module' => 'judges', 'label' => 'Manage All Judges', 'description' => 'Manage Any Judges'],
            ['name' => 'manage-own-judges', 'module' => 'judges', 'label' => 'Manage Own Judges', 'description' => 'Manage Limited Judges that is created by own'],
            ['name' => 'view-judges', 'module' => 'judges', 'label' => 'View Judges', 'description' => 'View Judges'],
            ['name' => 'create-judges', 'module' => 'judges', 'label' => 'Create Judges', 'description' => 'Can create judges'],
            ['name' => 'edit-judges', 'module' => 'judges', 'label' => 'Edit Judges', 'description' => 'Can edit judges'],
            ['name' => 'delete-judges', 'module' => 'judges', 'label' => 'Delete Judges', 'description' => 'Can delete judges'],
            ['name' => 'toggle-status-judges', 'module' => 'judges', 'label' => 'Toggle Status Judges', 'description' => 'Can toggle status of judges'],

            // Hearing Type Management
            ['name' => 'manage-hearing-types', 'module' => 'hearing_types', 'label' => 'Manage Hearing Types', 'description' => 'Can manage hearing types'],
            ['name' => 'manage-any-hearing-types', 'module' => 'hearing_types', 'label' => 'Manage All Hearing Types', 'description' => 'Manage Any Hearing Types'],
            ['name' => 'manage-own-hearing-types', 'module' => 'hearing_types', 'label' => 'Manage Own Hearing Types', 'description' => 'Manage Limited Hearing Types that is created by own'],
            ['name' => 'view-hearing-types', 'module' => 'hearing_types', 'label' => 'View Hearing Types', 'description' => 'View Hearing Types'],
            ['name' => 'create-hearing-types', 'module' => 'hearing_types', 'label' => 'Create Hearing Types', 'description' => 'Can create hearing types'],
            ['name' => 'edit-hearing-types', 'module' => 'hearing_types', 'label' => 'Edit Hearing Types', 'description' => 'Can edit hearing types'],
            ['name' => 'delete-hearing-types', 'module' => 'hearing_types', 'label' => 'Delete Hearing Types', 'description' => 'Can delete hearing types'],
            ['name' => 'toggle-status-hearing-types', 'module' => 'hearing_types', 'label' => 'Toggle Status Hearing Types', 'description' => 'Can toggle status of hearing types'],

            // Documents
            ['name' => 'manage-documents', 'module' => 'documents', 'label' => 'Manage Documents', 'description' => 'Can manage documents'],
            ['name' => 'manage-any-documents', 'module' => 'documents', 'label' => 'Manage All Documents', 'description' => 'Manage Any Documents'],
            ['name' => 'manage-own-documents', 'module' => 'documents', 'label' => 'Manage Own Documents', 'description' => 'Manage Limited Documents that is created by own'],
            ['name' => 'view-documents', 'module' => 'documents', 'label' => 'View Documents', 'description' => 'View Documents'],
            ['name' => 'create-documents', 'module' => 'documents', 'label' => 'Create Documents', 'description' => 'Can create documents'],
            ['name' => 'edit-documents', 'module' => 'documents', 'label' => 'Edit Documents', 'description' => 'Can edit documents'],
            ['name' => 'delete-documents', 'module' => 'documents', 'label' => 'Delete Documents', 'description' => 'Can delete documents'],
            ['name' => 'download-documents', 'module' => 'documents', 'label' => 'Download Documents', 'description' => 'Can download documents'],
            ['name' => 'toggle-status-documents', 'module' => 'documents', 'label' => 'Toggle Status Documents', 'description' => 'Can toggle status of documents'],



            // Document Versions
            ['name' => 'manage-document-versions', 'module' => 'document_versions', 'label' => 'Manage Document Versions', 'description' => 'Can manage document versions'],
            ['name' => 'manage-any-document-versions', 'module' => 'document_versions', 'label' => 'Manage All Document Versions', 'description' => 'Manage Any Document Versions'],
            ['name' => 'manage-own-document-versions', 'module' => 'document_versions', 'label' => 'Manage Own Document Versions', 'description' => 'Manage Limited Document Versions that is created by own'],
            ['name' => 'view-document-versions', 'module' => 'document_versions', 'label' => 'View Document Versions', 'description' => 'View Document Versions'],
            ['name' => 'create-document-versions', 'module' => 'document_versions', 'label' => 'Create Document Versions', 'description' => 'Can create document versions'],
            ['name' => 'delete-document-versions', 'module' => 'document_versions', 'label' => 'Delete Document Versions', 'description' => 'Can delete document versions'],
            ['name' => 'download-document-versions', 'module' => 'document_versions', 'label' => 'Download Document Versions', 'description' => 'Can download document versions'],
            ['name' => 'restore-document-versions', 'module' => 'document_versions', 'label' => 'Restore Document Versions', 'description' => 'Can restore document versions'],

            // Document Comments
            ['name' => 'manage-document-comments', 'module' => 'document_comments', 'label' => 'Manage Document Comments', 'description' => 'Can manage document comments'],
            ['name' => 'manage-any-document-comments', 'module' => 'document_comments', 'label' => 'Manage All Document Comments', 'description' => 'Manage Any Document Comments'],
            ['name' => 'manage-own-document-comments', 'module' => 'document_comments', 'label' => 'Manage Own Document Comments', 'description' => 'Manage Limited Document Comments that is created by own'],
            ['name' => 'view-document-comments', 'module' => 'document_comments', 'label' => 'View Document Comments', 'description' => 'View Document Comments'],
            ['name' => 'create-document-comments', 'module' => 'document_comments', 'label' => 'Create Document Comments', 'description' => 'Can create document comments'],
            ['name' => 'edit-document-comments', 'module' => 'document_comments', 'label' => 'Edit Document Comments', 'description' => 'Can edit document comments'],
            ['name' => 'delete-document-comments', 'module' => 'document_comments', 'label' => 'Delete Document Comments', 'description' => 'Can delete document comments'],
            ['name' => 'resolve-document-comments', 'module' => 'document_comments', 'label' => 'Resolve Document Comments', 'description' => 'Can resolve document comments'],

            // Document Permissions
            ['name' => 'manage-document-permissions', 'module' => 'document_permissions', 'label' => 'Manage Document Permissions', 'description' => 'Can manage document permissions'],
            ['name' => 'manage-any-document-permissions', 'module' => 'document_permissions', 'label' => 'Manage All Document Permissions', 'description' => 'Manage Any Document Permissions'],
            ['name' => 'manage-own-document-permissions', 'module' => 'document_permissions', 'label' => 'Manage Own Document Permissions', 'description' => 'Manage Limited Document Permissions that is created by own'],
            ['name' => 'view-document-permissions', 'module' => 'document_permissions', 'label' => 'View Document Permissions', 'description' => 'View Document Permissions'],
            ['name' => 'create-document-permissions', 'module' => 'document_permissions', 'label' => 'Create Document Permissions', 'description' => 'Can create document permissions'],
            ['name' => 'edit-document-permissions', 'module' => 'document_permissions', 'label' => 'Edit Document Permissions', 'description' => 'Can edit document permissions'],
            ['name' => 'delete-document-permissions', 'module' => 'document_permissions', 'label' => 'Delete Document Permissions', 'description' => 'Can delete document permissions'],



            // Research Projects
            ['name' => 'manage-research-projects', 'module' => 'research_projects', 'label' => 'Manage Research Projects', 'description' => 'Can manage research projects'],
            ['name' => 'manage-any-research-projects', 'module' => 'research_projects', 'label' => 'Manage All Research Projects', 'description' => 'Manage Any Research Projects'],
            ['name' => 'manage-own-research-projects', 'module' => 'research_projects', 'label' => 'Manage Own Research Projects', 'description' => 'Manage Limited Research Projects that is created by own'],
            ['name' => 'view-research-projects', 'module' => 'research_projects', 'label' => 'View Research Projects', 'description' => 'View Research Projects'],
            ['name' => 'create-research-projects', 'module' => 'research_projects', 'label' => 'Create Research Projects', 'description' => 'Can create research projects'],
            ['name' => 'edit-research-projects', 'module' => 'research_projects', 'label' => 'Edit Research Projects', 'description' => 'Can edit research projects'],
            ['name' => 'delete-research-projects', 'module' => 'research_projects', 'label' => 'Delete Research Projects', 'description' => 'Can delete research projects'],
            ['name' => 'toggle-status-research-projects', 'module' => 'research_projects', 'label' => 'Toggle Status Research Projects', 'description' => 'Can toggle status of research projects'],

            // Research Sources
            ['name' => 'manage-research-sources', 'module' => 'research_sources', 'label' => 'Manage Research Sources', 'description' => 'Can manage research sources'],
            ['name' => 'manage-any-research-sources', 'module' => 'research_sources', 'label' => 'Manage All Research Sources', 'description' => 'Manage Any Research Sources'],
            ['name' => 'manage-own-research-sources', 'module' => 'research_sources', 'label' => 'Manage Own Research Sources', 'description' => 'Manage Limited Research Sources that is created by own'],
            ['name' => 'view-research-sources', 'module' => 'research_sources', 'label' => 'View Research Sources', 'description' => 'View Research Sources'],
            ['name' => 'create-research-sources', 'module' => 'research_sources', 'label' => 'Create Research Sources', 'description' => 'Can create research sources'],
            ['name' => 'edit-research-sources', 'module' => 'research_sources', 'label' => 'Edit Research Sources', 'description' => 'Can edit research sources'],
            ['name' => 'delete-research-sources', 'module' => 'research_sources', 'label' => 'Delete Research Sources', 'description' => 'Can delete research sources'],
            ['name' => 'toggle-status-research-sources', 'module' => 'research_sources', 'label' => 'Toggle Status Research Sources', 'description' => 'Can toggle status of research sources'],

            // Research Categories
            ['name' => 'manage-research-categories', 'module' => 'research_categories', 'label' => 'Manage Research Categories', 'description' => 'Can manage research categories'],
            ['name' => 'manage-any-research-categories', 'module' => 'research_categories', 'label' => 'Manage All Research Categories', 'description' => 'Manage Any Research Categories'],
            ['name' => 'manage-own-research-categories', 'module' => 'research_categories', 'label' => 'Manage Own Research Categories', 'description' => 'Manage Limited Research Categories that is created by own'],
            ['name' => 'view-research-categories', 'module' => 'research_categories', 'label' => 'View Research Categories', 'description' => 'View Research Categories'],
            ['name' => 'create-research-categories', 'module' => 'research_categories', 'label' => 'Create Research Categories', 'description' => 'Can create research categories'],
            ['name' => 'edit-research-categories', 'module' => 'research_categories', 'label' => 'Edit Research Categories', 'description' => 'Can edit research categories'],
            ['name' => 'delete-research-categories', 'module' => 'research_categories', 'label' => 'Delete Research Categories', 'description' => 'Can delete research categories'],
            ['name' => 'toggle-status-research-categories', 'module' => 'research_categories', 'label' => 'Toggle Status Research Categories', 'description' => 'Can toggle status of research categories'],

            // Knowledge Articles
            ['name' => 'manage-knowledge-articles', 'module' => 'knowledge_articles', 'label' => 'Manage Knowledge Articles', 'description' => 'Can manage knowledge articles'],
            ['name' => 'manage-any-knowledge-articles', 'module' => 'knowledge_articles', 'label' => 'Manage All Knowledge Articles', 'description' => 'Manage Any Knowledge Articles'],
            ['name' => 'manage-own-knowledge-articles', 'module' => 'knowledge_articles', 'label' => 'Manage Own Knowledge Articles', 'description' => 'Manage Limited Knowledge Articles that is created by own'],
            ['name' => 'view-knowledge-articles', 'module' => 'knowledge_articles', 'label' => 'View Knowledge Articles', 'description' => 'View Knowledge Articles'],
            ['name' => 'create-knowledge-articles', 'module' => 'knowledge_articles', 'label' => 'Create Knowledge Articles', 'description' => 'Can create knowledge articles'],
            ['name' => 'edit-knowledge-articles', 'module' => 'knowledge_articles', 'label' => 'Edit Knowledge Articles', 'description' => 'Can edit knowledge articles'],
            ['name' => 'delete-knowledge-articles', 'module' => 'knowledge_articles', 'label' => 'Delete Knowledge Articles', 'description' => 'Can delete knowledge articles'],
            ['name' => 'publish-knowledge-articles', 'module' => 'knowledge_articles', 'label' => 'Publish Knowledge Articles', 'description' => 'Can publish knowledge articles'],

            // Legal Precedents
            ['name' => 'manage-legal-precedents', 'module' => 'legal_precedents', 'label' => 'Manage Legal Precedents', 'description' => 'Can manage legal precedents'],
            ['name' => 'manage-any-legal-precedents', 'module' => 'legal_precedents', 'label' => 'Manage All Legal Precedents', 'description' => 'Manage Any Legal Precedents'],
            ['name' => 'manage-own-legal-precedents', 'module' => 'legal_precedents', 'label' => 'Manage Own Legal Precedents', 'description' => 'Manage Limited Legal Precedents that is created by own'],
            ['name' => 'view-legal-precedents', 'module' => 'legal_precedents', 'label' => 'View Legal Precedents', 'description' => 'View Legal Precedents'],
            ['name' => 'create-legal-precedents', 'module' => 'legal_precedents', 'label' => 'Create Legal Precedents', 'description' => 'Can create legal precedents'],
            ['name' => 'edit-legal-precedents', 'module' => 'legal_precedents', 'label' => 'Edit Legal Precedents', 'description' => 'Can edit legal precedents'],
            ['name' => 'delete-legal-precedents', 'module' => 'legal_precedents', 'label' => 'Delete Legal Precedents', 'description' => 'Can delete legal precedents'],
            ['name' => 'toggle-status-legal-precedents', 'module' => 'legal_precedents', 'label' => 'Toggle Status Legal Precedents', 'description' => 'Can toggle status of legal precedents'],

            // Research Notes
            ['name' => 'manage-research-notes', 'module' => 'research_notes', 'label' => 'Manage Research Notes', 'description' => 'Can manage research notes'],
            ['name' => 'manage-any-research-notes', 'module' => 'research_notes', 'label' => 'Manage All Research Notes', 'description' => 'Manage Any Research Notes'],
            ['name' => 'manage-own-research-notes', 'module' => 'research_notes', 'label' => 'Manage Own Research Notes', 'description' => 'Manage Limited Research Notes that is created by own'],
            ['name' => 'view-research-notes', 'module' => 'research_notes', 'label' => 'View Research Notes', 'description' => 'View Research Notes'],
            ['name' => 'create-research-notes', 'module' => 'research_notes', 'label' => 'Create Research Notes', 'description' => 'Can create research notes'],
            ['name' => 'edit-research-notes', 'module' => 'research_notes', 'label' => 'Edit Research Notes', 'description' => 'Can edit research notes'],
            ['name' => 'delete-research-notes', 'module' => 'research_notes', 'label' => 'Delete Research Notes', 'description' => 'Can delete research notes'],

            // Research Citations
            ['name' => 'manage-research-citations', 'module' => 'research_citations', 'label' => 'Manage Research Citations', 'description' => 'Can manage research citations'],
            ['name' => 'manage-any-research-citations', 'module' => 'research_citations', 'label' => 'Manage All Research Citations', 'description' => 'Manage Any Research Citations'],
            ['name' => 'manage-own-research-citations', 'module' => 'research_citations', 'label' => 'Manage Own Research Citations', 'description' => 'Manage Limited Research Citations that is created by own'],
            ['name' => 'view-research-citations', 'module' => 'research_citations', 'label' => 'View Research Citations', 'description' => 'View Research Citations'],
            ['name' => 'create-research-citations', 'module' => 'research_citations', 'label' => 'Create Research Citations', 'description' => 'Can create research citations'],
            ['name' => 'edit-research-citations', 'module' => 'research_citations', 'label' => 'Edit Research Citations', 'description' => 'Can edit research citations'],
            ['name' => 'delete-research-citations', 'module' => 'research_citations', 'label' => 'Delete Research Citations', 'description' => 'Can delete research citations'],

            // Research Types
            ['name' => 'manage-research-types', 'module' => 'research_types', 'label' => 'Manage Research Types', 'description' => 'Can manage research types'],
            ['name' => 'manage-any-research-types', 'module' => 'research_types', 'label' => 'Manage All Research Types', 'description' => 'Manage Any Research Types'],
            ['name' => 'manage-own-research-types', 'module' => 'research_types', 'label' => 'Manage Own Research Types', 'description' => 'Manage Limited Research Types that is created by own'],
            ['name' => 'view-research-types', 'module' => 'research_types', 'label' => 'View Research Types', 'description' => 'View Research Types'],
            ['name' => 'create-research-types', 'module' => 'research_types', 'label' => 'Create Research Types', 'description' => 'Can create research types'],
            ['name' => 'edit-research-types', 'module' => 'research_types', 'label' => 'Edit Research Types', 'description' => 'Can edit research types'],
            ['name' => 'delete-research-types', 'module' => 'research_types', 'label' => 'Delete Research Types', 'description' => 'Can delete research types'],
            ['name' => 'toggle-status-research-types', 'module' => 'research_types', 'label' => 'Toggle Status Research Types', 'description' => 'Can toggle status of research types'],

            // Compliance Requirements
            ['name' => 'manage-compliance-requirements', 'module' => 'compliance_requirements', 'label' => 'Manage Compliance Requirements', 'description' => 'Can manage compliance requirements'],
            ['name' => 'manage-any-compliance-requirements', 'module' => 'compliance_requirements', 'label' => 'Manage All Compliance Requirements', 'description' => 'Manage Any Compliance Requirements'],
            ['name' => 'manage-own-compliance-requirements', 'module' => 'compliance_requirements', 'label' => 'Manage Own Compliance Requirements', 'description' => 'Manage Limited Compliance Requirements that is created by own'],
            ['name' => 'view-compliance-requirements', 'module' => 'compliance_requirements', 'label' => 'View Compliance Requirements', 'description' => 'View Compliance Requirements'],
            ['name' => 'create-compliance-requirements', 'module' => 'compliance_requirements', 'label' => 'Create Compliance Requirements', 'description' => 'Can create compliance requirements'],
            ['name' => 'edit-compliance-requirements', 'module' => 'compliance_requirements', 'label' => 'Edit Compliance Requirements', 'description' => 'Can edit compliance requirements'],
            ['name' => 'delete-compliance-requirements', 'module' => 'compliance_requirements', 'label' => 'Delete Compliance Requirements', 'description' => 'Can delete compliance requirements'],
            ['name' => 'toggle-status-compliance-requirements', 'module' => 'compliance_requirements', 'label' => 'Toggle Status Compliance Requirements', 'description' => 'Can toggle status of compliance requirements'],

            // Compliance Categories
            ['name' => 'manage-compliance-categories', 'module' => 'compliance_categories', 'label' => 'Manage Compliance Categories', 'description' => 'Can manage compliance categories'],
            ['name' => 'manage-any-compliance-categories', 'module' => 'compliance_categories', 'label' => 'Manage All Compliance Categories', 'description' => 'Manage Any Compliance Categories'],
            ['name' => 'manage-own-compliance-categories', 'module' => 'compliance_categories', 'label' => 'Manage Own Compliance Categories', 'description' => 'Manage Limited Compliance Categories that is created by own'],
            ['name' => 'view-compliance-categories', 'module' => 'compliance_categories', 'label' => 'View Compliance Categories', 'description' => 'View Compliance Categories'],
            ['name' => 'create-compliance-categories', 'module' => 'compliance_categories', 'label' => 'Create Compliance Categories', 'description' => 'Can create compliance categories'],
            ['name' => 'edit-compliance-categories', 'module' => 'compliance_categories', 'label' => 'Edit Compliance Categories', 'description' => 'Can edit compliance categories'],
            ['name' => 'delete-compliance-categories', 'module' => 'compliance_categories', 'label' => 'Delete Compliance Categories', 'description' => 'Can delete compliance categories'],
            ['name' => 'toggle-status-compliance-categories', 'module' => 'compliance_categories', 'label' => 'Toggle Status Compliance Categories', 'description' => 'Can toggle status of compliance categories'],

            // Compliance Frequencies
            ['name' => 'manage-compliance-frequencies', 'module' => 'compliance_frequencies', 'label' => 'Manage Compliance Frequencies', 'description' => 'Can manage compliance frequencies'],
            ['name' => 'manage-any-compliance-frequencies', 'module' => 'compliance_frequencies', 'label' => 'Manage All Compliance Frequencies', 'description' => 'Manage Any Compliance Frequencies'],
            ['name' => 'manage-own-compliance-frequencies', 'module' => 'compliance_frequencies', 'label' => 'Manage Own Compliance Frequencies', 'description' => 'Manage Limited Compliance Frequencies that is created by own'],
            ['name' => 'view-compliance-frequencies', 'module' => 'compliance_frequencies', 'label' => 'View Compliance Frequencies', 'description' => 'View Compliance Frequencies'],
            ['name' => 'create-compliance-frequencies', 'module' => 'compliance_frequencies', 'label' => 'Create Compliance Frequencies', 'description' => 'Can create compliance frequencies'],
            ['name' => 'edit-compliance-frequencies', 'module' => 'compliance_frequencies', 'label' => 'Edit Compliance Frequencies', 'description' => 'Can edit compliance frequencies'],
            ['name' => 'delete-compliance-frequencies', 'module' => 'compliance_frequencies', 'label' => 'Delete Compliance Frequencies', 'description' => 'Can delete compliance frequencies'],
            ['name' => 'toggle-status-compliance-frequencies', 'module' => 'compliance_frequencies', 'label' => 'Toggle Status Compliance Frequencies', 'description' => 'Can toggle status of compliance frequencies'],

            // Professional Licenses
            ['name' => 'manage-professional-licenses', 'module' => 'professional_licenses', 'label' => 'Manage Professional Licenses', 'description' => 'Can manage professional licenses'],
            ['name' => 'manage-any-professional-licenses', 'module' => 'professional_licenses', 'label' => 'Manage All Professional Licenses', 'description' => 'Manage Any Professional Licenses'],
            ['name' => 'manage-own-professional-licenses', 'module' => 'professional_licenses', 'label' => 'Manage Own Professional Licenses', 'description' => 'Manage Limited Professional Licenses that is created by own'],
            ['name' => 'view-professional-licenses', 'module' => 'professional_licenses', 'label' => 'View Professional Licenses', 'description' => 'View Professional Licenses'],
            ['name' => 'create-professional-licenses', 'module' => 'professional_licenses', 'label' => 'Create Professional Licenses', 'description' => 'Can create professional licenses'],
            ['name' => 'edit-professional-licenses', 'module' => 'professional_licenses', 'label' => 'Edit Professional Licenses', 'description' => 'Can edit professional licenses'],
            ['name' => 'delete-professional-licenses', 'module' => 'professional_licenses', 'label' => 'Delete Professional Licenses', 'description' => 'Can delete professional licenses'],
            ['name' => 'toggle-status-professional-licenses', 'module' => 'professional_licenses', 'label' => 'Toggle Status Professional Licenses', 'description' => 'Can toggle status of professional licenses'],

            // Regulatory Bodies
            ['name' => 'manage-regulatory-bodies', 'module' => 'regulatory_bodies', 'label' => 'Manage Regulatory Bodies', 'description' => 'Can manage regulatory bodies'],
            ['name' => 'manage-any-regulatory-bodies', 'module' => 'regulatory_bodies', 'label' => 'Manage All Regulatory Bodies', 'description' => 'Manage Any Regulatory Bodies'],
            ['name' => 'manage-own-regulatory-bodies', 'module' => 'regulatory_bodies', 'label' => 'Manage Own Regulatory Bodies', 'description' => 'Manage Limited Regulatory Bodies that is created by own'],
            ['name' => 'view-regulatory-bodies', 'module' => 'regulatory_bodies', 'label' => 'View Regulatory Bodies', 'description' => 'View Regulatory Bodies'],
            ['name' => 'create-regulatory-bodies', 'module' => 'regulatory_bodies', 'label' => 'Create Regulatory Bodies', 'description' => 'Can create regulatory bodies'],
            ['name' => 'edit-regulatory-bodies', 'module' => 'regulatory_bodies', 'label' => 'Edit Regulatory Bodies', 'description' => 'Can edit regulatory bodies'],
            ['name' => 'delete-regulatory-bodies', 'module' => 'regulatory_bodies', 'label' => 'Delete Regulatory Bodies', 'description' => 'Can delete regulatory bodies'],
            ['name' => 'toggle-status-regulatory-bodies', 'module' => 'regulatory_bodies', 'label' => 'Toggle Status Regulatory Bodies', 'description' => 'Can toggle status of regulatory bodies'],

            // Compliance Policies
            ['name' => 'manage-compliance-policies', 'module' => 'compliance_policies', 'label' => 'Manage Compliance Policies', 'description' => 'Can manage compliance policies'],
            ['name' => 'manage-any-compliance-policies', 'module' => 'compliance_policies', 'label' => 'Manage All Compliance Policies', 'description' => 'Manage Any Compliance Policies'],
            ['name' => 'manage-own-compliance-policies', 'module' => 'compliance_policies', 'label' => 'Manage Own Compliance Policies', 'description' => 'Manage Limited Compliance Policies that is created by own'],
            ['name' => 'view-compliance-policies', 'module' => 'compliance_policies', 'label' => 'View Compliance Policies', 'description' => 'View Compliance Policies'],
            ['name' => 'create-compliance-policies', 'module' => 'compliance_policies', 'label' => 'Create Compliance Policies', 'description' => 'Can create compliance policies'],
            ['name' => 'edit-compliance-policies', 'module' => 'compliance_policies', 'label' => 'Edit Compliance Policies', 'description' => 'Can edit compliance policies'],
            ['name' => 'delete-compliance-policies', 'module' => 'compliance_policies', 'label' => 'Delete Compliance Policies', 'description' => 'Can delete compliance policies'],
            ['name' => 'toggle-status-compliance-policies', 'module' => 'compliance_policies', 'label' => 'Toggle Status Compliance Policies', 'description' => 'Can toggle status of compliance policies'],

            // CLE Tracking
            ['name' => 'manage-cle-tracking', 'module' => 'cle_tracking', 'label' => 'Manage CLE Tracking', 'description' => 'Can manage CLE tracking records'],
            ['name' => 'manage-any-cle-tracking', 'module' => 'cle_tracking', 'label' => 'Manage All CLE Tracking', 'description' => 'Manage Any CLE Tracking'],
            ['name' => 'manage-own-cle-tracking', 'module' => 'cle_tracking', 'label' => 'Manage Own CLE Tracking', 'description' => 'Manage Limited CLE Tracking that is created by own'],
            ['name' => 'view-cle-tracking', 'module' => 'cle_tracking', 'label' => 'View CLE Tracking', 'description' => 'View CLE Tracking'],
            ['name' => 'create-cle-tracking', 'module' => 'cle_tracking', 'label' => 'Create CLE Tracking', 'description' => 'Can create CLE tracking records'],
            ['name' => 'edit-cle-tracking', 'module' => 'cle_tracking', 'label' => 'Edit CLE Tracking', 'description' => 'Can edit CLE tracking records'],
            ['name' => 'delete-cle-tracking', 'module' => 'cle_tracking', 'label' => 'Delete CLE Tracking', 'description' => 'Can delete CLE tracking records'],
            ['name' => 'download-cle-tracking', 'module' => 'cle_tracking', 'label' => 'Download CLE Tracking', 'description' => 'Can download CLE certificate files'],

            // Risk Categories
            ['name' => 'manage-risk-categories', 'module' => 'risk_categories', 'label' => 'Manage Risk Categories', 'description' => 'Can manage risk categories'],
            ['name' => 'manage-any-risk-categories', 'module' => 'risk_categories', 'label' => 'Manage All Risk Categories', 'description' => 'Manage Any Risk Categories'],
            ['name' => 'manage-own-risk-categories', 'module' => 'risk_categories', 'label' => 'Manage Own Risk Categories', 'description' => 'Manage Limited Risk Categories that is created by own'],
            ['name' => 'view-risk-categories', 'module' => 'risk_categories', 'label' => 'View Risk Categories', 'description' => 'View Risk Categories'],
            ['name' => 'create-risk-categories', 'module' => 'risk_categories', 'label' => 'Create Risk Categories', 'description' => 'Can create risk categories'],
            ['name' => 'edit-risk-categories', 'module' => 'risk_categories', 'label' => 'Edit Risk Categories', 'description' => 'Can edit risk categories'],
            ['name' => 'delete-risk-categories', 'module' => 'risk_categories', 'label' => 'Delete Risk Categories', 'description' => 'Can delete risk categories'],
            ['name' => 'toggle-status-risk-categories', 'module' => 'risk_categories', 'label' => 'Toggle Status Risk Categories', 'description' => 'Can toggle status of risk categories'],

            // Risk Assessments
            ['name' => 'manage-risk-assessments', 'module' => 'risk_assessments', 'label' => 'Manage Risk Assessments', 'description' => 'Can manage risk assessments'],
            ['name' => 'manage-any-risk-assessments', 'module' => 'risk_assessments', 'label' => 'Manage All Risk Assessments', 'description' => 'Manage Any Risk Assessments'],
            ['name' => 'manage-own-risk-assessments', 'module' => 'risk_assessments', 'label' => 'Manage Own Risk Assessments', 'description' => 'Manage Limited Risk Assessments that is created by own'],
            ['name' => 'view-risk-assessments', 'module' => 'risk_assessments', 'label' => 'View Risk Assessments', 'description' => 'View Risk Assessments'],
            ['name' => 'create-risk-assessments', 'module' => 'risk_assessments', 'label' => 'Create Risk Assessments', 'description' => 'Can create risk assessments'],
            ['name' => 'edit-risk-assessments', 'module' => 'risk_assessments', 'label' => 'Edit Risk Assessments', 'description' => 'Can edit risk assessments'],
            ['name' => 'delete-risk-assessments', 'module' => 'risk_assessments', 'label' => 'Delete Risk Assessments', 'description' => 'Can delete risk assessments'],

            // Audit Types
            ['name' => 'manage-audit-types', 'module' => 'audit_types', 'label' => 'Manage Audit Types', 'description' => 'Can manage audit types'],
            ['name' => 'manage-any-audit-types', 'module' => 'audit_types', 'label' => 'Manage All Audit Types', 'description' => 'Manage Any Audit Types'],
            ['name' => 'manage-own-audit-types', 'module' => 'audit_types', 'label' => 'Manage Own Audit Types', 'description' => 'Manage Limited Audit Types that is created by own'],
            ['name' => 'view-audit-types', 'module' => 'audit_types', 'label' => 'View Audit Types', 'description' => 'View Audit Types'],
            ['name' => 'create-audit-types', 'module' => 'audit_types', 'label' => 'Create Audit Types', 'description' => 'Can create audit types'],
            ['name' => 'edit-audit-types', 'module' => 'audit_types', 'label' => 'Edit Audit Types', 'description' => 'Can edit audit types'],
            ['name' => 'delete-audit-types', 'module' => 'audit_types', 'label' => 'Delete Audit Types', 'description' => 'Can delete audit types'],
            ['name' => 'toggle-status-audit-types', 'module' => 'audit_types', 'label' => 'Toggle Status Audit Types', 'description' => 'Can toggle status of audit types'],

            // Compliance Audits
            ['name' => 'manage-compliance-audits', 'module' => 'compliance_audits', 'label' => 'Manage Compliance Audits', 'description' => 'Can manage compliance audits'],
            ['name' => 'manage-any-compliance-audits', 'module' => 'compliance_audits', 'label' => 'Manage All Compliance Audits', 'description' => 'Manage Any Compliance Audits'],
            ['name' => 'manage-own-compliance-audits', 'module' => 'compliance_audits', 'label' => 'Manage Own Compliance Audits', 'description' => 'Manage Limited Compliance Audits that is created by own'],
            ['name' => 'view-compliance-audits', 'module' => 'compliance_audits', 'label' => 'View Compliance Audits', 'description' => 'View Compliance Audits'],
            ['name' => 'create-compliance-audits', 'module' => 'compliance_audits', 'label' => 'Create Compliance Audits', 'description' => 'Can create compliance audits'],
            ['name' => 'edit-compliance-audits', 'module' => 'compliance_audits', 'label' => 'Edit Compliance Audits', 'description' => 'Can edit compliance audits'],
            ['name' => 'delete-compliance-audits', 'module' => 'compliance_audits', 'label' => 'Delete Compliance Audits', 'description' => 'Can delete compliance audits'],

            // Time Entries
            ['name' => 'manage-time-entries', 'module' => 'time_entries', 'label' => 'Manage Time Entries', 'description' => 'Can manage time entries'],
            ['name' => 'manage-any-time-entries', 'module' => 'time_entries', 'label' => 'Manage All Time Entries', 'description' => 'Manage Any Time Entries'],
            ['name' => 'manage-own-time-entries', 'module' => 'time_entries', 'label' => 'Manage Own Time Entries', 'description' => 'Manage Limited Time Entries that is created by own'],
            ['name' => 'view-time-entries', 'module' => 'time_entries', 'label' => 'View Time Entries', 'description' => 'View Time Entries'],
            ['name' => 'create-time-entries', 'module' => 'time_entries', 'label' => 'Create Time Entries', 'description' => 'Can create time entries'],
            ['name' => 'edit-time-entries', 'module' => 'time_entries', 'label' => 'Edit Time Entries', 'description' => 'Can edit time entries'],
            ['name' => 'delete-time-entries', 'module' => 'time_entries', 'label' => 'Delete Time Entries', 'description' => 'Can delete time entries'],
            ['name' => 'approve-time-entries', 'module' => 'time_entries', 'label' => 'Approve Time Entries', 'description' => 'Can approve time entries'],
            ['name' => 'start-timer', 'module' => 'time_entries', 'label' => 'Start Timer', 'description' => 'Can start time tracking timer'],
            ['name' => 'stop-timer', 'module' => 'time_entries', 'label' => 'Stop Timer', 'description' => 'Can stop time tracking timer'],

            // Billing Rates
            ['name' => 'manage-billing-rates', 'module' => 'billing_rates', 'label' => 'Manage Billing Rates', 'description' => 'Can manage billing rates'],
            ['name' => 'manage-any-billing-rates', 'module' => 'billing_rates', 'label' => 'Manage All Billing Rates', 'description' => 'Manage Any Billing Rates'],
            ['name' => 'manage-own-billing-rates', 'module' => 'billing_rates', 'label' => 'Manage Own Billing Rates', 'description' => 'Manage Limited Billing Rates that is created by own'],
            ['name' => 'view-billing-rates', 'module' => 'billing_rates', 'label' => 'View Billing Rates', 'description' => 'View Billing Rates'],
            ['name' => 'create-billing-rates', 'module' => 'billing_rates', 'label' => 'Create Billing Rates', 'description' => 'Can create billing rates'],
            ['name' => 'edit-billing-rates', 'module' => 'billing_rates', 'label' => 'Edit Billing Rates', 'description' => 'Can edit billing rates'],
            ['name' => 'delete-billing-rates', 'module' => 'billing_rates', 'label' => 'Delete Billing Rates', 'description' => 'Can delete billing rates'],
            ['name' => 'toggle-status-billing-rates', 'module' => 'billing_rates', 'label' => 'Toggle Status Billing Rates', 'description' => 'Can toggle status of billing rates'],

            // Fee Types
            ['name' => 'manage-fee-types', 'module' => 'fee_types', 'label' => 'Manage Fee Types', 'description' => 'Can manage fee types'],
            ['name' => 'manage-any-fee-types', 'module' => 'fee_types', 'label' => 'Manage All Fee Types', 'description' => 'Manage Any Fee Types'],
            ['name' => 'manage-own-fee-types', 'module' => 'fee_types', 'label' => 'Manage Own Fee Types', 'description' => 'Manage Limited Fee Types that is created by own'],
            ['name' => 'view-fee-types', 'module' => 'fee_types', 'label' => 'View Fee Types', 'description' => 'View Fee Types'],
            ['name' => 'create-fee-types', 'module' => 'fee_types', 'label' => 'Create Fee Types', 'description' => 'Can create fee types'],
            ['name' => 'edit-fee-types', 'module' => 'fee_types', 'label' => 'Edit Fee Types', 'description' => 'Can edit fee types'],
            ['name' => 'delete-fee-types', 'module' => 'fee_types', 'label' => 'Delete Fee Types', 'description' => 'Can delete fee types'],
            ['name' => 'toggle-status-fee-types', 'module' => 'fee_types', 'label' => 'Toggle Status Fee Types', 'description' => 'Can toggle status of fee types'],

            // Fee Structures
            ['name' => 'manage-fee-structures', 'module' => 'fee_structures', 'label' => 'Manage Fee Structures', 'description' => 'Can manage fee structures'],
            ['name' => 'manage-any-fee-structures', 'module' => 'fee_structures', 'label' => 'Manage All Fee Structures', 'description' => 'Manage Any Fee Structures'],
            ['name' => 'manage-own-fee-structures', 'module' => 'fee_structures', 'label' => 'Manage Own Fee Structures', 'description' => 'Manage Limited Fee Structures that is created by own'],
            ['name' => 'view-fee-structures', 'module' => 'fee_structures', 'label' => 'View Fee Structures', 'description' => 'View Fee Structures'],
            ['name' => 'create-fee-structures', 'module' => 'fee_structures', 'label' => 'Create Fee Structures', 'description' => 'Can create fee structures'],
            ['name' => 'edit-fee-structures', 'module' => 'fee_structures', 'label' => 'Edit Fee Structures', 'description' => 'Can edit fee structures'],
            ['name' => 'delete-fee-structures', 'module' => 'fee_structures', 'label' => 'Delete Fee Structures', 'description' => 'Can delete fee structures'],
            ['name' => 'toggle-status-fee-structures', 'module' => 'fee_structures', 'label' => 'Toggle Status Fee Structures', 'description' => 'Can toggle status of fee structures'],

            // Expenses
            ['name' => 'manage-expenses', 'module' => 'expenses', 'label' => 'Manage Expenses', 'description' => 'Can manage expenses'],
            ['name' => 'manage-any-expenses', 'module' => 'expenses', 'label' => 'Manage All Expenses', 'description' => 'Manage Any Expenses'],
            ['name' => 'manage-own-expenses', 'module' => 'expenses', 'label' => 'Manage Own Expenses', 'description' => 'Manage Limited Expenses that is created by own'],
            ['name' => 'view-expenses', 'module' => 'expenses', 'label' => 'View Expenses', 'description' => 'View Expenses'],
            ['name' => 'create-expenses', 'module' => 'expenses', 'label' => 'Create Expenses', 'description' => 'Can create expenses'],
            ['name' => 'edit-expenses', 'module' => 'expenses', 'label' => 'Edit Expenses', 'description' => 'Can edit expenses'],
            ['name' => 'delete-expenses', 'module' => 'expenses', 'label' => 'Delete Expenses', 'description' => 'Can delete expenses'],
            ['name' => 'approve-expenses', 'module' => 'expenses', 'label' => 'Approve Expenses', 'description' => 'Can approve expenses'],

            // Expense Categories
            ['name' => 'manage-expense-categories', 'module' => 'expense_categories', 'label' => 'Manage Expense Categories', 'description' => 'Can manage expense categories'],
            ['name' => 'manage-any-expense-categories', 'module' => 'expense_categories', 'label' => 'Manage All Expense Categories', 'description' => 'Manage Any Expense Categories'],
            ['name' => 'manage-own-expense-categories', 'module' => 'expense_categories', 'label' => 'Manage Own Expense Categories', 'description' => 'Manage Limited Expense Categories that is created by own'],
            ['name' => 'view-expense-categories', 'module' => 'expense_categories', 'label' => 'View Expense Categories', 'description' => 'View Expense Categories'],
            ['name' => 'create-expense-categories', 'module' => 'expense_categories', 'label' => 'Create Expense Categories', 'description' => 'Can create expense categories'],
            ['name' => 'edit-expense-categories', 'module' => 'expense_categories', 'label' => 'Edit Expense Categories', 'description' => 'Can edit expense categories'],
            ['name' => 'delete-expense-categories', 'module' => 'expense_categories', 'label' => 'Delete Expense Categories', 'description' => 'Can delete expense categories'],
            ['name' => 'toggle-status-expense-categories', 'module' => 'expense_categories', 'label' => 'Toggle Status Expense Categories', 'description' => 'Can toggle status of expense categories'],

            // Invoices
            ['name' => 'manage-invoices', 'module' => 'invoices', 'label' => 'Manage Invoices', 'description' => 'Can manage invoices'],
            ['name' => 'manage-any-invoices', 'module' => 'invoices', 'label' => 'Manage All Invoices', 'description' => 'Manage Any Invoices'],
            ['name' => 'manage-own-invoices', 'module' => 'invoices', 'label' => 'Manage Own Invoices', 'description' => 'Manage Limited Invoices that is created by own'],
            ['name' => 'view-invoices', 'module' => 'invoices', 'label' => 'View Invoices', 'description' => 'View Invoices'],
            ['name' => 'create-invoices', 'module' => 'invoices', 'label' => 'Create Invoices', 'description' => 'Can create invoices'],
            ['name' => 'edit-invoices', 'module' => 'invoices', 'label' => 'Edit Invoices', 'description' => 'Can edit invoices'],
            ['name' => 'delete-invoices', 'module' => 'invoices', 'label' => 'Delete Invoices', 'description' => 'Can delete invoices'],
            ['name' => 'send-invoices', 'module' => 'invoices', 'label' => 'Send Invoices', 'description' => 'Can send invoices to clients'],

            // Payments
            ['name' => 'manage-payments', 'module' => 'payments', 'label' => 'Manage Payments', 'description' => 'Can manage payments'],
            ['name' => 'manage-any-payments', 'module' => 'payments', 'label' => 'Manage All Payments', 'description' => 'Manage Any Payments'],
            ['name' => 'manage-own-payments', 'module' => 'payments', 'label' => 'Manage Own Payments', 'description' => 'Manage Limited Payments that is created by own'],
            ['name' => 'view-payments', 'module' => 'payments', 'label' => 'View Payments', 'description' => 'View Payments'],
            ['name' => 'create-payments', 'module' => 'payments', 'label' => 'Create Payments', 'description' => 'Can create payments'],
            ['name' => 'edit-payments', 'module' => 'payments', 'label' => 'Edit Payments', 'description' => 'Can edit payments'],
            ['name' => 'delete-payments', 'module' => 'payments', 'label' => 'Delete Payments', 'description' => 'Can delete payments'],

            // Task Management
            ['name' => 'manage-tasks', 'module' => 'tasks', 'label' => 'Manage Tasks', 'description' => 'Can manage tasks'],
            ['name' => 'manage-any-tasks', 'module' => 'tasks', 'label' => 'Manage All Tasks', 'description' => 'Manage Any Tasks'],
            ['name' => 'manage-own-tasks', 'module' => 'tasks', 'label' => 'Manage Own Tasks', 'description' => 'Manage Limited Tasks that is created by own'],
            ['name' => 'view-tasks', 'module' => 'tasks', 'label' => 'View Tasks', 'description' => 'View Tasks'],
            ['name' => 'create-tasks', 'module' => 'tasks', 'label' => 'Create Tasks', 'description' => 'Can create tasks'],
            ['name' => 'edit-tasks', 'module' => 'tasks', 'label' => 'Edit Tasks', 'description' => 'Can edit tasks'],
            ['name' => 'delete-tasks', 'module' => 'tasks', 'label' => 'Delete Tasks', 'description' => 'Can delete tasks'],
            ['name' => 'assign-tasks', 'module' => 'tasks', 'label' => 'Assign Tasks', 'description' => 'Can assign tasks to users'],
            ['name' => 'toggle-status-tasks', 'module' => 'tasks', 'label' => 'Toggle Status Tasks', 'description' => 'Can toggle status of tasks'],

            // Task Types
            ['name' => 'manage-task-types', 'module' => 'task_types', 'label' => 'Manage Task Types', 'description' => 'Can manage task types'],
            ['name' => 'manage-any-task-types', 'module' => 'task_types', 'label' => 'Manage All Task Types', 'description' => 'Manage Any Task Types'],
            ['name' => 'manage-own-task-types', 'module' => 'task_types', 'label' => 'Manage Own Task Types', 'description' => 'Manage Limited Task Types that is created by own'],
            ['name' => 'view-task-types', 'module' => 'task_types', 'label' => 'View Task Types', 'description' => 'View Task Types'],
            ['name' => 'create-task-types', 'module' => 'task_types', 'label' => 'Create Task Types', 'description' => 'Can create task types'],
            ['name' => 'edit-task-types', 'module' => 'task_types', 'label' => 'Edit Task Types', 'description' => 'Can edit task types'],
            ['name' => 'delete-task-types', 'module' => 'task_types', 'label' => 'Delete Task Types', 'description' => 'Can delete task types'],
            ['name' => 'toggle-status-task-types', 'module' => 'task_types', 'label' => 'Toggle Status Task Types', 'description' => 'Can toggle status of task types'],

            // Task Statuses
            ['name' => 'manage-task-statuses', 'module' => 'task_statuses', 'label' => 'Manage Task Statuses', 'description' => 'Can manage task statuses'],
            ['name' => 'manage-any-task-statuses', 'module' => 'task_statuses', 'label' => 'Manage All Task Statuses', 'description' => 'Manage Any Task Statuses'],
            ['name' => 'manage-own-task-statuses', 'module' => 'task_statuses', 'label' => 'Manage Own Task Statuses', 'description' => 'Manage Limited Task Statuses that is created by own'],
            ['name' => 'view-task-statuses', 'module' => 'task_statuses', 'label' => 'View Task Statuses', 'description' => 'View Task Statuses'],
            ['name' => 'create-task-statuses', 'module' => 'task_statuses', 'label' => 'Create Task Statuses', 'description' => 'Can create task statuses'],
            ['name' => 'edit-task-statuses', 'module' => 'task_statuses', 'label' => 'Edit Task Statuses', 'description' => 'Can edit task statuses'],
            ['name' => 'delete-task-statuses', 'module' => 'task_statuses', 'label' => 'Delete Task Statuses', 'description' => 'Can delete task statuses'],
            ['name' => 'toggle-status-task-statuses', 'module' => 'task_statuses', 'label' => 'Toggle Status Task Statuses', 'description' => 'Can toggle status of task statuses'],

            // Workflows
            ['name' => 'manage-workflows', 'module' => 'workflows', 'label' => 'Manage Workflows', 'description' => 'Can manage workflows'],
            ['name' => 'manage-any-workflows', 'module' => 'workflows', 'label' => 'Manage All Workflows', 'description' => 'Manage Any Workflows'],
            ['name' => 'manage-own-workflows', 'module' => 'workflows', 'label' => 'Manage Own Workflows', 'description' => 'Manage Limited Workflows that is created by own'],
            ['name' => 'view-workflows', 'module' => 'workflows', 'label' => 'View Workflows', 'description' => 'View Workflows'],
            ['name' => 'create-workflows', 'module' => 'workflows', 'label' => 'Create Workflows', 'description' => 'Can create workflows'],
            ['name' => 'edit-workflows', 'module' => 'workflows', 'label' => 'Edit Workflows', 'description' => 'Can edit workflows'],
            ['name' => 'delete-workflows', 'module' => 'workflows', 'label' => 'Delete Workflows', 'description' => 'Can delete workflows'],
            ['name' => 'toggle-status-workflows', 'module' => 'workflows', 'label' => 'Toggle Status Workflows', 'description' => 'Can toggle status of workflows'],

            // Task Dependencies






            // Task Comments
            ['name' => 'manage-task-comments', 'module' => 'task_comments', 'label' => 'Manage Task Comments', 'description' => 'Can manage task comments'],
            ['name' => 'manage-any-task-comments', 'module' => 'task_comments', 'label' => 'Manage All Task Comments', 'description' => 'Manage Any Task Comments'],
            ['name' => 'manage-own-task-comments', 'module' => 'task_comments', 'label' => 'Manage Own Task Comments', 'description' => 'Manage Limited Task Comments that is created by own'],
            ['name' => 'view-task-comments', 'module' => 'task_comments', 'label' => 'View Task Comments', 'description' => 'View Task Comments'],
            ['name' => 'create-task-comments', 'module' => 'task_comments', 'label' => 'Create Task Comments', 'description' => 'Can create task comments'],
            ['name' => 'edit-task-comments', 'module' => 'task_comments', 'label' => 'Edit Task Comments', 'description' => 'Can edit task comments'],
            ['name' => 'delete-task-comments', 'module' => 'task_comments', 'label' => 'Delete Task Comments', 'description' => 'Can delete task comments'],

            // Communication & Collaboration
            ['name' => 'manage-messages', 'module' => 'messages', 'label' => 'Manage Messages', 'description' => 'Can manage internal messages'],
            ['name' => 'manage-any-messages', 'module' => 'messages', 'label' => 'Manage All Messages', 'description' => 'Manage Any Messages'],
            ['name' => 'manage-own-messages', 'module' => 'messages', 'label' => 'Manage Own Messages', 'description' => 'Manage Limited Messages that is created by own'],
            ['name' => 'view-messages', 'module' => 'messages', 'label' => 'View Messages', 'description' => 'View Messages'],
            ['name' => 'send-messages', 'module' => 'messages', 'label' => 'Send Messages', 'description' => 'Can send messages'],
            ['name' => 'delete-messages', 'module' => 'messages', 'label' => 'Delete Messages', 'description' => 'Can delete messages'],

            // Calender
            ['name' => 'manage-calendar', 'module' => 'calendar', 'label' => 'Manage Calendar', 'description' => 'Can manage calendar'],
            ['name' => 'manage-any-calendar', 'module' => 'calendar', 'label' => 'Manage All Calendar', 'description' => 'Manage Any Calendar Events'],
            ['name' => 'manage-own-calendar', 'module' => 'calendar', 'label' => 'Manage Own Calendar', 'description' => 'Manage Own Calendar Events'],
            ['name' => 'view-calendar', 'module' => 'calendar', 'label' => 'View Calendar', 'description' => 'View Calendar'],

        ];

        // Add task permissions to company role permissions
        $taskPermissions = [
            'tasks',
            'task_types',
            'task_statuses'
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission['name'], 'guard_name' => 'web'],
                [
                    'module' => $permission['module'],
                    'label' => $permission['label'],
                    'description' => $permission['description'],
                ]
            );
        }
    }
}
