<?php

namespace Database\Seeders;

use App\Models\Task;
use App\Models\TaskType;
use App\Models\TaskStatus;
use App\Models\User;
use App\Models\CaseModel;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get company users
        $companyUsers = User::where('type', 'company')->get();
        
        foreach ($companyUsers as $companyUser) {
            // Get task types and statuses for this company
            $taskTypes = TaskType::where('created_by', $companyUser->id)->get();
            $taskStatuses = TaskStatus::where('created_by', $companyUser->id)->get();
            $cases = CaseModel::where('created_by', $companyUser->id)
                ->whereNotNull('client_id')
                ->get();
            $users = User::where('created_by', $companyUser->id)->get();
            
            if ($taskTypes->count() > 0 && $taskStatuses->count() > 0) {
                // Create 2-3 tasks per company
                $taskCount = rand(8, 10);
                $taskTitles = [
                    'Research case precedents for client matter',
                    'Draft motion for summary judgment',
                    'Client consultation meeting',
                    'Review contract amendments',
                    'File discovery motions',
                    'Prepare court filing documents',
                    'Conduct legal analysis',
                    'Schedule deposition hearing'
                ];
                
                $descriptions = [
                    'Conduct comprehensive legal research on similar cases and precedents',
                    'Prepare and draft motion based on research findings',
                    'Schedule and conduct client meeting to discuss case strategy',
                    'Review and analyze proposed amendments from opposing counsel',
                    'Prepare and file discovery motions with the court',
                    'Prepare necessary court filing documents and submissions',
                    'Conduct detailed legal analysis for case preparation',
                    'Schedule and coordinate deposition hearing with all parties'
                ];
                
                $priorities = ['low', 'medium', 'high', 'critical'];
                $statuses = ['not_started', 'in_progress', 'completed', 'on_hold'];
                
                for ($i = 1; $i <= $taskCount; $i++) {
                    $dueDate = rand(1, 10) > 5 ? now()->addDays(rand(1, 30)) : now()->subDays(rand(1, 15));
                    $taskType = $taskTypes->random();
                    $taskStatus = $taskStatuses->random();
                    
                    $taskData = [
                        'task_id' => null, // Auto-generated
                        'title' => $taskTitles[($companyUser->id + $i - 1) % count($taskTitles)],
                        'description' => $descriptions[($companyUser->id + $i - 1) % count($descriptions)] . ' for ' . $companyUser->name . '.',
                        'priority' => $priorities[rand(0, count($priorities) - 1)],
                        'status' => $statuses[rand(0, count($statuses) - 1)],
                        'due_date' => $dueDate,
                        'estimated_duration' => $taskType->default_duration ?? rand(60, 300),
                        'case_id' => $cases->count() > 0 ? $cases->random()->id : null,
                        'assigned_to' => $users->count() > 0 ? $users->random()->id : null,
                        'task_type_id' => $taskType->id,
                        'task_status_id' => $taskStatus->id,
                        'notes' => 'Task #' . $i . ' for ' . $companyUser->name . '. Important legal work requiring attention.',
                        'created_by' => $companyUser->id,
                    ];
                    
                    Task::firstOrCreate([
                        'title' => $taskData['title'],
                        'created_by' => $companyUser->id
                    ], $taskData);
                }
            }
        }
    }
}