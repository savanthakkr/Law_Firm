<?php

namespace Database\Seeders;

use App\Models\ClientType;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ClientTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        
        // Get company users
        $companyUsers = User::where('type', 'company')->get();
        
        foreach ($companyUsers as $companyUser) {
            // Create default client types for each company
            $clientTypes = [
                [
                    'name' => 'Individual',
                    'description' => 'Individual clients and personal customers',
                    'status' => 'active',
                ],
                [
                    'name' => 'Small Business',
                    'description' => 'Small business clients and startups',
                    'status' => 'active',
                ],
                [
                    'name' => 'Corporate',
                    'description' => 'Large corporate clients and enterprises',
                    'status' => 'active',
                ],
                [
                    'name' => 'Government',
                    'description' => 'Government agencies and public sector',
                    'status' => 'active',
                ],
                [
                    'name' => 'Non-Profit',
                    'description' => 'Non-profit organizations and charities',
                    'status' => 'active',
                ],
            ];
            
            foreach ($clientTypes as $clientTypeData) {
                // Check if client type already exists
                $exists = ClientType::where('name', $clientTypeData['name'])
                    ->where('created_by', $companyUser->id)
                    ->exists();
                    
                if (!$exists) {
                    ClientType::create([
                        'name' => $clientTypeData['name'],
                        'description' => $clientTypeData['description'],
                        'status' => $clientTypeData['status'],
                        'created_by' => $companyUser->id,
                    ]);
                }
            }
        }
    }
}