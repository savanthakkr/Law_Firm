<?php

namespace App\Http\Controllers;

use App\Models\ComplianceAudit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ComplianceAuditController extends Controller
{
    public function index(Request $request)
    {
        $query = ComplianceAudit::withPermissionCheck()
            ->with(['creator', 'auditType'])
            ->where('created_by', createdBy());

        // Load audit types for filters
        $auditTypes = \App\Models\AuditType::where(function ($q) {
            $q->where('created_by', createdBy());
        })->where('status', 'active')->orderBy('name')->get();

        // Handle search
        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('audit_title', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%')
                    ->orWhere('auditor_name', 'like', '%' . $request->search . '%')
                    ->orWhere('auditor_organization', 'like', '%' . $request->search . '%');
            });
        }

        // Handle audit type filter
        if ($request->has('audit_type_id') && !empty($request->audit_type_id) && $request->audit_type_id !== 'all') {
            $query->where('audit_type_id', $request->audit_type_id);
        }

        // Handle status filter
        if ($request->has('status') && !empty($request->status) && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Handle risk level filter
        if ($request->has('risk_level') && !empty($request->risk_level) && $request->risk_level !== 'all') {
            $query->where('risk_level', $request->risk_level);
        }

        // Handle sorting
        if ($request->has('sort_field') && !empty($request->sort_field)) {
            $query->orderBy($request->sort_field, $request->sort_direction ?? 'asc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $audits = $query->paginate($request->per_page ?? 10);

        return Inertia::render('compliance/audits/index', [
            'audits' => $audits,
            'auditTypes' => $auditTypes,
            'filters' => $request->all(['search', 'audit_type_id', 'status', 'risk_level', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'audit_title' => 'required|string|max:255',
            'audit_type_id' => 'required|exists:audit_types,id',
            'description' => 'required|string',
            'audit_date' => 'required|date',
            'completion_date' => 'nullable|date|after_or_equal:audit_date',
            'status' => 'nullable|in:planned,in_progress,completed,cancelled',
            'scope' => 'nullable|string',
            'findings' => 'nullable|string',
            'recommendations' => 'nullable|string',
            'risk_level' => 'nullable|in:low,medium,high,critical',
            'auditor_name' => 'nullable|string|max:255',
            'auditor_organization' => 'nullable|string|max:255',
            'corrective_actions' => 'nullable|string',
            'follow_up_date' => 'nullable|date|after:audit_date',
        ]);

        $validated['created_by'] = createdBy();
        $validated['status'] = $validated['status'] ?? 'planned';
        $validated['risk_level'] = $validated['risk_level'] ?? 'medium';

        ComplianceAudit::create($validated);

        return redirect()->back()->with('success', 'Compliance audit created successfully.');
    }

    public function update(Request $request, $auditId)
    {
        $audit = ComplianceAudit::where('created_by', createdBy())
            ->where('id', $auditId)
            ->first();

        if ($audit) {
            $validated = $request->validate([
                'audit_title' => 'required|string|max:255',
                'audit_type_id' => 'required|exists:audit_types,id',
                'description' => 'required|string',
                'audit_date' => 'required|date',
                'completion_date' => 'nullable|date|after_or_equal:audit_date',
                'status' => 'nullable|in:planned,in_progress,completed,cancelled',
                'scope' => 'nullable|string',
                'findings' => 'nullable|string',
                'recommendations' => 'nullable|string',
                'risk_level' => 'nullable|in:low,medium,high,critical',
                'auditor_name' => 'nullable|string|max:255',
                'auditor_organization' => 'nullable|string|max:255',
                'corrective_actions' => 'nullable|string',
                'follow_up_date' => 'nullable|date|after:audit_date',
            ]);

            $audit->update($validated);

            return redirect()->back()->with('success', 'Compliance audit updated successfully');
        }

        return redirect()->back()->with('error', 'Compliance audit not found.');
    }

    public function destroy($auditId)
    {
        $audit = ComplianceAudit::where('created_by', createdBy())
            ->where('id', $auditId)
            ->first();

        if ($audit) {
            $audit->delete();
            return redirect()->back()->with('success', 'Compliance audit deleted successfully');
        }

        return redirect()->back()->with('error', 'Compliance audit not found.');
    }
}