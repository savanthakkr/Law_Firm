<?php

namespace App\Http\Controllers;

use App\Models\RiskCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RiskCategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = RiskCategory::withPermissionCheck()->where(function($q) {
            $q->where('created_by', createdBy());
        })->latest();

        if ($request->has('search') && !empty($request->search)) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $categories = $query->paginate($request->per_page ?? 10);

        return Inertia::render('compliance/risk-categories/index', [
            'categories' => $categories,
            'filters' => $request->all(['search', 'status', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'required|string|size:7',
            'status' => 'nullable|in:active,inactive',
        ]);

        $validated['created_by'] = createdBy();
        $validated['status'] = $validated['status'] ?? 'active';

        RiskCategory::create($validated);

        return redirect()->back()->with('success', 'Risk category created successfully.');
    }

    public function update(Request $request, $id)
    {
        $category = RiskCategory::where('created_by', createdBy())->findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'required|string|size:7',
            'status' => 'nullable|in:active,inactive',
        ]);

        $category->update($validated);

        return redirect()->back()->with('success', 'Risk category updated successfully.');
    }

    public function destroy($id)
    {
        $category = RiskCategory::where('created_by', createdBy())->findOrFail($id);
        $category->delete();

        return redirect()->back()->with('success', 'Risk category deleted successfully.');
    }

    public function toggleStatus($id)
    {
        $category = RiskCategory::where('created_by', createdBy())->findOrFail($id);
        $category->update(['status' => $category->status === 'active' ? 'inactive' : 'active']);

        return redirect()->back()->with('success', 'Risk category status updated successfully.');
    }
}