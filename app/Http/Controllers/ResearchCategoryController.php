<?php

namespace App\Http\Controllers;

use App\Models\ResearchCategory;
use App\Models\PracticeArea;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ResearchCategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = ResearchCategory::withPermissionCheck()
            ->with(['practiceArea', 'creator'])
            ->where('created_by', createdBy());

        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->has('practice_area_id') && $request->practice_area_id !== 'all') {
            $query->where('practice_area_id', $request->practice_area_id);
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

        $practiceAreas = PracticeArea::where('created_by', createdBy())
            ->where('status', 'active')
            ->get(['id', 'name']);

        return Inertia::render('legal-research/categories/index', [
            'categories' => $categories,
            'practiceAreas' => $practiceAreas,
            'filters' => $request->all(['search', 'practice_area_id', 'status', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'practice_area_id' => 'nullable|exists:practice_areas,id',
            'status' => 'nullable|in:active,inactive',
        ]);

        if ($validated['practice_area_id']) {
            $practiceArea = PracticeArea::where('id', $validated['practice_area_id'])
                ->where('created_by', createdBy())
                ->first();
            if (!$practiceArea) {
                return redirect()->back()->with('error', 'Invalid practice area selection.');
            }
        }

        $validated['created_by'] = createdBy();
        $validated['status'] = $validated['status'] ?? 'active';
        $validated['color'] = $validated['color'] ?? '#3b82f6';

        ResearchCategory::create($validated);

        return redirect()->back()->with('success', 'Research category created successfully.');
    }

    public function update(Request $request, $categoryId)
    {
        $category = ResearchCategory::where('id', $categoryId)->where('created_by', createdBy())->first();

        if (!$category) {
            return redirect()->back()->with('error', 'Research category not found.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'practice_area_id' => 'nullable|exists:practice_areas,id',
            'status' => 'nullable|in:active,inactive',
        ]);

        if ($validated['practice_area_id']) {
            $practiceArea = PracticeArea::where('id', $validated['practice_area_id'])
                ->where('created_by', createdBy())
                ->first();
            if (!$practiceArea) {
                return redirect()->back()->with('error', 'Invalid practice area selection.');
            }
        }

        $category->update($validated);

        return redirect()->back()->with('success', 'Research category updated successfully.');
    }

    public function destroy($categoryId)
    {
        $category = ResearchCategory::where('id', $categoryId)->where('created_by', createdBy())->first();

        if (!$category) {
            return redirect()->back()->with('error', 'Research category not found.');
        }

        $category->delete();

        return redirect()->back()->with('success', 'Research category deleted successfully.');
    }

    public function toggleStatus($categoryId)
    {
        $category = ResearchCategory::where('id', $categoryId)->where('created_by', createdBy())->first();

        if (!$category) {
            return redirect()->back()->with('error', 'Research category not found.');
        }

        $category->status = $category->status === 'active' ? 'inactive' : 'active';
        $category->save();

        return redirect()->back()->with('success', 'Research category status updated successfully.');
    }
}