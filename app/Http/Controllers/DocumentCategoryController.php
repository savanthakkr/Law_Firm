<?php

namespace App\Http\Controllers;

use App\Models\DocumentCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DocumentCategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = DocumentCategory::withPermissionCheck()
            ->where('created_by', createdBy());

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
            $query->orderBy('created_at', 'desc');
        }

        $categories = $query->paginate($request->per_page ?? 10);

        return Inertia::render('document-management/categories/index', [
            'categories' => $categories,
            'filters' => $request->all(['search', 'status', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'required|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'status' => 'nullable|in:active,inactive',
        ]);

        $validated['created_by'] = createdBy();
        $validated['status'] = $validated['status'] ?? 'active';

        DocumentCategory::create($validated);

        return redirect()->back()->with('success', 'Document category created successfully.');
    }

    public function update(Request $request, $id)
    {
        $category = DocumentCategory::where('id', $id)->where('created_by', createdBy())->first();

        if (!$category) {
            return redirect()->back()->with('error', 'Document category not found.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'required|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'status' => 'nullable|in:active,inactive',
        ]);

        $category->update($validated);

        return redirect()->back()->with('success', 'Document category updated successfully.');
    }

    public function destroy($id)
    {
        $category = DocumentCategory::where('id', $id)->where('created_by', createdBy())->first();

        if (!$category) {
            return redirect()->back()->with('error', 'Document category not found.');
        }

        $category->delete();

        return redirect()->back()->with('success', 'Document category deleted successfully.');
    }

    public function toggleStatus($id)
    {
        $category = DocumentCategory::where('id', $id)->where('created_by', createdBy())->first();

        if (!$category) {
            return redirect()->back()->with('error', 'Document category not found.');
        }

        $category->status = $category->status === 'active' ? 'inactive' : 'active';
        $category->save();

        return redirect()->back()->with('success', 'Document category status updated successfully.');
    }
}