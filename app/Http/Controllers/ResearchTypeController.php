<?php

namespace App\Http\Controllers;

use App\Models\ResearchType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ResearchTypeController extends Controller
{
    public function index(Request $request)
    {
        $query = ResearchType::withPermissionCheck()
            ->with(['creator'])
            ->where('created_by', createdBy());

        // Handle search
        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        // Handle status filter
        if ($request->has('status') && !empty($request->status) && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Handle sorting
        if ($request->has('sort_field') && !empty($request->sort_field)) {
            $query->orderBy($request->sort_field, $request->sort_direction ?? 'asc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $researchTypes = $query->paginate($request->per_page ?? 10);

        return Inertia::render('legal-research/research-types/index', [
            'researchTypes' => $researchTypes,
            'filters' => $request->all(['search', 'status', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|in:active,inactive',
        ]);

        $validated['created_by'] = createdBy();
        $validated['status'] = $validated['status'] ?? 'active';

        // Check if research type with same name already exists for this company
        $exists = ResearchType::where('name', $validated['name'])
            ->where('created_by', createdBy())
            ->exists();

        if ($exists) {
            return redirect()->back()->with('error', 'Research type with this name already exists.');
        }

        ResearchType::create($validated);

        return redirect()->back()->with('success', 'Research type created successfully.');
    }

    public function update(Request $request, $researchTypeId)
    {
        $researchType = ResearchType::where('id', $researchTypeId)
            ->where('created_by', createdBy())
            ->first();

        if ($researchType) {
            try {
                $validated = $request->validate([
                    'name' => 'required|string|max:255',
                    'description' => 'nullable|string',
                    'status' => 'nullable|in:active,inactive',
                ]);

                // Check if research type with same name already exists for this company (excluding current)
                $exists = ResearchType::where('name', $validated['name'])
                    ->where('created_by', createdBy())
                    ->where('id', '!=', $researchTypeId)
                    ->exists();

                if ($exists) {
                    return redirect()->back()->with('error', 'Research type with this name already exists.');
                }

                $researchType->update($validated);

                return redirect()->back()->with('success', 'Research type updated successfully');
            } catch (\Exception $e) {
                return redirect()->back()->with('error', $e->getMessage() ?: 'Failed to update research type');
            }
        } else {
            return redirect()->back()->with('error', 'Research type not found.');
        }
    }

    public function destroy($researchTypeId)
    {
        $researchType = ResearchType::where('id', $researchTypeId)
            ->where('created_by', createdBy())
            ->first();

        if ($researchType) {
            try {
                // Check if research type has research projects
                $projectCount = $researchType->researchProjects()->count();
                if ($projectCount > 0) {
                    return response()->json(['message' => 'Cannot delete research type with assigned research projects'], 400);
                }
                
                $researchType->delete();
                return redirect()->back()->with('success', 'Research type deleted successfully');
            } catch (\Exception $e) {
                return redirect()->back()->with('error', $e->getMessage() ?: 'Failed to delete research type');
            }
        } else {
            return redirect()->back()->with('error', 'Research type not found.');
        }
    }

    public function toggleStatus($researchTypeId)
    {
        $researchType = ResearchType::where('id', $researchTypeId)
            ->where('created_by', createdBy())
            ->first();

        if ($researchType) {
            try {
                $researchType->status = $researchType->status === 'active' ? 'inactive' : 'active';
                $researchType->save();

                return redirect()->back()->with('success', 'Research type status updated successfully');
            } catch (\Exception $e) {
                return redirect()->back()->with('error', $e->getMessage() ?: 'Failed to update research type status');
            }
        } else {
            return redirect()->back()->with('error', 'Research type not found.');
        }
    }
}