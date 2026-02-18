<?php

namespace App\Http\Controllers;

use App\Models\CaseTimeline;
use App\Models\CaseModel;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CaseTimelineController extends Controller
{
    public function index(Request $request)
    {
        $query = CaseTimeline::withPermissionCheck()
            ->with(['case', 'creator']);

        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%')
                    ->orWhere('event_type', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->has('case_id') && !empty($request->case_id) && $request->case_id !== 'all') {
            $query->where('case_id', $request->case_id);
        }

        if ($request->has('event_type') && !empty($request->event_type) && $request->event_type !== 'all') {
            $query->where('event_type', $request->event_type);
        }

        if ($request->has('status') && !empty($request->status) && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('sort_field') && !empty($request->sort_field)) {
            $query->orderBy($request->sort_field, $request->sort_direction ?? 'asc');
        } else {
            $query->orderBy('event_date', 'asc');
        }

        $timelines = $query->paginate($request->per_page ?? 10);
        $cases = CaseModel::withPermissionCheck()->where('status', 'active')->get(['id', 'title', 'case_id']);

        return Inertia::render('cases/case-timelines/index', [
            'timelines' => $timelines,
            'cases' => $cases,
            'filters' => $request->all(['search', 'case_id', 'event_type', 'status', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'case_id' => 'required|exists:cases,id',
            'event_type' => 'required|string|max:255',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'event_date' => 'required|date',
            'is_completed' => 'nullable|boolean',
            'status' => 'nullable|in:active,inactive',
        ]);

        $validated['created_by'] = createdBy();
        $validated['status'] = $validated['status'] ?? 'active';
        $validated['is_completed'] = $validated['is_completed'] ?? false;

        $case = CaseModel::withPermissionCheck()->where('id', $validated['case_id'])->first();
        if (!$case) {
            return redirect()->back()->with('error', 'Invalid case selected.');
        }

        CaseTimeline::create($validated);

        return redirect()->back()->with('success', 'Timeline event created successfully.');
    }

    public function update(Request $request, $timelineId)
    {
        $timeline = CaseTimeline::withPermissionCheck()->where('id', $timelineId)->first();

        if (!$timeline) {
            return redirect()->back()->with('error', 'Timeline event not found.');
        }

        $validated = $request->validate([
            'case_id' => 'required|exists:cases,id',
            'event_type' => 'required|string|max:255',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'event_date' => 'required|date',
            'is_completed' => 'nullable|boolean',
            'status' => 'nullable|in:active,inactive',
        ]);

        $validated['is_completed'] = $validated['is_completed'] ?? false;

        $case = CaseModel::withPermissionCheck()->where('id', $validated['case_id'])->first();
        if (!$case) {
            return redirect()->back()->with('error', 'Invalid case selected.');
        }

        $timeline->update($validated);

        return redirect()->back()->with('success', 'Timeline event updated successfully.');
    }

    public function destroy($timelineId)
    {
        $timeline = CaseTimeline::withPermissionCheck()->where('id', $timelineId)->first();

        if (!$timeline) {
            return redirect()->back()->with('error', 'Timeline event not found.');
        }

        $timeline->delete();

        return redirect()->back()->with('success', 'Timeline event deleted successfully.');
    }

    public function toggleStatus($timelineId)
    {
        $timeline = CaseTimeline::withPermissionCheck()->where('id', $timelineId)->first();

        if (!$timeline) {
            return redirect()->back()->with('error', 'Timeline event not found.');
        }

        $timeline->status = $timeline->status === 'active' ? 'inactive' : 'active';
        $timeline->save();

        return redirect()->back()->with('success', 'Timeline event status updated successfully.');
    }
}