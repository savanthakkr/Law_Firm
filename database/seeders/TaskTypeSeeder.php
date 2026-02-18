<?php

namespace Database\Seeders;

use App\Models\TaskType;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TaskTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get company users
        $companyUsers = User::where('type', 'company')->get();
        
        foreach ($companyUsers as $companyUser) {
            // Create 2-3 task types per company
            $taskTypeCount = rand(8, 10);
            $availableTaskTypes = [
                [
                    'name' => 'Research',
                    'description' => 'Legal research and case law analysis',
                    'color' => '#3B82F6',
                    'default_duration' => 120, // 2 hours
                    'status' => 'active',
                ],
                [
                    'name' => 'Filing',
                    'description' => 'Court filing and document submission',
                    'color' => '#EF4444',
                    'default_duration' => 60, // 1 hour
                    'status' => 'active',
                ],
                [
                    'name' => 'Meeting',
                    'description' => 'Client meetings and consultations',
                    'color' => '#10B981',
                    'default_duration' => 90, // 1.5 hours
                    'status' => 'active',
                ],
                [
                    'name' => 'Review',
                    'description' => 'Document and contract review',
                    'color' => '#F59E0B',
                    'default_duration' => 180, // 3 hours
                    'status' => 'active',
                ],
                [
                    'name' => 'Drafting',
                    'description' => 'Legal document drafting',
                    'color' => '#8B5CF6',
                    'default_duration' => 240, // 4 hours
                    'status' => 'active',
                ],
                [
                    'name' => 'Court Appearance',
                    'description' => 'Court hearings and appearances',
                    'color' => '#EC4899',
                    'default_duration' => 180, // 3 hours
                    'status' => 'active',
                ],
                [
                    'name' => 'Investigation',
                    'description' => 'Case investigation and fact gathering',
                    'color' => '#06B6D4',
                    'default_duration' => 300, // 5 hours
                    'status' => 'active',
                ],
                [
                    'name' => 'Negotiation',
                    'description' => 'Settlement negotiations and discussions',
                    'color' => '#84CC16',
                    'default_duration' => 150, // 2.5 hours
                    'status' => 'active',
                ],
                [
                    'name' => 'Administrative',
                    'description' => 'Administrative tasks and case management',
                    'color' => '#6B7280',
                    'default_duration' => 60, // 1 hour
                    'status' => 'active',
                ],
                [
                    'name' => 'Discovery',
                    'description' => 'Discovery process and evidence collection',
                    'color' => '#F97316',
                    'default_duration' => 200, // 3.3 hours
                    'status' => 'active',
                ],
            ];
            
            // Randomly select task types for this company
            $selectedTypes = collect($availableTaskTypes)->random($taskTypeCount);
            
            foreach ($selectedTypes as $taskTypeData) {
                TaskType::firstOrCreate([
                    'name' => $taskTypeData['name'],
                    'created_by' => $companyUser->id
                ], [
                    'description' => $taskTypeData['description'],
                    'color' => $taskTypeData['color'],
                    'default_duration' => $taskTypeData['default_duration'],
                    'status' => $taskTypeData['status'],
                    'created_by' => $companyUser->id,
                ]);
            }
        }
    }
}