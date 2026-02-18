<?php

namespace App\Http\Controllers;

use App\Models\Judge;
use App\Models\Court;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class JudgeController extends Controller
{
    public function index(Request $request)
    {
        $query = Judge::withPermissionCheck()
            ->with(['court', 'creator'])
            ->where('created_by', createdBy());

        // Handle search
        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('judge_id', 'like', '%' . $request->search . '%')
                    ->orWhere('title', 'like', '%' . $request->search . '%')
                    ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        // Handle court filter
        if ($request->has('court_id') && !empty($request->court_id) && $request->court_id !== 'all') {
            $query->where('court_id', $request->court_id);
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

        $judges = $query->paginate($request->per_page ?? 10);

        // Get courts for filter dropdown
        $courts = Court::where('created_by', createdBy())
            ->where('status', 'active')
            ->get(['id', 'name']);

        return Inertia::render('judges/index', [
            'judges' => $judges,
            'courts' => $courts,
            'filters' => $request->all(['search', 'court_id', 'status', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'court_id' => 'required|exists:courts,id',
            'name' => 'required|string|max:255',
            'title' => 'nullable|string|max:100',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'preferences' => 'nullable|array',
            'contact_info' => 'nullable|string',
            'status' => 'nullable|in:active,inactive',
            'notes' => 'nullable|string',
        ]);

        $validated['created_by'] = createdBy();
        $validated['status'] = $validated['status'] ?? 'active';

        // Check if court belongs to the current user's company
        $court = Court::where('id', $validated['court_id'])
            ->where('created_by', createdBy())
            ->first();

        if (!$court) {
            return redirect()->back()->with('error', 'Invalid court selected.');
        }

        Judge::create($validated);

        return redirect()->back()->with('success', 'Judge created successfully.');
    }

    public function update(Request $request, $judgeId)
    {
        $judge = Judge::where('id', $judgeId)
            ->where('created_by', createdBy())
            ->first();

        if ($judge) {
            try {
                $validated = $request->validate([
                    'court_id' => 'required|exists:courts,id',
                    'name' => 'required|string|max:255',
                    'title' => 'nullable|string|max:100',
                    'email' => 'nullable|email|max:255',
                    'phone' => 'nullable|string|max:20',
                    'preferences' => 'nullable|array',
                    'contact_info' => 'nullable|string',
                    'status' => 'nullable|in:active,inactive',
                    'notes' => 'nullable|string',
                ]);

                // Check if court belongs to the current user's company
                $court = Court::where('id', $validated['court_id'])
                    ->where('created_by', createdBy())
                    ->first();

                if (!$court) {
                    return redirect()->back()->with('error', 'Invalid court selected.');
                }

                $judge->update($validated);

                return redirect()->back()->with('success', 'Judge updated successfully');
            } catch (\Exception $e) {
                return redirect()->back()->with('error', $e->getMessage() ?: 'Failed to update judge');
            }
        } else {
            return redirect()->back()->with('error', 'Judge not found.');
        }
    }

    public function show($judgeId)
    {
        $judge = Judge::with(['court', 'creator'])
            ->where('id', $judgeId)
            ->where('created_by', createdBy())
            ->first();

        if (!$judge) {
            return redirect()->route('judges.index')->with('error', 'Judge not found.');
        }

        return Inertia::render('judges/show', [
            'judge' => $judge,
        ]);
    }

    public function destroy($judgeId)
    {
        $judge = Judge::where('id', $judgeId)
            ->where('created_by', createdBy())
            ->first();

        if ($judge) {
            try {
                $judge->delete();
                return redirect()->back()->with('success', 'Judge deleted successfully');
            } catch (\Exception $e) {
                return redirect()->back()->with('error', $e->getMessage() ?: 'Failed to delete judge');
            }
        } else {
            return redirect()->back()->with('error', 'Judge not found.');
        }
    }

    public function toggleStatus($judgeId)
    {
        $judge = Judge::where('id', $judgeId)
            ->where('created_by', createdBy())
            ->first();

        if ($judge) {
            try {
                $judge->status = $judge->status === 'active' ? 'inactive' : 'active';
                $judge->save();

                return redirect()->back()->with('success', 'Judge status updated successfully');
            } catch (\Exception $e) {
                return redirect()->back()->with('error', $e->getMessage() ?: 'Failed to update judge status');
            }
        } else {
            return redirect()->back()->with('error', 'Judge not found.');
        }
    }
}