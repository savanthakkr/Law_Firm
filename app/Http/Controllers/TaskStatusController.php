<?php

namespace App\Http\Controllers;

use App\Models\TaskStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TaskStatusController extends BaseController
{
    public function index(Request $request)
    {
        $query = TaskStatus::withPermissionCheck()
            ->with(['creator'])
            ->where('created_by', createdBy());

        // Handle search
        if ($request->has('search') && !empty($request->search)) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Handle status filter
        if ($request->has('status') && !empty($request->status) && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Handle sorting
        if ($request->has('sort_field') && !empty($request->sort_field)) {
            $query->orderBy($request->sort_field, $request->sort_direction ?? 'asc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $taskStatuses = $query->paginate($request->per_page ?? 10);

        return Inertia::render('tasks/task-statuses/index', [
            'taskStatuses' => $taskStatuses,
            'filters' => $request->all(['search', 'status', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'required|string|size:7|regex:/^#[0-9A-Fa-f]{6}$/',
            'is_completed' => 'nullable|boolean',
            'status' => 'nullable|in:active,inactive',
        ]);

        $validated['created_by'] = createdBy();
        $validated['status'] = $validated['status'] ?? 'active';
        $validated['is_completed'] = $validated['is_completed'] ?? false;

        // Check if task status with same name already exists for this company
        $exists = TaskStatus::where('name', $validated['name'])
            ->where('created_by', createdBy())
            ->exists();

        if ($exists) {
            return redirect()->back()->with('error', 'Task status with this name already exists.');
        }

        TaskStatus::create($validated);

        return redirect()->back()->with('success', 'Task status created successfully.');
    }

    public function update(Request $request, $taskStatusId)
    {
        $taskStatus = TaskStatus::where('id', $taskStatusId)
            ->where('created_by', createdBy())
            ->first();

        if (!$taskStatus) {
            return redirect()->back()->with('error', 'Task status not found.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'required|string|size:7|regex:/^#[0-9A-Fa-f]{6}$/',
            'is_completed' => 'required|boolean',
            'status' => 'required|in:active,inactive',
        ]);

        // Check if task status with same name already exists for this company (excluding current)
        $exists = TaskStatus::where('name', $validated['name'])
            ->where('created_by', createdBy())
            ->where('id', '!=', $taskStatusId)
            ->exists();

        if ($exists) {
            return redirect()->back()->with('error', 'Task status with this name already exists.');
        }

        $taskStatus->update($validated);

        return redirect()->back()->with('success', 'Task status updated successfully.');
    }

    public function destroy($taskStatusId)
    {
        $taskStatus = TaskStatus::where('id', $taskStatusId)
            ->where('created_by', createdBy())
            ->first();

        if (!$taskStatus) {
            return redirect()->back()->with('error', 'Task status not found.');
        }

        try {
            $taskStatus->delete();
            return redirect()->back()->with('success', 'Task status deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete task status.');
        }
    }

    public function toggleStatus($taskStatusId)
    {
        $taskStatus = TaskStatus::where('id', $taskStatusId)
            ->where('created_by', createdBy())
            ->first();

        if (!$taskStatus) {
            return redirect()->back()->with('error', 'Task status not found.');
        }

        try {
            $taskStatus->status = $taskStatus->status === 'active' ? 'inactive' : 'active';
            $taskStatus->save();

            return redirect()->back()->with('success', 'Task status updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update task status.');
        }
    }
}