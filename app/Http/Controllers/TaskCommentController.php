<?php

namespace App\Http\Controllers;

use App\Models\TaskComment;
use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TaskCommentController extends BaseController
{
    public function index(Request $request)
    {
        $query = TaskComment::withPermissionCheck()
            ->with(['task', 'creator'])
            ->where('created_by', createdBy());

        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('comment_text', 'like', '%' . $request->search . '%')
                  ->orWhereHas('task', function ($taskQuery) use ($request) {
                      $taskQuery->where('title', 'like', '%' . $request->search . '%');
                  });
            });
        }

        if ($request->has('task_id') && $request->task_id !== 'all') {
            $query->where('task_id', $request->task_id);
        }

        if ($request->has('is_internal') && $request->is_internal !== 'all') {
            $query->where('is_internal', $request->is_internal === 'true');
        }

        if ($request->has('sort_field') && !empty($request->sort_field)) {
            $query->orderBy($request->sort_field, $request->sort_direction ?? 'asc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $comments = $query->paginate($request->per_page ?? 10);

        $tasks = Task::where('created_by', createdBy())
            ->get(['id', 'task_id', 'title']);

        return Inertia::render('tasks/task-comments/index', [
            'comments' => $comments,
            'tasks' => $tasks,
            'filters' => $request->all(['search', 'task_id', 'is_internal', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'task_id' => 'required|exists:tasks,id',
            'comment_text' => 'required|string',
            'is_internal' => 'nullable|boolean',
        ]);

        $validated['created_by'] = createdBy();
        $validated['is_internal'] = $validated['is_internal'] ?? false;

        // Validate that task belongs to the current user's company
        $task = Task::where('id', $validated['task_id'])
            ->where('created_by', createdBy())
            ->first();

        if (!$task) {
            return redirect()->back()->with('error', 'Invalid task selected.');
        }

        TaskComment::create($validated);

        return redirect()->back()->with('success', 'Comment created successfully.');
    }

    public function update(Request $request, $commentId)
    {
        $comment = TaskComment::where('id', $commentId)
            ->where('created_by', createdBy())
            ->first();

        if (!$comment) {
            return redirect()->back()->with('error', 'Comment not found.');
        }

        $validated = $request->validate([
            'task_id' => 'required|exists:tasks,id',
            'comment_text' => 'required|string',
            'is_internal' => 'required|boolean',
        ]);

        // Validate that task belongs to the current user's company
        $task = Task::where('id', $validated['task_id'])
            ->where('created_by', createdBy())
            ->first();

        if (!$task) {
            return redirect()->back()->with('error', 'Invalid task selected.');
        }

        $comment->update($validated);

        return redirect()->back()->with('success', 'Comment updated successfully.');
    }

    public function destroy($commentId)
    {
        $comment = TaskComment::where('id', $commentId)
            ->where('created_by', createdBy())
            ->first();

        if (!$comment) {
            return redirect()->back()->with('error', 'Comment not found.');
        }

        try {
            $comment->delete();
            return redirect()->back()->with('success', 'Comment deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete comment.');
        }
    }
}