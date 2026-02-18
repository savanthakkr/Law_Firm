<?php

namespace App\Http\Controllers;

use App\Models\HearingType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class HearingTypeController extends Controller
{
    public function index(Request $request)
    {
        $query = HearingType::query()
            ->with(['creator'])
            ->where('created_by', createdBy());

        // Handle search
        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('type_id', 'like', '%' . $request->search . '%')
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

        $hearingTypes = $query->paginate($request->per_page ?? 10);

        return Inertia::render('hearing-types/index', [
            'hearingTypes' => $hearingTypes,
            'filters' => $request->all(['search', 'status', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'duration_estimate' => 'nullable|integer|min:1',
            'status' => 'nullable|in:active,inactive',
            'requirements' => 'nullable|array',
            'notes' => 'nullable|string',
        ]);

        $validated['created_by'] = createdBy();
        $validated['status'] = $validated['status'] ?? 'active';

        // Check if hearing type with same name already exists for this company
        $exists = HearingType::where('name', $validated['name'])
            ->where('created_by', createdBy())
            ->exists();

        if ($exists) {
            return redirect()->back()->with('error', 'Hearing type with this name already exists.');
        }

        HearingType::create($validated);

        return redirect()->back()->with('success', 'Hearing type created successfully.');
    }

    public function update(Request $request, $hearingTypeId)
    {
        $hearingType = HearingType::where('id', $hearingTypeId)
            ->where('created_by', createdBy())
            ->first();

        if ($hearingType) {
            try {
                $validated = $request->validate([
                    'name' => 'required|string|max:255',
                    'description' => 'nullable|string',
                    'duration_estimate' => 'nullable|integer|min:1',
                    'status' => 'nullable|in:active,inactive',
                    'requirements' => 'nullable|array',
                    'notes' => 'nullable|string',
                ]);

                // Check if hearing type with same name already exists for this company (excluding current)
                $exists = HearingType::where('name', $validated['name'])
                    ->where('created_by', createdBy())
                    ->where('id', '!=', $hearingTypeId)
                    ->exists();

                if ($exists) {
                    return redirect()->back()->with('error', 'Hearing type with this name already exists.');
                }

                $hearingType->update($validated);

                return redirect()->back()->with('success', 'Hearing type updated successfully');
            } catch (\Exception $e) {
                return redirect()->back()->with('error', $e->getMessage() ?: 'Failed to update hearing type');
            }
        } else {
            return redirect()->back()->with('error', 'Hearing type not found.');
        }
    }

    public function show($hearingTypeId)
    {
        $hearingType = HearingType::with(['creator'])
            ->where('id', $hearingTypeId)
            ->where('created_by', createdBy())
            ->first();

        if (!$hearingType) {
            return redirect()->route('hearing-types.index')->with('error', 'Hearing type not found.');
        }

        return Inertia::render('hearing-types/show', [
            'hearingType' => $hearingType,
        ]);
    }

    public function destroy($hearingTypeId)
    {
        $hearingType = HearingType::where('id', $hearingTypeId)
            ->where('created_by', createdBy())
            ->first();

        if ($hearingType) {
            try {
                $hearingType->delete();
                return redirect()->back()->with('success', 'Hearing type deleted successfully');
            } catch (\Exception $e) {
                return redirect()->back()->with('error', $e->getMessage() ?: 'Failed to delete hearing type');
            }
        } else {
            return redirect()->back()->with('error', 'Hearing type not found.');
        }
    }

    public function toggleStatus($hearingTypeId)
    {
        $hearingType = HearingType::where('id', $hearingTypeId)
            ->where('created_by', createdBy())
            ->first();

        if ($hearingType) {
            try {
                $hearingType->status = $hearingType->status === 'active' ? 'inactive' : 'active';
                $hearingType->save();

                return redirect()->back()->with('success', 'Hearing type status updated successfully');
            } catch (\Exception $e) {
                return redirect()->back()->with('error', $e->getMessage() ?: 'Failed to update hearing type status');
            }
        } else {
            return redirect()->back()->with('error', 'Hearing type not found.');
        }
    }
}