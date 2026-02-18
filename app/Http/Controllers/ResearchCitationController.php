<?php

namespace App\Http\Controllers;

use App\Models\ResearchCitation;
use App\Models\ResearchProject;
use App\Models\ResearchSource;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ResearchCitationController extends Controller
{
    public function index(Request $request)
    {
        $query = ResearchCitation::query()
            ->with(['researchProject', 'source', 'creator'])
            ->withPermissionCheck();

        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('citation_text', 'like', '%' . $request->search . '%')
                    ->orWhere('notes', 'like', '%' . $request->search . '%')
                    ->orWhere('page_number', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->has('research_project_id') && $request->research_project_id !== 'all') {
            $query->where('research_project_id', $request->research_project_id);
        }

        if ($request->has('citation_type') && $request->citation_type !== 'all') {
            $query->where('citation_type', $request->citation_type);
        }

        if ($request->has('source_id') && $request->source_id !== 'all') {
            $query->where('source_id', $request->source_id);
        }

        if ($request->has('sort_field') && !empty($request->sort_field)) {
            $query->orderBy($request->sort_field, $request->sort_direction ?? 'asc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $citations = $query->paginate($request->per_page ?? 10);

        $projects = ResearchProject::where('created_by', createdBy())
            ->get(['id', 'title']);

        $sources = ResearchSource::where('created_by', createdBy())
            ->where('status', 'active')
            ->get(['id', 'source_name']);

        return Inertia::render('legal-research/citations/index', [
            'citations' => $citations,
            'projects' => $projects,
            'sources' => $sources,
            'filters' => $request->all(['search', 'research_project_id', 'citation_type', 'source_id', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'research_project_id' => 'required|exists:research_projects,id',
            'citation_text' => 'required|string',
            'source_id' => 'nullable|exists:research_sources,id',
            'page_number' => 'nullable|string|max:255',
            'citation_type' => 'required|in:case,statute,article,book,website,other',
            'notes' => 'nullable|string',
        ]);

        $project = ResearchProject::where('id', $validated['research_project_id'])
            ->where('created_by', createdBy())
            ->first();

        if (!$project) {
            return redirect()->back()->with('error', 'Invalid research project selection.');
        }

        if ($validated['source_id']) {
            $source = ResearchSource::where('id', $validated['source_id'])
                ->where('created_by', createdBy())
                ->first();
            if (!$source) {
                return redirect()->back()->with('error', 'Invalid source selection.');
            }
        }

        $validated['created_by'] = createdBy();

        ResearchCitation::create($validated);

        return redirect()->back()->with('success', 'Research citation created successfully.');
    }

    public function update(Request $request, $citationId)
    {
        $citation = ResearchCitation::withPermissionCheck()
            ->where('id', $citationId)
            ->first();

        if (!$citation) {
            return redirect()->back()->with('error', 'Research citation not found.');
        }

        $validated = $request->validate([
            'research_project_id' => 'required|exists:research_projects,id',
            'citation_text' => 'required|string',
            'source_id' => 'nullable|exists:research_sources,id',
            'page_number' => 'nullable|string|max:255',
            'citation_type' => 'required|in:case,statute,article,book,website,other',
            'notes' => 'nullable|string',
        ]);

        $project = ResearchProject::where('id', $validated['research_project_id'])
            ->where('created_by', createdBy())
            ->first();

        if (!$project) {
            return redirect()->back()->with('error', 'Invalid research project selection.');
        }

        if ($validated['source_id']) {
            $source = ResearchSource::where('id', $validated['source_id'])
                ->where('created_by', createdBy())
                ->first();
            if (!$source) {
                return redirect()->back()->with('error', 'Invalid source selection.');
            }
        }

        $citation->update($validated);

        return redirect()->back()->with('success', 'Research citation updated successfully.');
    }

    public function destroy($citationId)
    {
        $citation = ResearchCitation::withPermissionCheck()
            ->where('id', $citationId)
            ->first();

        if (!$citation) {
            return redirect()->back()->with('error', 'Research citation not found.');
        }

        $citation->delete();

        return redirect()->back()->with('success', 'Research citation deleted successfully.');
    }
}