<?php

namespace App\Http\Controllers;

use App\Models\ComplianceCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ComplianceCategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = ComplianceCategory::withPermissionCheck()
            ->with(['creator'])
            ->withPermissionCheck();

        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('sort_field') && !empty($request->sort_field)) {
            $query->orderBy($request->sort_field, $request->sort_direction ?? 'asc');
        } else {
            $query->orderBy('name', 'asc');
        }

        $categories = $query->paginate($request->per_page ?? 10);

        return Inertia::render('compliance/categories/index', [
            'categories' => $categories,
            'filters' => $request->all(['search', 'status', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'required|string|size:7|regex:/^#[0-9A-Fa-f]{6}$/',
            'status' => 'nullable|in:active,inactive',
        ]);

        $validated['created_by'] = createdBy();
        $validated['status'] = $validated['status'] ?? 'active';

        ComplianceCategory::create($validated);

        return redirect()->back()->with('success', 'Compliance category created successfully.');
    }

    public function update(Request $request, $id)
    {
        $category = ComplianceCategory::withPermissionCheck()->findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'required|string|size:7|regex:/^#[0-9A-Fa-f]{6}$/',
            'status' => 'nullable|in:active,inactive',
        ]);

        $category->update($validated);

        return redirect()->back()->with('success', 'Compliance category updated successfully.');
    }

    public function destroy($id)
    {
        $category = ComplianceCategory::withPermissionCheck()->findOrFail($id);
        
        if ($category->complianceRequirements()->count() > 0) {
            return redirect()->back()->with('error', 'Cannot delete category that has compliance requirements.');
        }

        $category->delete();

        return redirect()->back()->with('success', 'Compliance category deleted successfully.');
    }

    public function toggleStatus($id)
    {
        $category = ComplianceCategory::withPermissionCheck()->findOrFail($id);
        
        $newStatus = $category->status === 'active' ? 'inactive' : 'active';
        $category->update(['status' => $newStatus]);

        return redirect()->back()->with('success', 'Category status updated successfully.');
    }
}