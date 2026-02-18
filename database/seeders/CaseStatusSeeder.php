<?php

namespace Database\Seeders;

use App\Models\CaseStatus;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CaseStatusSeeder extends Seeder
{
    public function run(): void
    {        
        $companyUsers = User::where('type', 'company')->get();
        
        foreach ($companyUsers as $companyUser) {
            // Create 2-3 case statuses per company
            $caseStatusCount = rand(8, 10);
            $availableCaseStatuses = [
                ['name' => 'New', 'description' => 'Newly created case', 'color' => '#6B7280', 'is_default' => true, 'is_closed' => false],
                ['name' => 'In Progress', 'description' => 'Case is being worked on', 'color' => '#3B82F6', 'is_default' => false, 'is_closed' => false],
                ['name' => 'Under Review', 'description' => 'Case under review', 'color' => '#F59E0B', 'is_default' => false, 'is_closed' => false],
                ['name' => 'On Hold', 'description' => 'Case temporarily paused', 'color' => '#EF4444', 'is_default' => false, 'is_closed' => false],
                ['name' => 'Completed', 'description' => 'Case successfully completed', 'color' => '#10B981', 'is_default' => false, 'is_closed' => true],
                ['name' => 'Closed', 'description' => 'Case closed', 'color' => '#6B7280', 'is_default' => false, 'is_closed' => true],
                ['name' => 'Pending', 'description' => 'Case pending further action', 'color' => '#8B5CF6', 'is_default' => false, 'is_closed' => false],
                ['name' => 'Settled', 'description' => 'Case settled out of court', 'color' => '#059669', 'is_default' => false, 'is_closed' => true],
                ['name' => 'Dismissed', 'description' => 'Case dismissed by court', 'color' => '#DC2626', 'is_default' => false, 'is_closed' => true],
                ['name' => 'Appealed', 'description' => 'Case under appeal', 'color' => '#F97316', 'is_default' => false, 'is_closed' => false],
                ['name' => 'Withdrawn', 'description' => 'Case withdrawn by client', 'color' => '#84CC16', 'is_default' => false, 'is_closed' => true],
            ];
            
            // Randomly select case statuses for this company
            $selectedStatuses = collect($availableCaseStatuses)->random($caseStatusCount);
            
            foreach ($selectedStatuses as $index => $caseStatusData) {
                CaseStatus::firstOrCreate(
                    ['name' => $caseStatusData['name'], 'created_by' => $companyUser->id],
                    [
                        'description' => $caseStatusData['description'],
                        'color' => $caseStatusData['color'],
                        'is_default' => $index === 0, // First status is default for this company
                        'is_closed' => $caseStatusData['is_closed'],
                        'status' => 'active',
                        'created_by' => $companyUser->id
                    ]
                );
            }
        }
    }
}