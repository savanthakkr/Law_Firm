<?php

namespace App\Http\Controllers;

use App\Models\LegalPrecedent;
use App\Models\ResearchCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LegalPrecedentController extends BaseController
{
    public function index(Request $request)
    {
        $query = LegalPrecedent::withPermissionCheck()
            ->with(['category', 'creator']);

        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('case_name', 'like', '%' . $request->search . '%')
                    ->orWhere('citation', 'like', '%' . $request->search . '%')
                    ->orWhere('summary', 'like', '%' . $request->search . '%')
                    ->orWhere('jurisdiction', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->has('category_id') && $request->category_id !== 'all') {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('jurisdiction') && $request->jurisdiction !== 'all') {
            $query->where('jurisdiction', $request->jurisdiction);
        }

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('relevance_score') && $request->relevance_score !== 'all') {
            $query->where('relevance_score', '>=', $request->relevance_score);
        }

        if ($request->has('sort_field') && !empty($request->sort_field)) {
            $query->orderBy($request->sort_field, $request->sort_direction ?? 'asc');
        } else {
            $query->orderBy('relevance_score', 'desc');
        }

        $precedents = $query->paginate($request->per_page ?? 10);

        $categories = ResearchCategory::withPermissionCheck()
            ->where('status', 'active')
            ->get(['id', 'name']);

        $jurisdictions = LegalPrecedent::withPermissionCheck()
            ->distinct()
            ->pluck('jurisdiction')
            ->filter()
            ->sort()
            ->values();

        return Inertia::render('legal-research/precedents/index', [
            'precedents' => $precedents,
            'categories' => $categories,
            'jurisdictions' => $jurisdictions,
            'filters' => $request->all(['search', 'category_id', 'jurisdiction', 'status', 'relevance_score', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'case_name' => 'required|string|max:255',
            'citation' => 'required|string|max:255',
            'jurisdiction' => 'required|string|max:255',
            'summary' => 'required|string',
            'category_id' => 'nullable|exists:research_categories,id',
            'relevance_score' => 'required|integer|min:1|max:10',
            'decision_date' => 'nullable|date',
            'court_level' => 'nullable|string|max:255',
            'key_points' => 'nullable|array',
            'status' => 'nullable|in:active,overruled,questioned,archived',
        ]);

        if ($validated['category_id']) {
            $category = ResearchCategory::where('id', $validated['category_id'])
                ->where('created_by', createdBy())
                ->first();
            if (!$category) {
                return redirect()->back()->with('error', 'Invalid category selection.');
            }
        }

        $validated['created_by'] = createdBy();
        $validated['status'] = $validated['status'] ?? 'active';

        LegalPrecedent::create($validated);

        return redirect()->back()->with('success', 'Legal precedent created successfully.');
    }

    public function update(Request $request, $precedentId)
    {
        $precedent = LegalPrecedent::withPermissionCheck()->where('id', $precedentId)->first();

        if (!$precedent) {
            return redirect()->back()->with('error', 'Legal precedent not found.');
        }

        $validated = $request->validate([
            'case_name' => 'required|string|max:255',
            'citation' => 'required|string|max:255',
            'jurisdiction' => 'required|string|max:255',
            'summary' => 'required|string',
            'category_id' => 'nullable|exists:research_categories,id',
            'relevance_score' => 'required|integer|min:1|max:10',
            'decision_date' => 'nullable|date',
            'court_level' => 'nullable|string|max:255',
            'key_points' => 'nullable|array',
            'status' => 'nullable|in:active,overruled,questioned,archived',
        ]);

        if ($validated['category_id']) {
            $category = ResearchCategory::where('id', $validated['category_id'])
                ->where('created_by', createdBy())
                ->first();
            if (!$category) {
                return redirect()->back()->with('error', 'Invalid category selection.');
            }
        }

        $precedent->update($validated);

        return redirect()->back()->with('success', 'Legal precedent updated successfully.');
    }

    public function destroy($precedentId)
    {
        $precedent = LegalPrecedent::withPermissionCheck()->where('id', $precedentId)->first();

        if (!$precedent) {
            return redirect()->back()->with('error', 'Legal precedent not found.');
        }

        $precedent->delete();

        return redirect()->back()->with('success', 'Legal precedent deleted successfully.');
    }

    public function toggleStatus($precedentId)
    {
        $precedent = LegalPrecedent::withPermissionCheck()->where('id', $precedentId)->first();

        if (!$precedent) {
            return redirect()->back()->with('error', 'Legal precedent not found.');
        }

        $precedent->status = $precedent->status === 'active' ? 'archived' : 'active';
        $precedent->save();

        return redirect()->back()->with('success', 'Legal precedent status updated successfully.');
    }
}