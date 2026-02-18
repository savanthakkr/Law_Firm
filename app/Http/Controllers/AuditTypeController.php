<?php

namespace App\Http\Controllers;

use App\Models\AuditType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuditTypeController extends Controller
{
    public function index(Request $request)
    {
        $query = AuditType::withPermissionCheck()
            ->with(['creator'])
            ->where(function ($q) {
                $q->where('created_by', createdBy());
            });

        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status === 'active');
        }

        $auditTypes = $query->orderBy('name')->paginate($request->per_page ?? 10);

        return Inertia::render('compliance/audit-types/index', [
            'auditTypes' => $auditTypes,
            'filters' => $request->all(['search', 'status', 'per_page']),
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

        AuditType::create($validated);

        return redirect()->back()->with('success', 'Audit type created successfully.');
    }

    public function update(Request $request, $id)
    {
        $auditType = AuditType::where('created_by', createdBy())->findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'required|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'status' => 'nullable|in:active,inactive',
        ]);

        $auditType->update($validated);

        return redirect()->back()->with('success', 'Audit type updated successfully.');
    }

    public function destroy($id)
    {
        $auditType = AuditType::where('created_by', createdBy())->findOrFail($id);
        $auditType->delete();

        return redirect()->back()->with('success', 'Audit type deleted successfully.');
    }

    public function toggleStatus($id)
    {
        $auditType = AuditType::where('created_by', createdBy())->findOrFail($id);
        $auditType->update(['status' => $auditType->status === 'active' ? 'inactive' : 'active']);

        return redirect()->back()->with('success', 'Audit type status updated successfully.');
    }
}