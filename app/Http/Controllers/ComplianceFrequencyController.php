<?php

namespace App\Http\Controllers;

use App\Models\ComplianceFrequency;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ComplianceFrequencyController extends Controller
{
    public function index(Request $request)
    {
        $query = ComplianceFrequency::withPermissionCheck()
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
            $query->orderBy('days', 'asc');
        }

        $frequencies = $query->paginate($request->per_page ?? 10);

        return Inertia::render('compliance/frequencies/index', [
            'frequencies' => $frequencies,
            'filters' => $request->all(['search', 'status', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'days' => 'nullable|integer|min:1',
            'status' => 'nullable|in:active,inactive',
        ]);

        $validated['created_by'] = createdBy();
        $validated['status'] = $validated['status'] ?? 'active';

        ComplianceFrequency::create($validated);

        return redirect()->back()->with('success', 'Compliance frequency created successfully.');
    }

    public function update(Request $request, $id)
    {
        $frequency = ComplianceFrequency::withPermissionCheck()->findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'days' => 'nullable|integer|min:1',
            'status' => 'nullable|in:active,inactive',
        ]);

        $frequency->update($validated);

        return redirect()->back()->with('success', 'Compliance frequency updated successfully.');
    }

    public function destroy($id)
    {
        $frequency = ComplianceFrequency::withPermissionCheck()->findOrFail($id);
        
        if ($frequency->complianceRequirements()->count() > 0) {
            return redirect()->back()->with('error', 'Cannot delete frequency that has compliance requirements.');
        }

        $frequency->delete();

        return redirect()->back()->with('success', 'Compliance frequency deleted successfully.');
    }

    public function toggleStatus($id)
    {
        $frequency = ComplianceFrequency::withPermissionCheck()->findOrFail($id);
        
        $newStatus = $frequency->status === 'active' ? 'inactive' : 'active';
        $frequency->update(['status' => $newStatus]);

        return redirect()->back()->with('success', 'Frequency status updated successfully.');
    }
}