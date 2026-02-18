<?php

namespace Database\Seeders;

use App\Models\AuditType;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AuditTypeSeeder extends Seeder
{
    public function run(): void
    {        
        $companyUsers = User::where('type', 'company')->get();
        
        foreach ($companyUsers as $companyUser) {
            // Create 2-3 audit types per company
            $auditTypeCount = rand(8, 10);
            $availableAuditTypes = [
                ['name' => 'Internal', 'description' => 'Internal audit conducted by organization staff', 'color' => '#10B981'],
                ['name' => 'External', 'description' => 'External audit conducted by third-party auditors', 'color' => '#3B82F6'],
                ['name' => 'Regulatory', 'description' => 'Regulatory compliance audit', 'color' => '#F59E0B'],
                ['name' => 'Compliance', 'description' => 'General compliance audit', 'color' => '#8B5CF6'],
                ['name' => 'Financial', 'description' => 'Financial audit and controls review', 'color' => '#EF4444'],
                ['name' => 'Operational', 'description' => 'Operational processes and procedures audit', 'color' => '#06B6D4'],
                ['name' => 'Quality', 'description' => 'Quality assurance and process improvement audit', 'color' => '#DC2626'],
                ['name' => 'IT Security', 'description' => 'Information technology security audit', 'color' => '#059669'],
                ['name' => 'Risk Management', 'description' => 'Risk management and assessment audit', 'color' => '#7C2D12'],
                ['name' => 'Performance', 'description' => 'Performance and efficiency audit', 'color' => '#1E40AF'],
                ['name' => 'Environmental', 'description' => 'Environmental compliance and sustainability audit', 'color' => '#16A34A'],
            ];
            
            // Randomly select audit types for this company
            $selectedTypes = collect($availableAuditTypes)->random($auditTypeCount);
            
            foreach ($selectedTypes as $type) {
                AuditType::firstOrCreate([
                    'name' => $type['name'],
                    'created_by' => $companyUser->id
                ], [
                    'description' => $type['description'],
                    'color' => $type['color'],
                    'status' => 'active',
                    'created_by' => $companyUser->id,
                ]);
            }
        }
    }
}