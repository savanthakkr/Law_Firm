<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\ClientType;
use App\Models\User;
use App\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ClientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        // Get company users
        $companyUsers = User::where('type', 'company')->get();

        foreach ($companyUsers as $companyUser) {
            // Create client role for this company
            $clientRole = Role::firstOrCreate([
                'name' => 'client',
                'guard_name' => 'web',
                'created_by' => $companyUser->id
            ], [
                'label' => 'Client',
                'description' => 'Client with limited access to their cases and documents'
            ]);

            $clientRole->syncPermissions([
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

                // Case Notes
                'manage-case-notes',
                'view-case-notes',

                // Case Timelines
                'manage-case-timelines',
                'view-case-timelines',

                // Expenses
                'manage-expenses',
                'view-expenses',

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
                'create-payments',

                // Time Entries
                'manage-time-entries',
                'view-time-entries',

                // Knowledge Articles
                'manage-knowledge-articles',
                'view-knowledge-articles',

                // Legal Precedents
                'manage-legal-precedents',
                'view-legal-precedents'
            ]);

            // Get client types for this company
            $clientTypes = ClientType::where('created_by', $companyUser->id)->get();

            // Create default client types if none exist
            if ($clientTypes->count() === 0) {
                $defaultTypes = [
                    ['name' => 'Individual', 'description' => 'Individual clients'],
                    ['name' => 'Corporate', 'description' => 'Corporate clients']
                ];

                foreach ($defaultTypes as $typeData) {
                    ClientType::create([
                        'name' => $typeData['name'],
                        'description' => $typeData['description'],
                        'status' => 'active',
                        'created_by' => $companyUser->id
                    ]);
                }

                $clientTypes = ClientType::where('created_by', $companyUser->id)->get();
            }

            if ($clientTypes->count() > 0) {
                // Create at least 1 client for each company
                $clientData = [
                    'name' => 'John Smith',
                    'email' => 'client' . $companyUser->id . '@company.com',
                    'phone' => '+1-555-0101',
                    'address' => '123 Main St, New York, NY 10001',
                    'client_type_id' => $clientTypes->first()->id,
                    'status' => 'active',
                    'date_of_birth' => '1985-06-15',
                    'referral_source' => 'Website',
                    'notes' => 'Default client for company',
                ];

                // Create client record
                $client = Client::firstOrCreate([
                    'email' => $clientData['email'],
                    'created_by' => $companyUser->id
                ], [
                    ...$clientData,
                    'created_by' => $companyUser->id,
                ]);

                // Create client user account
                $clientUser = User::firstOrCreate([
                    'email' => $clientData['email'],
                    'created_by' => $companyUser->id
                ], [
                    'name' => $clientData['name'],
                    'password' => Hash::make('password'),
                    'type' => 'client',
                    'lang' => $companyUser->lang ?? 'en',
                    'status' => 'active',
                    'referral_code' => 0
                ]);

                $clientUser->roles()->sync([$clientRole->id]);
            }
        }
    }
}
