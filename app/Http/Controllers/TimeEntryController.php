<?php

namespace App\Http\Controllers;

use App\Models\TimeEntry;
use App\Models\CaseModel;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TimeEntryController extends Controller
{
    public function index(Request $request)
    {
        $query = TimeEntry::withPermissionCheck()
            ->with(['case', 'user', 'creator']);

        // Handle search
        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('description', 'like', '%' . $request->search . '%')
                    ->orWhere('entry_id', 'like', '%' . $request->search . '%')
                    ->orWhere('notes', 'like', '%' . $request->search . '%')
                    ->orWhereHas('user', function ($userQuery) use ($request) {
                        $userQuery->where('name', 'like', '%' . $request->search . '%');
                    })
                    ->orWhereHas('case', function ($caseQuery) use ($request) {
                        $caseQuery->where('case_id', 'like', '%' . $request->search . '%')
                            ->orWhere('title', 'like', '%' . $request->search . '%');
                    });
            });
        }

        // Handle case filter
        if ($request->has('case_id') && $request->case_id !== 'all') {
            if ($request->case_id === '') {
                $query->whereNull('case_id');
            } else {
                $query->where('case_id', $request->case_id);
            }
        }

        // Handle user filter
        if ($request->has('user_id') && !empty($request->user_id) && $request->user_id !== 'all') {
            $query->where('user_id', $request->user_id);
        }

        // Handle status filter
        if ($request->has('status') && !empty($request->status) && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Handle billable filter
        if ($request->has('is_billable') && $request->is_billable !== 'all') {
            $query->where('is_billable', $request->is_billable === '1');
        }

        // Handle date range filter
        if ($request->has('date_from') && !empty($request->date_from)) {
            $query->whereDate('entry_date', '>=', $request->date_from);
        }

        if ($request->has('date_to') && !empty($request->date_to)) {
            $query->whereDate('entry_date', '<=', $request->date_to);
        }

        // Handle sorting
        if ($request->has('sort_field') && !empty($request->sort_field)) {
            $query->orderBy($request->sort_field, $request->sort_direction ?? 'asc');
        } else {
            $query->orderBy('entry_date', 'desc');
        }

        $timeEntries = $query->paginate($request->per_page ?? 10);

        // Get cases for filter dropdown
        $cases = CaseModel::where('created_by', createdBy())
            ->get(['id', 'case_id', 'title']);

        // Get users for filter dropdown
        $users = User::where('created_by', createdBy())
            ->whereDoesntHave('roles', function ($q) {
                $q->where('name', 'client');
            })
            ->orWhere('id', createdBy())
            ->get(['id', 'name']);

        return Inertia::render('billing/time-entries/index', [
            'timeEntries' => $timeEntries,
            'cases' => $cases,
            'users' => $users,
            'filters' => $request->all(['search', 'case_id', 'user_id', 'status', 'is_billable', 'date_from', 'date_to', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'case_id' => 'nullable|string',
            'user_id' => 'required|exists:users,id',
            'description' => 'required|string',
            'hours' => 'required|numeric|min:0.1|max:24',
            'billable_rate' => 'nullable|numeric|min:0',
            'is_billable' => 'boolean',
            'entry_date' => 'required|date',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i',
            'status' => 'nullable|in:draft,submitted,approved,billed',
            'notes' => 'nullable|string',
        ]);

        // Convert is_billable to boolean
        if (isset($validated['is_billable'])) {
            $validated['is_billable'] = filter_var($validated['is_billable'], FILTER_VALIDATE_BOOLEAN);
        }

        $validated['created_by'] = createdBy();
        $validated['status'] = $validated['status'] ?? 'draft';
        $validated['is_billable'] = $validated['is_billable'] ?? true;

        // Handle empty case_id or 'none' value (convert to null)
        if (empty($validated['case_id']) || $validated['case_id'] === 'none') {
            $validated['case_id'] = null;
        }

        // Verify case belongs to the current user's company if provided and get client_id
        if (!empty($validated['case_id'])) {
            $case = CaseModel::where('id', $validated['case_id'])
                ->where('created_by', createdBy())
                ->first();

            if (!$case) {
                return redirect()->back()->with('error', 'Invalid case selected.');
            }
            
            // Set client_id from case
            $validated['client_id'] = $case->client_id;
        }

        // Verify user belongs to the current user's company
        $user = User::where('id', $validated['user_id'])
            ->where(function ($q) {
                $q->where('created_by', createdBy())
                    ->orWhere('id', createdBy());
            })
            ->first();

        if (!$user) {
            return redirect()->back()->with('error', 'Invalid user selected.');
        }

        TimeEntry::create($validated);

        return redirect()->back()->with('success', 'Time entry created successfully.');
    }

    public function update(Request $request, $timeEntryId)
    {
        $timeEntry = TimeEntry::where('id', $timeEntryId)
            ->where('created_by', createdBy())
            ->first();

        if (!$timeEntry) {
            return redirect()->back()->with('error', 'Time entry not found.');
        }

        $validated = $request->validate([
            'case_id' => 'nullable|integer',
            'user_id' => 'required|exists:users,id',
            'description' => 'required|string',
            'hours' => 'required|numeric|min:0.1|max:24',
            'billable_rate' => 'nullable|numeric|min:0',
            'is_billable' => 'boolean',
            'entry_date' => 'required|date',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i',
            'status' => 'nullable|in:draft,submitted,approved,billed',
            'notes' => 'nullable|string',
        ]);

        // Convert is_billable to boolean
        if (isset($validated['is_billable'])) {
            $validated['is_billable'] = filter_var($validated['is_billable'], FILTER_VALIDATE_BOOLEAN);
        }

        // Handle empty case_id or 'none' value (convert to null)
        if (empty($validated['case_id']) || $validated['case_id'] === 'none') {
            $validated['case_id'] = null;
        }

        // Verify case belongs to the current user's company if provided and get client_id
        if (!empty($validated['case_id'])) {
            $case = CaseModel::where('id', $validated['case_id'])
                ->where('created_by', createdBy())
                ->first();

            if (!$case) {
                return redirect()->back()->with('error', 'Invalid case selected.');
            }
            
            // Set client_id from case
            $validated['client_id'] = $case->client_id;
        }

        // Verify user belongs to the current user's company
        $user = User::where('id', $validated['user_id'])
            ->where(function ($q) {
                $q->where('created_by', createdBy())
                    ->orWhere('id', createdBy());
            })
            ->first();

        if (!$user) {
            return redirect()->back()->with('error', 'Invalid user selected.');
        }

        $timeEntry->update($validated);

        return redirect()->back()->with('success', 'Time entry updated successfully.');
    }

    public function destroy($timeEntryId)
    {
        $timeEntry = TimeEntry::where('id', $timeEntryId)
            ->where('created_by', createdBy())
            ->first();

        if (!$timeEntry) {
            return redirect()->back()->with('error', 'Time entry not found.');
        }

        // Prevent deletion of billed entries
        if ($timeEntry->status === 'billed') {
            return redirect()->back()->with('error', 'Cannot delete billed time entries.');
        }

        $timeEntry->delete();

        return redirect()->back()->with('success', 'Time entry deleted successfully.');
    }

    public function approve($timeEntryId)
    {
        $timeEntry = TimeEntry::where('id', $timeEntryId)
            ->where('created_by', createdBy())
            ->first();

        if (!$timeEntry) {
            return redirect()->back()->with('error', 'Time entry not found.');
        }

        if ($timeEntry->status !== 'submitted') {
            return redirect()->back()->with('error', 'Only submitted time entries can be approved.');
        }

        $timeEntry->update(['status' => 'approved']);

        return redirect()->back()->with('success', 'Time entry approved successfully.');
    }

    public function startTimer(Request $request)
    {
        $validated = $request->validate([
            'case_id' => 'nullable|exists:cases,id',
            'description' => 'required|string',
        ]);

        // Handle empty case_id (convert to null) and get client_id
        $clientId = null;
        if (empty($validated['case_id'])) {
            $validated['case_id'] = null;
        } else {
            $case = CaseModel::find($validated['case_id']);
            if ($case) {
                $clientId = $case->client_id;
            }
        }

        // Check if user already has a running timer
        $runningTimer = TimeEntry::where('user_id', Auth::id())
            ->where('created_by', createdBy())
            ->whereNull('end_time')
            ->whereNotNull('start_time')
            ->where('status', 'draft')
            ->first();

        if ($runningTimer) {
            return redirect()->back()->with('error', 'You already have a running timer. Please stop it first.');
        }

        $timeEntry = TimeEntry::create([
            'case_id' => $validated['case_id'],
            'client_id' => $clientId,
            'user_id' => Auth::id(),
            'description' => $validated['description'],
            'hours' => 0,
            'is_billable' => true,
            'entry_date' => now()->toDateString(),
            'start_time' => now()->format('H:i'),
            'status' => 'draft',
            'created_by' => createdBy(),
        ]);

        return redirect()->back()->with('success', 'Timer started successfully.');
    }

    public function stopTimer($timeEntryId)
    {
        $timeEntry = TimeEntry::where('id', $timeEntryId)
            ->where('user_id', Auth::id())
            ->where('created_by', createdBy())
            ->whereNull('end_time')
            ->whereNotNull('start_time')
            ->first();

        if (!$timeEntry) {
            return redirect()->back()->with('error', 'Running timer not found.');
        }

        $endTime = now();
        $startTime = \Carbon\Carbon::createFromFormat('H:i', $timeEntry->start_time);
        $hours = $endTime->diffInMinutes($startTime) / 60;

        $timeEntry->update([
            'end_time' => $endTime->format('H:i'),
            'hours' => round($hours, 2),
        ]);

        return redirect()->back()->with('success', 'Timer stopped successfully.');
    }
}
