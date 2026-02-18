<?php

namespace App\Http\Controllers;

use App\Models\FeeType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FeeTypeController extends Controller
{
    public function index(Request $request)
    {
        $query = FeeType::withPermissionCheck()
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

        $feeTypes = $query->paginate($request->per_page ?? 10);

        return Inertia::render('billing/fee-types/index', [
            'feeTypes' => $feeTypes,
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

        // Check if fee type with same name already exists for this company
        $exists = FeeType::where('name', $validated['name'])
            ->where('created_by', createdBy())
            ->exists();

        if ($exists) {
            return redirect()->back()->with('error', 'Fee type with this name already exists.');
        }

        FeeType::create($validated);

        return redirect()->back()->with('success', 'Fee type created successfully.');
    }

    public function update(Request $request, $feeTypeId)
    {
        $feeType = FeeType::where('id', $feeTypeId)
            ->where('created_by', createdBy())
            ->first();

        if ($feeType) {
            try {
                $validated = $request->validate([
                    'name' => 'required|string|max:255',
                    'description' => 'nullable|string',
                    'status' => 'nullable|in:active,inactive',
                ]);

                // Check if fee type with same name already exists for this company (excluding current)
                $exists = FeeType::where('name', $validated['name'])
                    ->where('created_by', createdBy())
                    ->where('id', '!=', $feeTypeId)
                    ->exists();

                if ($exists) {
                    return redirect()->back()->with('error', 'Fee type with this name already exists.');
                }

                $feeType->update($validated);

                return redirect()->back()->with('success', 'Fee type updated successfully');
            } catch (\Exception $e) {
                return redirect()->back()->with('error', $e->getMessage() ?: 'Failed to update fee type');
            }
        } else {
            return redirect()->back()->with('error', 'Fee type not found.');
        }
    }

    public function destroy($feeTypeId)
    {
        $feeType = FeeType::where('id', $feeTypeId)
            ->where('created_by', createdBy())
            ->first();

        if ($feeType) {
            try {
                $feeType->delete();
                return redirect()->back()->with('success', 'Fee type deleted successfully');
            } catch (\Exception $e) {
                return redirect()->back()->with('error', $e->getMessage() ?: 'Failed to delete fee type');
            }
        } else {
            return redirect()->back()->with('error', 'Fee type not found.');
        }
    }

    public function toggleStatus($feeTypeId)
    {
        $feeType = FeeType::where('id', $feeTypeId)
            ->where('created_by', createdBy())
            ->first();

        if ($feeType) {
            try {
                $feeType->status = $feeType->status === 'active' ? 'inactive' : 'active';
                $feeType->save();

                return redirect()->back()->with('success', 'Fee type status updated successfully');
            } catch (\Exception $e) {
                return redirect()->back()->with('error', $e->getMessage() ?: 'Failed to update fee type status');
            }
        } else {
            return redirect()->back()->with('error', 'Fee type not found.');
        }
    }
}