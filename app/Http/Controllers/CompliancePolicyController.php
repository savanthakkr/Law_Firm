<?php

namespace App\Http\Controllers;

use App\Models\CompliancePolicy;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CompliancePolicyController extends Controller
{
    public function index(Request $request)
    {
        $query = CompliancePolicy::query()
            ->where('created_by', createdBy());

        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('policy_name', 'like', '%' . $request->search . '%')
                    ->orWhere('policy_content', 'like', '%' . $request->search . '%');
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

        $policies = $query->paginate($request->per_page ?? 10);

        return Inertia::render('CompliancePolicies/Index', [
            'compliancePolicies' => $policies,
            'filters' => $request->all(['search', 'status', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    public function create()
    {
        return Inertia::render('CompliancePolicies/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'policy_name' => 'required|string|max:255',
            'policy_content' => 'required|string',
            'effective_date' => 'required|date',
            'review_date' => 'nullable|date|after:effective_date',
            'status' => 'nullable|in:active,inactive',
        ]);

        $validated['created_by'] = createdBy();
        $validated['status'] = $validated['status'] ?? 'active';

        CompliancePolicy::create($validated);

        return redirect()->route('compliance.policies.index')->with('success', 'Compliance policy created successfully.');
    }

    public function show(CompliancePolicy $policy)
    {
        if ($policy->created_by !== createdBy()) {
            abort(403);
        }

        return Inertia::render('CompliancePolicies/Show', [
            'compliancePolicy' => $policy
        ]);
    }

    public function edit(CompliancePolicy $policy)
    {
        if ($policy->created_by !== createdBy()) {
            abort(403);
        }

        return Inertia::render('CompliancePolicies/Edit', [
            'compliancePolicy' => $policy
        ]);
    }

    public function update(Request $request, CompliancePolicy $policy)
    {
        if ($policy->created_by !== createdBy()) {
            abort(403);
        }

        $validated = $request->validate([
            'policy_name' => 'required|string|max:255',
            'policy_content' => 'required|string',
            'effective_date' => 'required|date',
            'review_date' => 'nullable|date|after:effective_date',
            'status' => 'nullable|in:active,inactive',
        ]);

        $policy->update($validated);

        return redirect()->route('compliance.policies.index')->with('success', 'Compliance policy updated successfully.');
    }

    public function destroy(CompliancePolicy $policy)
    {
        if ($policy->created_by !== createdBy()) {
            abort(403);
        }

        $policy->delete();

        return redirect()->back()->with('success', 'Compliance policy deleted successfully.');
    }

    public function toggleStatus(CompliancePolicy $policy)
    {
        if ($policy->created_by !== createdBy()) {
            abort(403);
        }

        $policy->update([
            'status' => $policy->status === 'active' ? 'inactive' : 'active'
        ]);

        return redirect()->back()->with('success', 'Policy status updated successfully.');
    }
}