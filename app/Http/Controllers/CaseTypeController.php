<?php

namespace App\Http\Controllers;

use App\Models\CaseType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CaseTypeController extends Controller
{
    public function index(Request $request)
    {
        $query = CaseType::withPermissionCheck()
            ->with(['creator'])
            ->where('created_by', createdBy());

        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->has('status') && !empty($request->status) && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('sort_field') && !empty($request->sort_field)) {
            $query->orderBy($request->sort_field, $request->sort_direction ?? 'asc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $caseTypes = $query->paginate($request->per_page ?? 10);
        return Inertia::render('cases/case-types/index', [
            'caseTypes' => $caseTypes,
            'filters' => $request->all(['search', 'status', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'nullable|string|max:7',
            'status' => 'nullable|in:active,inactive',
        ]);

        $validated['created_by'] = createdBy();
        $validated['status'] = $validated['status'] ?? 'active';
        $validated['color'] = $validated['color'] ?? '#3B82F6';

        CaseType::create($validated);

        return redirect()->back()->with('success', 'Case type created successfully.');
    }

    public function update(Request $request, $caseTypeId)
    {
        $caseType = CaseType::where('id', $caseTypeId)->where('created_by', createdBy())->first();

        if (!$caseType) {
            return redirect()->back()->with('error', 'Case type not found.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'nullable|string|max:7',
            'status' => 'nullable|in:active,inactive',
        ]);

        $validated['color'] = $validated['color'] ?? '#3B82F6';

        $caseType->update($validated);

        return redirect()->back()->with('success', 'Case type updated successfully.');
    }

    public function destroy($caseTypeId)
    {
        $caseType = CaseType::where('id', $caseTypeId)->where('created_by', createdBy())->first();

        if (!$caseType) {
            return redirect()->back()->with('error', 'Case type not found.');
        }

        if ($caseType->cases()->count() > 0) {
            return redirect()->back()->with('error', 'Cannot delete case type that has associated cases.');
        }

        $caseType->delete();

        return redirect()->back()->with('success', 'Case type deleted successfully.');
    }

    public function toggleStatus($caseTypeId)
    {
        $caseType = CaseType::where('id', $caseTypeId)->where('created_by', createdBy())->first();

        if (!$caseType) {
            return redirect()->back()->with('error', 'Case type not found.');
        }

        $caseType->status = $caseType->status === 'active' ? 'inactive' : 'active';
        $caseType->save();

        return redirect()->back()->with('success', 'Case type status updated successfully.');
    }
}