<?php

namespace App\Http\Controllers;

use App\Models\Hearing;
use App\Models\CaseModel;
use App\Models\Court;
use App\Models\Judge;
use App\Models\HearingType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HearingController extends BaseController
{
    public function index(Request $request)
    {
        $query = Hearing::withPermissionCheck()
            ->with(['case', 'court', 'judge', 'hearingType', 'creator']);

        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                    ->orWhere('hearing_id', 'like', '%' . $request->search . '%')
                    ->orWhereHas('case', function($caseQuery) use ($request) {
                        $caseQuery->where('case_id', 'like', '%' . $request->search . '%');
                    });
            });
        }

        if ($request->has('status') && !empty($request->status) && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('court_id') && !empty($request->court_id) && $request->court_id !== 'all') {
            $query->where('court_id', $request->court_id);
        }

        if ($request->has('sort_field') && !empty($request->sort_field)) {
            $query->orderBy($request->sort_field, $request->sort_direction ?? 'asc');
        } else {
            $query->orderBy('hearing_date', 'desc');
        }

        $hearings = $query->paginate($request->per_page ?? 10);

        $cases = CaseModel::withPermissionCheck()->where('status', 'active')->get(['id', 'case_id', 'title']);
        $courts = Court::withPermissionCheck()->where('status', 'active')->get(['id', 'name']);
        $judges = Judge::withPermissionCheck()->where('status', 'active')->get(['id', 'name']);
        $hearingTypes = HearingType::withPermissionCheck()
            ->where('status', 'active')
            ->get(['id', 'name']);

        return Inertia::render('hearings/index', [
            'hearings' => $hearings,
            'cases' => $cases,
            'courts' => $courts,
            'judges' => $judges,
            'hearingTypes' => $hearingTypes,
            'filters' => $request->all(['search', 'status', 'court_id', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'case_id' => 'required|exists:cases,id',
            'court_id' => 'required|exists:courts,id',
            'judge_id' => 'nullable|exists:judges,id',
            'hearing_type_id' => 'nullable|exists:hearing_types,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'hearing_date' => 'required|date',
            'hearing_time' => 'required|date_format:H:i',
            'duration_minutes' => 'nullable|integer|min:15|max:480',
            'status' => 'nullable|in:scheduled,in_progress,completed,postponed,cancelled',
            'notes' => 'nullable|string',
        ]);

        $validated['created_by'] = createdBy();
        $validated['status'] = $validated['status'] ?? 'scheduled';
        $validated['duration_minutes'] = $validated['duration_minutes'] ?? 60;
        
        // Handle 'none' values for optional fields
        if ($validated['judge_id'] === 'none') {
            $validated['judge_id'] = null;
        }
        if ($validated['hearing_type_id'] === 'none') {
            $validated['hearing_type_id'] = null;
        }

        $hearing = Hearing::create($validated);
        
        // Create default notifications
        $this->createDefaultNotifications($hearing);

        return redirect()->back()->with('success', 'Hearing scheduled successfully.');
    }

    public function update(Request $request, $id)
    {
        $hearing = Hearing::withPermissionCheck()
            ->where('id', $id)
            ->first();

        if (!$hearing) {
            return redirect()->back()->with('error', 'Hearing not found.');
        }

        $validated = $request->validate([
            'case_id' => 'required|exists:cases,id',
            'court_id' => 'required|exists:courts,id',
            'judge_id' => 'nullable|exists:judges,id',
            'hearing_type_id' => 'nullable|exists:hearing_types,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'hearing_date' => 'required|date',
            'hearing_time' => 'required|date_format:H:i',
            'duration_minutes' => 'nullable|integer|min:15|max:480',
            'status' => 'nullable|in:scheduled,in_progress,completed,postponed,cancelled',
            'notes' => 'nullable|string',
            'outcome' => 'nullable|string',
        ]);

        // Handle 'none' values for optional fields
        if ($validated['judge_id'] === 'none') {
            $validated['judge_id'] = null;
        }
        if ($validated['hearing_type_id'] === 'none') {
            $validated['hearing_type_id'] = null;
        }
        
        $hearing->update($validated);
        
        // Update notifications if date/time changed
        if (isset($validated['hearing_date']) || isset($validated['hearing_time'])) {
            $this->updateNotifications($hearing);
        }

        return redirect()->back()->with('success', 'Hearing updated successfully.');
    }

    public function destroy($id)
    {
        $hearing = Hearing::withPermissionCheck()
            ->where('id', $id)
            ->first();

        if (!$hearing) {
            return redirect()->back()->with('error', 'Hearing not found.');
        }

        $hearing->delete();

        return redirect()->back()->with('success', 'Hearing deleted successfully.');
    }
    
    private function createDefaultNotifications($hearing)
    {
        $reminderTimes = [1440, 60, 15]; // 24 hours, 1 hour, 15 minutes
        $date = date('Y-m-d', strtotime($hearing->hearing_date));
        $time = date('H:i', strtotime($hearing->hearing_time));
        $hearingDateTime = \Carbon\Carbon::createFromFormat('Y-m-d H:i', $date . ' ' . $time);
        
        foreach ($reminderTimes as $minutes) {
            \App\Models\HearingNotification::create([
                'hearing_id' => $hearing->id,
                'user_id' => createdBy(),
                'type' => 'system',
                'minutes_before' => $minutes,
                'scheduled_at' => $hearingDateTime->copy()->subMinutes($minutes),
                'status' => 'pending'
            ]);
        }
    }
    
    public function getCourtJudges($courtId)
    {
        $judges = Judge::withPermissionCheck()
            ->where('court_id', $courtId)
            ->where('status', 'active')
            ->get(['id', 'name'])
            ->map(function($judge) {
                return [
                    'value' => $judge->id,
                    'label' => $judge->name
                ];
            });

        return response()->json($judges);
    }
    
    private function updateNotifications($hearing)
    {
        // Delete existing pending notifications
        \App\Models\HearingNotification::where('hearing_id', $hearing->id)
            ->where('status', 'pending')
            ->delete();
            
        // Create new notifications
        $this->createDefaultNotifications($hearing);
    }
}