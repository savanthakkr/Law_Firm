<?php

namespace App\Http\Controllers;

use App\Models\TaskType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TaskTypeController extends BaseController
{
    public function index(Request $request)
    {
        $query = TaskType::withPermissionCheck()
            ->with(['creator'])
            ->where('created_by', createdBy());

        // Handle search
        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        // Handle status filter
        if ($request->has('status') && !empty($request->status) && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Handle sorting
        if ($request->has('sort_field') && !empty($request->sort_field)) {
            $query->orderBy($request->sort_field, $request->sort_direction ?? 'asc');
        } else {
            $query->orderBy('name', 'asc');
        }

        $taskTypes = $query->paginate($request->per_page ?? 10);

        return Inertia::render('tasks/task-types/index', [
            'taskTypes' => $taskTypes,
            'filters' => $request->all(['search', 'status', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'required|string|size:7|regex:/^#[0-9A-Fa-f]{6}$/',
            'default_duration' => 'nullable|integer|min:1',
            'status' => 'nullable|in:active,inactive',
        ]);

        $validated['created_by'] = createdBy();
        $validated['status'] = $validated['status'] ?? 'active';

        // Check if task type with same name already exists for this company
        $exists = TaskType::where('name', $validated['name'])
            ->where('created_by', createdBy())
            ->exists();

        if ($exists) {
            return redirect()->back()->with('error', 'Task type with this name already exists.');
        }

        TaskType::create($validated);

        return redirect()->back()->with('success', 'Task type created successfully.');
    }

    public function update(Request $request, $taskTypeId)
    {
        $taskType = TaskType::where('id', $taskTypeId)
            ->where('created_by', createdBy())
            ->first();

        if (!$taskType) {
            return redirect()->back()->with('error', 'Task type not found.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'required|string|size:7|regex:/^#[0-9A-Fa-f]{6}$/',
            'default_duration' => 'nullable|integer|min:1',
            'status' => 'required|in:active,inactive',
        ]);

        // Check if task type with same name already exists for this company (excluding current)
        $exists = TaskType::where('name', $validated['name'])
            ->where('created_by', createdBy())
            ->where('id', '!=', $taskTypeId)
            ->exists();

        if ($exists) {
            return redirect()->back()->with('error', 'Task type with this name already exists.');
        }

        $taskType->update($validated);

        return redirect()->back()->with('success', 'Task type updated successfully.');
    }

    public function destroy($taskTypeId)
    {
        $taskType = TaskType::where('id', $taskTypeId)
            ->where('created_by', createdBy())
            ->first();

        if (!$taskType) {
            return redirect()->back()->with('error', 'Task type not found.');
        }

        try {
            $taskType->delete();
            return redirect()->back()->with('success', 'Task type deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete task type.');
        }
    }

    public function toggleStatus($taskTypeId)
    {
        $taskType = TaskType::where('id', $taskTypeId)
            ->where('created_by', createdBy())
            ->first();

        if (!$taskType) {
            return redirect()->back()->with('error', 'Task type not found.');
        }

        try {
            $taskType->status = $taskType->status === 'active' ? 'inactive' : 'active';
            $taskType->save();

            return redirect()->back()->with('success', 'Task type status updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update task type status.');
        }
    }
}