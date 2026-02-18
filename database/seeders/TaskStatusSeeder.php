<?php

namespace Database\Seeders;

use App\Models\TaskStatus;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TaskStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get company users
        $companyUsers = User::where('type', 'company')->get();
        
        foreach ($companyUsers as $companyUser) {
            // Create 2-3 task statuses per company
            $taskStatusCount = rand(8, 10);
            $availableTaskStatuses = [
                [
                    'name' => 'Not Started',
                    'color' => '#6B7280',
                    'is_completed' => false,
                    'status' => 'active',
                ],
                [
                    'name' => 'In Progress',
                    'color' => '#3B82F6',
                    'is_completed' => false,
                    'status' => 'active',
                ],
                [
                    'name' => 'Under Review',
                    'color' => '#F59E0B',
                    'is_completed' => false,
                    'status' => 'active',
                ],
                [
                    'name' => 'On Hold',
                    'color' => '#EF4444',
                    'is_completed' => false,
                    'status' => 'active',
                ],
                [
                    'name' => 'Completed',
                    'color' => '#10B981',
                    'is_completed' => true,
                    'status' => 'active',
                ],
                [
                    'name' => 'Cancelled',
                    'color' => '#DC2626',
                    'is_completed' => false,
                    'status' => 'active',
                ],
                [
                    'name' => 'Pending Approval',
                    'color' => '#8B5CF6',
                    'is_completed' => false,
                    'status' => 'active',
                ],
                [
                    'name' => 'Deferred',
                    'color' => '#F97316',
                    'is_completed' => false,
                    'status' => 'active',
                ],
                [
                    'name' => 'Blocked',
                    'color' => '#EC4899',
                    'is_completed' => false,
                    'status' => 'active',
                ],
                [
                    'name' => 'Archived',
                    'color' => '#6B7280',
                    'is_completed' => true,
                    'status' => 'active',
                ],
            ];
            
            // Randomly select task statuses for this company
            $selectedStatuses = collect($availableTaskStatuses)->random($taskStatusCount);
            
            foreach ($selectedStatuses as $taskStatusData) {
                TaskStatus::firstOrCreate([
                    'name' => $taskStatusData['name'],
                    'created_by' => $companyUser->id
                ], [
                    'color' => $taskStatusData['color'],
                    'is_completed' => $taskStatusData['is_completed'],
                    'status' => $taskStatusData['status'],
                    'created_by' => $companyUser->id,
                ]);
            }
        }
    }
}