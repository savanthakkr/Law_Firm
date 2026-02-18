<?php

namespace App\Http\Controllers;

use App\Models\PracticeArea;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PracticeAreaController extends Controller
{
    public function index(Request $request)
    {
        $query = PracticeArea::withPermissionCheck()
            ->with(['creator'])
            ->where('created_by', createdBy());

        // Handle search
        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%')
                    ->orWhere('area_id', 'like', '%' . $request->search . '%')
                    ->orWhere('certifications', 'like', '%' . $request->search . '%');
            });
        }

        // Handle expertise level filter
        if ($request->has('expertise_level') && !empty($request->expertise_level) && $request->expertise_level !== 'all') {
            $query->where('expertise_level', $request->expertise_level);
        }

        // Handle primary filter
        if ($request->has('is_primary') && !empty($request->is_primary) && $request->is_primary !== 'all') {
            $query->where('is_primary', $request->is_primary === 'true');
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

        $practiceAreas = $query->paginate($request->per_page ?? 10);

        return Inertia::render('advocate/practice-areas/index', [
            'practiceAreas' => $practiceAreas,
            'filters' => $request->all(['search', 'expertise_level', 'is_primary', 'status', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'expertise_level' => 'required|in:beginner,intermediate,expert',
            'is_primary' => 'nullable|in:true,false,1,0',
            'certifications' => 'nullable|string',
            'status' => 'nullable|in:active,inactive',
        ]);

        // Convert string boolean to actual boolean
        if (isset($validated['is_primary'])) {
            $validated['is_primary'] = filter_var($validated['is_primary'], FILTER_VALIDATE_BOOLEAN);
        }

        $validated['created_by'] = createdBy();
        $validated['status'] = $validated['status'] ?? 'active';
        $validated['is_primary'] = $validated['is_primary'] ?? false;

        // Check if practice area with same name already exists for this company
        $exists = PracticeArea::where('name', $validated['name'])
            ->where('created_by', createdBy())
            ->exists();

        if ($exists) {
            return redirect()->back()->with('error', 'Practice area with this name already exists.');
        }

        PracticeArea::create($validated);

        return redirect()->back()->with('success', 'Practice area created successfully.');
    }

    public function update(Request $request, $areaId)
    {
        $area = PracticeArea::where('id', $areaId)
            ->where('created_by', createdBy())
            ->first();

        if ($area) {
            try {
                $validated = $request->validate([
                    'name' => 'required|string|max:255',
                    'description' => 'nullable|string',
                    'expertise_level' => 'required|in:beginner,intermediate,expert',
                    'is_primary' => 'nullable|in:true,false,1,0',
                    'certifications' => 'nullable|string',
                    'status' => 'nullable|in:active,inactive',
                ]);

                // Convert string boolean to actual boolean
                if (isset($validated['is_primary'])) {
                    $validated['is_primary'] = filter_var($validated['is_primary'], FILTER_VALIDATE_BOOLEAN);
                }

                // Check if practice area with same name already exists for this company (excluding current)
                $exists = PracticeArea::where('name', $validated['name'])
                    ->where('created_by', createdBy())
                    ->where('id', '!=', $areaId)
                    ->exists();

                if ($exists) {
                    return redirect()->back()->with('error', 'Practice area with this name already exists.');
                }

                $area->update($validated);

                return redirect()->back()->with('success', 'Practice area updated successfully');
            } catch (\Exception $e) {
                return redirect()->back()->with('error', $e->getMessage() ?: 'Failed to update practice area');
            }
        } else {
            return redirect()->back()->with('error', 'Practice area not found.');
        }
    }

    public function destroy($areaId)
    {
        $area = PracticeArea::where('id', $areaId)
            ->where('created_by', createdBy())
            ->first();

        if ($area) {
            try {
                $area->delete();
                return redirect()->back()->with('success', 'Practice area deleted successfully');
            } catch (\Exception $e) {
                return redirect()->back()->with('error', $e->getMessage() ?: 'Failed to delete practice area');
            }
        } else {
            return redirect()->back()->with('error', 'Practice area not found.');
        }
    }

    public function toggleStatus($areaId)
    {
        $area = PracticeArea::where('id', $areaId)
            ->where('created_by', createdBy())
            ->first();

        if ($area) {
            try {
                $area->status = $area->status === 'active' ? 'inactive' : 'active';
                $area->save();

                return redirect()->back()->with('success', 'Practice area status updated successfully');
            } catch (\Exception $e) {
                return redirect()->back()->with('error', $e->getMessage() ?: 'Failed to update practice area status');
            }
        } else {
            return redirect()->back()->with('error', 'Practice area not found.');
        }
    }
}