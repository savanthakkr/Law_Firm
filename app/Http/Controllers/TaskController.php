<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskType;
use App\Models\TaskStatus;
use App\Models\User;
use App\Models\CaseModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TaskController extends BaseController
{
    public function index(Request $request)
    {
        $query = Task::withPermissionCheck()
            ->with(['taskType', 'taskStatus', 'assignedUser', 'case', 'creator']);

        // Handle search
        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%')
                    ->orWhere('task_id', 'like', '%' . $request->search . '%');
            });
        }

        // Handle task type filter
        if ($request->has('task_type_id') && !empty($request->task_type_id) && $request->task_type_id !== 'all') {
            $query->where('task_type_id', $request->task_type_id);
        }

        // Handle status filter
        if ($request->has('status') && !empty($request->status) && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Handle priority filter
        if ($request->has('priority') && !empty($request->priority) && $request->priority !== 'all') {
            $query->where('priority', $request->priority);
        }

        // Handle assigned user filter
        if ($request->has('assigned_to') && !empty($request->assigned_to) && $request->assigned_to !== 'all') {
            $query->where('assigned_to', $request->assigned_to);
        }

        // Handle sorting
        if ($request->has('sort_field') && !empty($request->sort_field)) {
            $query->orderBy($request->sort_field, $request->sort_direction ?? 'asc');
        } else {
            $query->orderBy('due_date', 'asc');
        }

        $tasks = $query->paginate($request->per_page ?? 10);

        // Get filter options
        $taskTypes = TaskType::where('created_by', createdBy())
            ->where('status', 'active')
            ->get(['id', 'name']);

        $users = User::where('created_by', createdBy())
            ->whereDoesntHave('roles', function ($q) {
                $q->where('name', 'client');
            })
            ->orWhere('id', createdBy())
            ->get(['id', 'name']);

        $cases = CaseModel::where('created_by', createdBy())
            ->get(['id', 'case_id', 'title']);

        $taskStatuses = TaskStatus::where('created_by', createdBy())
            ->where('status', 'active')
            ->get(['id', 'name']);

        return Inertia::render('tasks/index', [
            'tasks' => $tasks,
            'taskTypes' => $taskTypes,
            'users' => $users,
            'cases' => $cases,
            'taskStatuses' => $taskStatuses,
            'filters' => $request->all(['search', 'task_type_id', 'status', 'priority', 'assigned_to', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'required|in:critical,high,medium,low',
            'status' => 'nullable|in:not_started,in_progress,completed,on_hold',
            'due_date' => 'nullable|date',
            'estimated_duration' => 'nullable|integer|min:1',
            'case_id' => 'nullable|exists:cases,id',
            'assigned_to' => 'nullable|exists:users,id',
            'task_type_id' => 'nullable|exists:task_types,id',
            'task_status_id' => 'nullable|exists:task_statuses,id',
            'notes' => 'nullable|string',
        ]);

        $validated['created_by'] = createdBy();
        $validated['status'] = $validated['status'] ?? 'not_started';

        // Validate that related records belong to the current user's company
        if (!empty($validated['case_id'])) {
            $case = CaseModel::where('id', $validated['case_id'])
                ->where('created_by', createdBy())
                ->first();
            if (!$case) {
                return redirect()->back()->with('error', 'Invalid case selected.');
            }
        }

        if (!empty($validated['assigned_to'])) {
            $user = User::where('id', $validated['assigned_to'])
                ->where(function ($q) {
                    $q->where('created_by', createdBy())
                        ->orWhere('id', createdBy());
                })
                ->first();
            if (!$user) {
                return redirect()->back()->with('error', 'Invalid user selected.');
            }
        }

        if (!empty($validated['task_type_id'])) {
            $taskType = TaskType::where('id', $validated['task_type_id'])
                ->where('created_by', createdBy())
                ->first();
            if (!$taskType) {
                return redirect()->back()->with('error', 'Invalid task type selected.');
            }
        }

        if (!empty($validated['task_status_id'])) {
            $taskStatus = TaskStatus::where('id', $validated['task_status_id'])
                ->where('created_by', createdBy())
                ->first();
            if (!$taskStatus) {
                return redirect()->back()->with('error', 'Invalid task status selected.');
            }
        }

        Task::create($validated);

        return redirect()->back()->with('success', 'Task created successfully.');
    }

    public function update(Request $request, $taskId)
    {
        $task = Task::where('id', $taskId)
            ->where('created_by', createdBy())
            ->first();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'required|in:critical,high,medium,low',
            'status' => 'required|in:not_started,in_progress,completed,on_hold',
            'due_date' => 'nullable|date',
            'estimated_duration' => 'nullable|integer|min:1',
            'case_id' => 'nullable|exists:cases,id',
            'assigned_to' => 'nullable|exists:users,id',
            'task_type_id' => 'nullable|exists:task_types,id',
            'task_status_id' => 'nullable|exists:task_statuses,id',
            'notes' => 'nullable|string',
        ]);

        // Validate that related records belong to the current user's company
        if (!empty($validated['case_id'])) {
            $case = CaseModel::where('id', $validated['case_id'])
                ->where('created_by', createdBy())
                ->first();
            if (!$case) {
                return redirect()->back()->with('error', 'Invalid case selected.');
            }
        }

        if (!empty($validated['assigned_to'])) {
            $user = User::where('id', $validated['assigned_to'])
                ->where(function ($q) {
                    $q->where('created_by', createdBy())
                        ->orWhere('id', createdBy());
                })
                ->first();
            if (!$user) {
                return redirect()->back()->with('error', 'Invalid user selected.');
            }
        }

        if (!empty($validated['task_type_id'])) {
            $taskType = TaskType::where('id', $validated['task_type_id'])
                ->where('created_by', createdBy())
                ->first();
            if (!$taskType) {
                return redirect()->back()->with('error', 'Invalid task type selected.');
            }
        }

        if (!empty($validated['task_status_id'])) {
            $taskStatus = TaskStatus::where('id', $validated['task_status_id'])
                ->where('created_by', createdBy())
                ->first();
            if (!$taskStatus) {
                return redirect()->back()->with('error', 'Invalid task status selected.');
            }
        }

        $task->update($validated);

        return redirect()->back()->with('success', 'Task updated successfully.');
    }

    public function show($taskId)
    {
        $task = Task::withPermissionCheck()->with(['taskType', 'taskStatus', 'assignedUser', 'case', 'creator'])
            ->where('id', $taskId)
            ->first();

        return Inertia::render('tasks/show', [
            'task' => $task,
        ]);
    }

    public function destroy($taskId)
    {
        $task = Task::where('id', $taskId)
            ->where('created_by', createdBy())
            ->first();

        try {
            $task->delete();
            return redirect()->back()->with('success', 'Task deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete task.');
        }
    }

    public function toggleStatus($taskId)
    {
        $task = Task::where('id', $taskId)
            ->where('created_by', createdBy())
            ->first();

        try {
            $newStatus = $task->status === 'completed' ? 'not_started' : 'completed';
            $task->status = $newStatus;
            $task->save();

            return redirect()->back()->with('success', 'Task status updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update task status.');
        }
    }

    public function getCaseUsers($caseId)
    {
        $case = CaseModel::where('id', $caseId)
            ->where('created_by', createdBy())
            ->with('teamMembers.user')
            ->first();

        if (!$case) {
            return response()->json(['users' => []]);
        }

        $users = $case->teamMembers->map(function ($teamMember) {
            return [
                'value' => $teamMember->user->id,
                'label' => $teamMember->user->name
            ];
        });

        return response()->json($users);
    }
}
