<?php

namespace App\Http\Controllers;

use App\Models\ResearchProject;
use App\Models\ResearchType;
use App\Models\CaseModel;
use App\Models\ResearchSource;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ResearchProjectController extends Controller
{
    public function index(Request $request)
    {
        $query = ResearchProject::withPermissionCheck()
            ->with(['case', 'creator', 'researchType']);

        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                    ->orWhere('research_id', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->has('research_type_id') && $request->research_type_id !== 'all') {
            $query->where('research_type_id', $request->research_type_id);
        }

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('priority') && $request->priority !== 'all') {
            $query->where('priority', $request->priority);
        }

        if ($request->has('case_id') && $request->case_id !== 'all') {
            $query->where('case_id', $request->case_id);
        }

        if ($request->has('sort_field') && !empty($request->sort_field)) {
            $query->orderBy($request->sort_field, $request->sort_direction ?? 'asc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $projects = $query->paginate($request->per_page ?? 10);

        $cases = CaseModel::withPermissionCheck()->where('status', 'active')->get(['id', 'title']);
        $researchTypes = ResearchType::withPermissionCheck()->where('status', 'active')->get(['id', 'name']);

        return Inertia::render('legal-research/projects/index', [
            'projects' => $projects,
            'cases' => $cases,
            'researchTypes' => $researchTypes,
            'filters' => $request->all(['search', 'research_type_id', 'status', 'priority', 'case_id', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'research_type_id' => 'required|exists:research_types,id',
            'case_id' => 'nullable|exists:cases,id',
            'priority' => 'required|in:low,medium,high,urgent',
            'due_date' => 'nullable|date|after:today',
            'status' => 'nullable|in:active,completed,on_hold,cancelled',
        ]);

        if ($validated['case_id']) {
            $case = CaseModel::where('id', $validated['case_id'])->where('created_by', createdBy())->first();
            if (!$case) {
                return redirect()->back()->with('error', 'Invalid case selection.');
            }
        }

        $researchType = ResearchType::where('id', $validated['research_type_id'])->where('created_by', createdBy())->first();
        if (!$researchType) {
            return redirect()->back()->with('error', 'Invalid research type selection.');
        }

        $validated['created_by'] = createdBy();
        $validated['status'] = $validated['status'] ?? 'active';

        ResearchProject::create($validated);

        return redirect()->back()->with('success', 'Research project created successfully.');
    }

    public function update(Request $request, $projectId)
    {
        $project = ResearchProject::withPermissionCheck()->where('id', $projectId)->first();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'research_type_id' => 'required|exists:research_types,id',
            'case_id' => 'nullable|exists:cases,id',
            'priority' => 'required|in:low,medium,high,urgent',
            'due_date' => 'nullable|date',
            'status' => 'nullable|in:active,completed,on_hold,cancelled',
        ]);

        if ($validated['case_id']) {
            $case = CaseModel::where('id', $validated['case_id'])->where('created_by', createdBy())->first();
            if (!$case) {
                return redirect()->back()->with('error', 'Invalid case selection.');
            }
        }

        $researchType = ResearchType::where('id', $validated['research_type_id'])->where('created_by', createdBy())->first();
        if (!$researchType) {
            return redirect()->back()->with('error', 'Invalid research type selection.');
        }

        $project->update($validated);

        return redirect()->back()->with('success', 'Research project updated successfully.');
    }

    public function destroy($projectId)
    {
        $project = ResearchProject::withPermissionCheck()->where('id', $projectId)->first();

        $project->delete();

        return redirect()->back()->with('success', 'Research project deleted successfully.');
    }

    public function toggleStatus($projectId)
    {
        $project = ResearchProject::withPermissionCheck()->where('id', $projectId)->first();

        $project->status = $project->status === 'active' ? 'completed' : 'active';
        $project->save();

        return redirect()->back()->with('success', 'Research project status updated successfully.');
    }

    public function show($projectId)
    {
        $project = ResearchProject::withPermissionCheck()
            ->with(['case', 'creator', 'researchType'])
            ->where('id', $projectId)
            ->first();

        $notes = $project->notes()->paginate(10, ['*'], 'notes_page');
        $citations = $project->citations()->with('source')->paginate(10, ['*'], 'citations_page');
        $sources = ResearchSource::withPermissionCheck()->where('status', 'active')->get(['id', 'source_name']);

        return Inertia::render('legal-research/projects/view', [
            'project' => $project,
            'notes' => $notes,
            'citations' => $citations,
            'sources' => $sources,
        ]);
    }
}