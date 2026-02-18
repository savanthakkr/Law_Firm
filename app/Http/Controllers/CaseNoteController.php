<?php

namespace App\Http\Controllers;

use App\Models\CaseNote;
use App\Models\CaseModel;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CaseNoteController extends Controller
{
    public function index(Request $request)
    {
        $query = CaseNote::query()
            ->with(['creator'])
            ->where('created_by', createdBy());

        // Handle search
        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                    ->orWhere('content', 'like', '%' . $request->search . '%')
                    ->orWhere('note_id', 'like', '%' . $request->search . '%');
            });
        }

        // Handle note type filter
        if ($request->has('note_type') && !empty($request->note_type) && $request->note_type !== 'all') {
            $query->where('note_type', $request->note_type);
        }

        // Handle priority filter
        if ($request->has('priority') && !empty($request->priority) && $request->priority !== 'all') {
            $query->where('priority', $request->priority);
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

        $caseNotes = $query->paginate($request->per_page ?? 10);
        $cases = CaseModel::where('created_by', createdBy())
            ->where('status', 'active')
            ->select('id', 'case_id', 'title')
            ->get();

        return Inertia::render('advocate/case-notes/index', [
            'caseNotes' => $caseNotes,
            'cases' => $cases,
            'filters' => $request->all(['search', 'note_type', 'priority', 'status', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'note_type' => 'required|in:general,meeting,research,strategy,client_communication,court_appearance',
            'priority' => 'required|in:low,medium,high,urgent',
            'is_private' => 'nullable',
            'note_date' => 'nullable|date',
            'tags' => 'nullable',
            'case_ids' => 'nullable|array',
            'status' => 'nullable|in:active,archived',
        ]);

        // Convert is_private to boolean
        $validated['is_private'] = filter_var($validated['is_private'] ?? false, FILTER_VALIDATE_BOOLEAN);

        // Convert tags string to array
        if (isset($validated['tags']) && is_string($validated['tags'])) {
            $validated['tags'] = array_filter(array_map('trim', explode(',', $validated['tags'])));
        } elseif (!isset($validated['tags']) || !is_array($validated['tags'])) {
            $validated['tags'] = [];
        }

        $validated['created_by'] = createdBy();
        $validated['status'] = $validated['status'] ?? 'active';
        $validated['is_private'] = $validated['is_private'] ?? false;

        CaseNote::create($validated);

        return redirect()->back()->with('success', 'Case note created successfully.');
    }

    public function update(Request $request, $noteId)
    {
        $note = CaseNote::where('id', $noteId)
            ->where('created_by', createdBy())
            ->first();

        if ($note) {
            try {
                $validated = $request->validate([
                    'title' => 'required|string|max:255',
                    'content' => 'required|string',
                    'note_type' => 'required|in:general,meeting,research,strategy,client_communication,court_appearance',
                    'priority' => 'required|in:low,medium,high,urgent',
                    'is_private' => 'nullable',
                    'note_date' => 'nullable|date',
                    'tags' => 'nullable',
                    'case_ids' => 'nullable|array',
                    'status' => 'nullable|in:active,archived',
                ]);

                // Convert is_private to boolean
                $validated['is_private'] = filter_var($validated['is_private'] ?? false, FILTER_VALIDATE_BOOLEAN);

                // Convert tags string to array
                if (isset($validated['tags']) && is_string($validated['tags'])) {
                    $validated['tags'] = array_filter(array_map('trim', explode(',', $validated['tags'])));
                } elseif (!isset($validated['tags']) || !is_array($validated['tags'])) {
                    $validated['tags'] = [];
                }

                $note->update($validated);

                return redirect()->back()->with('success', 'Case note updated successfully');
            } catch (\Exception $e) {
                return redirect()->back()->with('error', $e->getMessage() ?: 'Failed to update case note');
            }
        } else {
            return redirect()->back()->with('error', 'Case note not found.');
        }
    }

    public function destroy($noteId)
    {
        $note = CaseNote::where('id', $noteId)
            ->where('created_by', createdBy())
            ->first();

        if ($note) {
            try {
                $note->delete();
                return redirect()->back()->with('success', 'Case note deleted successfully');
            } catch (\Exception $e) {
                return redirect()->back()->with('error', $e->getMessage() ?: 'Failed to delete case note');
            }
        } else {
            return redirect()->back()->with('error', 'Case note not found.');
        }
    }
}
