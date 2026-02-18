<?php

namespace App\Http\Controllers;

use App\Models\ResearchSource;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ResearchSourceController extends Controller
{
    public function index(Request $request)
    {
        $query = ResearchSource::withPermissionCheck()
            ->with(['creator'])
            ->where('created_by', createdBy());

        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('source_name', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%')
                    ->orWhere('url', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->has('source_type') && $request->source_type !== 'all') {
            $query->where('source_type', $request->source_type);
        }

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('sort_field') && !empty($request->sort_field)) {
            $query->orderBy($request->sort_field, $request->sort_direction ?? 'asc');
        } else {
            $query->orderBy('source_name', 'asc');
        }

        $sources = $query->paginate($request->per_page ?? 10);

        return Inertia::render('legal-research/sources/index', [
            'sources' => $sources,
            'filters' => $request->all(['search', 'source_type', 'status', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'source_name' => 'required|string|max:255',
            'source_type' => 'required|in:database,case_law,statutory,regulatory,secondary,custom',
            'description' => 'nullable|string',
            'url' => 'nullable|url',
            'access_info' => 'nullable|string',
            'credentials' => 'nullable|array',
            'status' => 'nullable|in:active,inactive',
        ]);

        $validated['created_by'] = createdBy();
        $validated['status'] = $validated['status'] ?? 'active';

        ResearchSource::create($validated);

        return redirect()->back()->with('success', 'Research source created successfully.');
    }

    public function update(Request $request, $sourceId)
    {
        $source = ResearchSource::where('id', $sourceId)->where('created_by', createdBy())->first();

        if (!$source) {
            return redirect()->back()->with('error', 'Research source not found.');
        }

        $validated = $request->validate([
            'source_name' => 'required|string|max:255',
            'source_type' => 'required|in:database,case_law,statutory,regulatory,secondary,custom',
            'description' => 'nullable|string',
            'url' => 'nullable|url',
            'access_info' => 'nullable|string',
            'credentials' => 'nullable|array',
            'status' => 'nullable|in:active,inactive',
        ]);

        $source->update($validated);

        return redirect()->back()->with('success', 'Research source updated successfully.');
    }

    public function destroy($sourceId)
    {
        $source = ResearchSource::where('id', $sourceId)->where('created_by', createdBy())->first();

        if (!$source) {
            return redirect()->back()->with('error', 'Research source not found.');
        }

        $source->delete();

        return redirect()->back()->with('success', 'Research source deleted successfully.');
    }

    public function toggleStatus($sourceId)
    {
        $source = ResearchSource::where('id', $sourceId)->where('created_by', createdBy())->first();

        if (!$source) {
            return redirect()->back()->with('error', 'Research source not found.');
        }

        $source->status = $source->status === 'active' ? 'inactive' : 'active';
        $source->save();

        return redirect()->back()->with('success', 'Research source status updated successfully.');
    }
}