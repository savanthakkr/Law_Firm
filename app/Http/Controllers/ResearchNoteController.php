<?php

namespace App\Http\Controllers;

use App\Models\ResearchNote;
use App\Models\ResearchProject;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ResearchNoteController extends Controller
{
    public function index(Request $request)
    {
        $query = ResearchNote::query()
            ->with(['researchProject', 'creator'])
            ->withPermissionCheck();

        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                    ->orWhere('note_content', 'like', '%' . $request->search . '%')
                    ->orWhere('source_reference', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->has('research_project_id') && $request->research_project_id !== 'all') {
            $query->where('research_project_id', $request->research_project_id);
        }

        if ($request->has('is_private') && $request->is_private !== 'all') {
            $query->where('is_private', $request->is_private === '1');
        }

        if ($request->has('sort_field') && !empty($request->sort_field)) {
            $query->orderBy($request->sort_field, $request->sort_direction ?? 'asc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $notes = $query->paginate($request->per_page ?? 10);

        $projects = ResearchProject::where('created_by', createdBy())
            ->get(['id', 'title']);

        return Inertia::render('legal-research/notes/index', [
            'notes' => $notes,
            'projects' => $projects,
            'filters' => $request->all(['search', 'research_project_id', 'is_private', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'research_project_id' => 'required|exists:research_projects,id',
            'title' => 'required|string|max:255',
            'note_content' => 'required|string',
            'source_reference' => 'nullable|string',
            'tags' => 'nullable|array',
            'is_private' => 'nullable|boolean',
        ]);

        $project = ResearchProject::where('id', $validated['research_project_id'])
            ->where('created_by', createdBy())
            ->first();

        if (!$project) {
            return redirect()->back()->with('error', 'Invalid research project selection.');
        }

        $validated['created_by'] = createdBy();
        $validated['is_private'] = $validated['is_private'] ?? false;

        ResearchNote::create($validated);

        return redirect()->back()->with('success', 'Research note created successfully.');
    }

    public function update(Request $request, $noteId)
    {
        $note = ResearchNote::withPermissionCheck()
            ->where('id', $noteId)
            ->first();

        if (!$note) {
            return redirect()->back()->with('error', 'Research note not found.');
        }

        $validated = $request->validate([
            'research_project_id' => 'required|exists:research_projects,id',
            'title' => 'required|string|max:255',
            'note_content' => 'required|string',
            'source_reference' => 'nullable|string',
            'tags' => 'nullable|array',
            'is_private' => 'nullable|boolean',
        ]);

        $project = ResearchProject::where('id', $validated['research_project_id'])
            ->where('created_by', createdBy())
            ->first();

        if (!$project) {
            return redirect()->back()->with('error', 'Invalid research project selection.');
        }

        $note->update($validated);

        return redirect()->back()->with('success', 'Research note updated successfully.');
    }

    public function destroy($noteId)
    {
        $note = ResearchNote::withPermissionCheck()
            ->where('id', $noteId)
            ->first();

        if (!$note) {
            return redirect()->back()->with('error', 'Research note not found.');
        }

        $note->delete();

        return redirect()->back()->with('success', 'Research note deleted successfully.');
    }
}