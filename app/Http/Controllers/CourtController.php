<?php

namespace App\Http\Controllers;

use App\Models\Court;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CourtController extends Controller
{
    public function index(Request $request)
    {
        $query = Court::withPermissionCheck()
            ->with(['creator', 'courtType'])
            ->where('created_by', createdBy());

        // Handle search
        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('court_id', 'like', '%' . $request->search . '%')
                    ->orWhere('jurisdiction', 'like', '%' . $request->search . '%')
                    ->orWhere('address', 'like', '%' . $request->search . '%');
            });
        }

        // Handle court type filter
        if ($request->has('court_type_id') && !empty($request->court_type_id) && $request->court_type_id !== 'all') {
            $query->where('court_type_id', $request->court_type_id);
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

        $courts = $query->paginate($request->per_page ?? 10);
        
        // Get court types for dropdown
        $courtTypes = \App\Models\CourtType::where(function($q) {
                $q->where('created_by', createdBy());
            })
            ->where('status', 'active')
            ->get(['id', 'name', 'color']);

        return Inertia::render('courts/index', [
            'courts' => $courts,
            'courtTypes' => $courtTypes,
            'filters' => $request->all(['search', 'court_type_id', 'status', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'jurisdiction' => 'nullable|string|max:255',
            'court_type_id' => 'required|exists:court_types,id',
            'status' => 'nullable|in:active,inactive',
            'facilities' => 'nullable|array',
            'filing_requirements' => 'nullable|string',
            'local_rules' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $validated['created_by'] = createdBy();
        $validated['status'] = $validated['status'] ?? 'active';

        // Check if court with same name already exists for this company
        $exists = Court::where('name', $validated['name'])
            ->where('created_by', createdBy())
            ->exists();

        if ($exists) {
            return redirect()->back()->with('error', 'Court with this name already exists.');
        }

        Court::create($validated);

        return redirect()->back()->with('success', 'Court created successfully.');
    }

    public function update(Request $request, $courtId)
    {
        $court = Court::where('id', $courtId)
            ->where('created_by', createdBy())
            ->first();

        if ($court) {
            try {
                $validated = $request->validate([
                    'name' => 'required|string|max:255',
                    'address' => 'nullable|string',
                    'phone' => 'nullable|string|max:20',
                    'email' => 'nullable|email|max:255',
                    'jurisdiction' => 'nullable|string|max:255',
                    'court_type_id' => 'required|exists:court_types,id',
                    'status' => 'nullable|in:active,inactive',
                    'facilities' => 'nullable|array',
                    'filing_requirements' => 'nullable|string',
                    'local_rules' => 'nullable|string',
                    'notes' => 'nullable|string',
                ]);

                // Check if court with same name already exists for this company (excluding current)
                $exists = Court::where('name', $validated['name'])
                    ->where('created_by', createdBy())
                    ->where('id', '!=', $courtId)
                    ->exists();

                if ($exists) {
                    return redirect()->back()->with('error', 'Court with this name already exists.');
                }

                $court->update($validated);

                return redirect()->back()->with('success', 'Court updated successfully');
            } catch (\Exception $e) {
                return redirect()->back()->with('error', $e->getMessage() ?: 'Failed to update court');
            }
        } else {
            return redirect()->back()->with('error', 'Court not found.');
        }
    }

    public function show($courtId)
    {
        $court = Court::with(['creator'])
            ->where('id', $courtId)
            ->where('created_by', createdBy())
            ->first();

        if (!$court) {
            return redirect()->route('courts.index')->with('error', 'Court not found.');
        }

        return Inertia::render('courts/show', [
            'court' => $court,
        ]);
    }

    public function destroy($courtId)
    {
        $court = Court::where('id', $courtId)
            ->where('created_by', createdBy())
            ->first();

        if ($court) {
            try {
                $court->delete();
                return redirect()->back()->with('success', 'Court deleted successfully');
            } catch (\Exception $e) {
                return redirect()->back()->with('error', $e->getMessage() ?: 'Failed to delete court');
            }
        } else {
            return redirect()->back()->with('error', 'Court not found.');
        }
    }

    public function toggleStatus($courtId)
    {
        $court = Court::where('id', $courtId)
            ->where('created_by', createdBy())
            ->first();

        if ($court) {
            try {
                $court->status = $court->status === 'active' ? 'inactive' : 'active';
                $court->save();

                return redirect()->back()->with('success', 'Court status updated successfully');
            } catch (\Exception $e) {
                return redirect()->back()->with('error', $e->getMessage() ?: 'Failed to update court status');
            }
        } else {
            return redirect()->back()->with('error', 'Court not found.');
        }
    }
}