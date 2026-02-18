<?php

namespace App\Http\Controllers;

use App\Models\EventType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EventTypeController extends Controller
{
    public function index(Request $request)
    {
        $query = EventType::withPermissionCheck()
            ->with(['creator'])
            ->where(function($q) {
                $q->where('created_by', createdBy());
            });

        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->has('status') && !empty($request->status) && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('sort_field') && !empty($request->sort_field)) {
            $query->orderBy($request->sort_field, $request->sort_direction ?? 'asc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $eventTypes = $query->paginate($request->per_page ?? 10);

        return Inertia::render('advocate/event-types/index', [
            'eventTypes' => $eventTypes,
            'filters' => $request->all(['search', 'status', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'required|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'status' => 'nullable|in:active,inactive',
        ]);

        $validated['created_by'] = createdBy();
        $validated['status'] = $validated['status'] ?? 'active';

        EventType::create($validated);

        return redirect()->back()->with('success', 'Event type created successfully.');
    }

    public function update(Request $request, $id)
    {
        $eventType = EventType::where('id', $id)
            ->where('created_by', createdBy())
            ->first();

        if (!$eventType) {
            return redirect()->back()->with('error', 'Event type not found.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'required|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'status' => 'nullable|in:active,inactive',
        ]);

        $eventType->update($validated);

        return redirect()->back()->with('success', 'Event type updated successfully.');
    }

    public function destroy($id)
    {
        $eventType = EventType::where('id', $id)
            ->where('created_by', createdBy())
            ->first();

        if (!$eventType) {
            return redirect()->back()->with('error', 'Event type not found.');
        }

        $eventType->delete();

        return redirect()->back()->with('success', 'Event type deleted successfully.');
    }

    public function toggleStatus($id)
    {
        $eventType = EventType::where('id', $id)
            ->where('created_by', createdBy())
            ->first();

        if (!$eventType) {
            return redirect()->back()->with('error', 'Event type not found.');
        }

        $eventType->status = $eventType->status === 'active' ? 'inactive' : 'active';
        $eventType->save();

        return redirect()->back()->with('success', 'Event type status updated successfully.');
    }
}