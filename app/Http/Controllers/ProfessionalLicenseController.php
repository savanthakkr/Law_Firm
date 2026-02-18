<?php

namespace App\Http\Controllers;

use App\Models\ProfessionalLicense;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProfessionalLicenseController extends Controller
{
    public function index(Request $request)
    {
        $query = ProfessionalLicense::withPermissionCheck()->with(['user', 'creator']);

        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('license_type', 'like', '%' . $request->search . '%')
                    ->orWhere('license_number', 'like', '%' . $request->search . '%')
                    ->orWhere('issuing_authority', 'like', '%' . $request->search . '%')
                    ->orWhereHas('user', function ($userQuery) use ($request) {
                        $userQuery->where('name', 'like', '%' . $request->search . '%');
                    });
            });
        }

        if ($request->has('user_id') && $request->user_id !== 'all') {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('sort_field') && !empty($request->sort_field)) {
            $query->orderBy($request->sort_field, $request->sort_direction ?? 'asc');
        } else {
            $query->orderBy('expiry_date', 'asc');
        }

        $licenses = $query->paginate($request->per_page ?? 10);

        $users = User::where('created_by', createdBy())
            ->whereDoesntHave('roles', function ($q) {
                $q->where('name', 'client');
            })
            ->where('status', 'active')
            ->get(['id', 'name']);

        return Inertia::render('compliance/professional-licenses/index', [
            'licenses' => $licenses,
            'users' => $users,
            'filters' => $request->all(['search', 'user_id', 'status', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'license_type' => 'required|string|max:255',
            'license_number' => 'required|string|max:255|unique:professional_licenses',
            'issuing_authority' => 'required|string|max:255',
            'jurisdiction' => 'required|string|max:255',
            'issue_date' => 'required|date',
            'expiry_date' => 'required|date|after:issue_date',
            'status' => 'nullable|in:active,expired,suspended,revoked',
            'notes' => 'nullable|string',
        ]);

        $validated['created_by'] = createdBy();
        $validated['status'] = $validated['status'] ?? 'active';

        ProfessionalLicense::create($validated);

        return redirect()->back()->with('success', 'Professional license created successfully.');
    }

    public function update(Request $request, $id)
    {
        $license = ProfessionalLicense::withPermissionCheck()->findOrFail($id);

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'license_type' => 'required|string|max:255',
            'license_number' => 'required|string|max:255|unique:professional_licenses,license_number,' . $id,
            'issuing_authority' => 'required|string|max:255',
            'jurisdiction' => 'required|string|max:255',
            'issue_date' => 'required|date',
            'expiry_date' => 'required|date|after:issue_date',
            'status' => 'nullable|in:active,expired,suspended,revoked',
            'notes' => 'nullable|string',
        ]);

        $license->update($validated);

        return redirect()->back()->with('success', 'Professional license updated successfully.');
    }

    public function destroy($id)
    {
        $license = ProfessionalLicense::withPermissionCheck()->findOrFail($id);
        $license->delete();

        return redirect()->back()->with('success', 'Professional license deleted successfully.');
    }

    public function toggleStatus($id)
    {
        $license = ProfessionalLicense::withPermissionCheck()->findOrFail($id);

        $newStatus = match ($license->status) {
            'active' => 'suspended',
            'suspended' => 'active',
            'expired' => 'active',
            'revoked' => 'active',
            default => 'active'
        };

        $license->update(['status' => $newStatus]);

        return redirect()->back()->with('success', 'License status updated successfully.');
    }
}
