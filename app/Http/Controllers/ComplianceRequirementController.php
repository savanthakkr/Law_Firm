<?php

namespace App\Http\Controllers;

use App\Models\ComplianceRequirement;
use App\Models\ComplianceCategory;
use App\Models\ComplianceFrequency;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ComplianceRequirementController extends Controller
{
    public function index(Request $request)
    {
        $query = ComplianceRequirement::withPermissionCheck()
            ->with(['category', 'frequency', 'creator'])
            ->withPermissionCheck();

        // Handle search
        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%')
                    ->orWhere('regulatory_body', 'like', '%' . $request->search . '%');
            });
        }

        // Handle filters
        if ($request->has('category_id') && $request->category_id !== 'all') {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('priority') && $request->priority !== 'all') {
            $query->where('priority', $request->priority);
        }

        // Handle sorting
        if ($request->has('sort_field') && !empty($request->sort_field)) {
            $query->orderBy($request->sort_field, $request->sort_direction ?? 'asc');
        } else {
            $query->orderBy('deadline', 'asc');
        }

        $requirements = $query->paginate($request->per_page ?? 10);

        // Get filter options
        $categories = ComplianceCategory::withPermissionCheck()
            ->where('status', 'active')
            ->get(['id', 'name', 'color']);
            
        $frequencies = ComplianceFrequency::withPermissionCheck()
            ->where('status', 'active')
            ->get(['id', 'name', 'days']);

        return Inertia::render('compliance/requirements/index', [
            'requirements' => $requirements,
            'categories' => $categories,
            'frequencies' => $frequencies,
            'filters' => $request->all(['search', 'category_id', 'status', 'priority', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'regulatory_body' => 'required|string|max:255',
            'category_id' => 'required|exists:compliance_categories,id',
            'frequency_id' => 'required|exists:compliance_frequencies,id',
            'jurisdiction' => 'nullable|string|max:255',
            'scope' => 'nullable|string',
            'effective_date' => 'nullable|date',
            'deadline' => 'nullable|date',
            'responsible_party' => 'nullable|string|max:255',
            'evidence_requirements' => 'nullable|string',
            'penalty_implications' => 'nullable|string',
            'monitoring_procedures' => 'nullable|string',
            'status' => 'nullable|in:pending,in_progress,compliant,non_compliant,overdue',
            'priority' => 'nullable|in:low,medium,high,critical',
        ]);

        $validated['created_by'] = createdBy();
        $validated['status'] = $validated['status'] ?? 'pending';
        $validated['priority'] = $validated['priority'] ?? 'medium';

        ComplianceRequirement::create($validated);

        return redirect()->back()->with('success', 'Compliance requirement created successfully.');
    }

    public function update(Request $request, $id)
    {
        $requirement = ComplianceRequirement::withPermissionCheck()->findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'regulatory_body' => 'required|string|max:255',
            'category_id' => 'required|exists:compliance_categories,id',
            'frequency_id' => 'required|exists:compliance_frequencies,id',
            'jurisdiction' => 'nullable|string|max:255',
            'scope' => 'nullable|string',
            'effective_date' => 'nullable|date',
            'deadline' => 'nullable|date',
            'responsible_party' => 'nullable|string|max:255',
            'evidence_requirements' => 'nullable|string',
            'penalty_implications' => 'nullable|string',
            'monitoring_procedures' => 'nullable|string',
            'status' => 'nullable|in:pending,in_progress,compliant,non_compliant,overdue',
            'priority' => 'nullable|in:low,medium,high,critical',
        ]);

        $requirement->update($validated);

        return redirect()->back()->with('success', 'Compliance requirement updated successfully.');
    }

    public function destroy($id)
    {
        $requirement = ComplianceRequirement::withPermissionCheck()->findOrFail($id);
        $requirement->delete();

        return redirect()->back()->with('success', 'Compliance requirement deleted successfully.');
    }

    public function toggleStatus(Request $request, $id)
    {
        $requirement = ComplianceRequirement::withPermissionCheck()->findOrFail($id);
        
        $validated = $request->validate([
            'status' => 'required|in:pending,in_progress,compliant,non_compliant,overdue'
        ]);

        $requirement->update(['status' => $validated['status']]);

        return redirect()->back()->with('success', 'Compliance requirement status updated successfully.');
    }
}