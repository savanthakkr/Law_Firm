<?php

namespace App\Http\Controllers;

use App\Models\RegulatoryBody;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RegulatoryBodyController extends Controller
{
    public function index(Request $request)
    {
        $query = RegulatoryBody::withPermissionCheck()
            ->with(['creator'])
            ->withPermissionCheck();

        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%')
                    ->orWhere('jurisdiction', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('jurisdiction') && $request->jurisdiction !== 'all') {
            $query->where('jurisdiction', $request->jurisdiction);
        }

        if ($request->has('sort_field') && !empty($request->sort_field)) {
            $query->orderBy($request->sort_field, $request->sort_direction ?? 'asc');
        } else {
            $query->orderBy('name', 'asc');
        }

        $bodies = $query->paginate($request->per_page ?? 10);

        return Inertia::render('compliance/regulatory-bodies/index', [
            'bodies' => $bodies,
            'filters' => $request->all(['search', 'status', 'jurisdiction', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'jurisdiction' => 'required|string|max:255',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'website' => 'nullable|url|max:255',
            'status' => 'nullable|in:active,inactive',
        ]);

        $validated['created_by'] = createdBy();
        $validated['status'] = $validated['status'] ?? 'active';

        RegulatoryBody::create($validated);

        return redirect()->back()->with('success', 'Regulatory body created successfully.');
    }

    public function update(Request $request, $id)
    {
        $body = RegulatoryBody::withPermissionCheck()->findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'jurisdiction' => 'required|string|max:255',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'website' => 'nullable|url|max:255',
            'status' => 'nullable|in:active,inactive',
        ]);

        $body->update($validated);

        return redirect()->back()->with('success', 'Regulatory body updated successfully.');
    }

    public function destroy($id)
    {
        $body = RegulatoryBody::withPermissionCheck()->findOrFail($id);
        
        if ($body->complianceRequirements()->count() > 0) {
            return redirect()->back()->with('error', 'Cannot delete regulatory body that has compliance requirements.');
        }

        $body->delete();

        return redirect()->back()->with('success', 'Regulatory body deleted successfully.');
    }

    public function toggleStatus($id)
    {
        $body = RegulatoryBody::withPermissionCheck()->findOrFail($id);
        
        $newStatus = $body->status === 'active' ? 'inactive' : 'active';
        $body->update(['status' => $newStatus]);

        return redirect()->back()->with('success', 'Regulatory body status updated successfully.');
    }
}