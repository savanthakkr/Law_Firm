<?php

namespace App\Http\Controllers;

use App\Models\Hearing;
use App\Models\CaseTimeline;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class CalendarController extends BaseController
{
    public function index(Request $request)
    {
        $currentDate = $request->get('date', now()->format('Y-m-d'));
        $viewType = $request->get('view', 'month');
        
        $date = Carbon::parse($currentDate);
        
        // Calculate date range based on view type
        switch ($viewType) {
            case 'week':
                $startDate = $date->copy()->startOfWeek();
                $endDate = $date->copy()->endOfWeek();
                break;
            case 'day':
                $startDate = $date->copy()->startOfDay();
                $endDate = $date->copy()->endOfDay();
                break;
            default: // month
                $startDate = $date->copy()->startOfMonth()->startOfWeek();
                $endDate = $date->copy()->endOfMonth()->endOfWeek();
                break;
        }

        // Get hearings for the date range
        $hearings = Hearing::withPermissionCheck()
            ->with(['case', 'court', 'judge', 'hearingType'])
            ->whereBetween('hearing_date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->get()
            ->map(function ($hearing) {
                return [
                    'id' => 'hearing_' . $hearing->id,
                    'title' => $hearing->title,
                    'type' => 'hearing',
                    'date' => $hearing->hearing_date,
                    'time' => $hearing->hearing_time,
                    'duration' => $hearing->duration_minutes,
                    'status' => $hearing->status,
                    'case_title' => $hearing->case->title ?? '',
                    'court_name' => $hearing->court->name ?? '',
                    'judge_name' => $hearing->judge->name ?? '',
                    'color' => $this->getStatusColor($hearing->status),
                    'details' => [
                        'hearing_id' => $hearing->hearing_id,
                        'description' => $hearing->description,
                        'notes' => $hearing->notes,
                        'outcome' => $hearing->outcome
                    ]
                ];
            });

        // Get case timelines for the date range
        $timelines = CaseTimeline::withPermissionCheck()
            ->with(['case', 'eventType'])
            ->whereBetween('event_date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->get()
            ->map(function ($timeline) {
                $eventDateTime = \Carbon\Carbon::parse($timeline->event_date);
                return [
                    'id' => 'timeline_' . $timeline->id,
                    'title' => $timeline->title,
                    'type' => 'timeline',
                    'date' => $eventDateTime->format('Y-m-d'),
                    'time' => $eventDateTime->format('H:i'),
                    'status' => $timeline->status,
                    'case_title' => $timeline->case->title ?? '',
                    'event_type' => $timeline->eventType->name ?? $timeline->event_type,
                    'is_completed' => $timeline->is_completed,
                    'color' => $timeline->is_completed ? '#10b981' : '#f59e0b',
                    'details' => [
                        'description' => $timeline->description,
                        'location' => $timeline->location,
                        'participants' => $timeline->participants
                    ]
                ];
            });

        // Combine and sort events
        $events = $hearings->concat($timelines)->sortBy('date')->values();

        // Get upcoming events (next 7 days)
        $upcomingEvents = $this->getUpcomingEvents();

        return Inertia::render('calendar/index', [
            'events' => $events,
            'upcomingEvents' => $upcomingEvents,
            'currentDate' => $currentDate,
            'viewType' => $viewType,
            'dateRange' => [
                'start' => $startDate->format('Y-m-d'),
                'end' => $endDate->format('Y-m-d')
            ]
        ]);
    }

    private function getUpcomingEvents()
    {
        $startDate = now()->startOfDay();
        $endDate = now()->addDays(7)->endOfDay();

        $hearings = Hearing::withPermissionCheck()
            ->with(['case', 'court'])
            ->whereBetween('hearing_date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->where('status', '!=', 'cancelled')
            ->orderBy('hearing_date')
            ->orderBy('hearing_time')
            ->take(5)
            ->get()
            ->map(function ($hearing) {
                return [
                    'id' => 'hearing_' . $hearing->id,
                    'title' => $hearing->title,
                    'type' => 'hearing',
                    'date' => $hearing->hearing_date,
                    'time' => $hearing->hearing_time,
                    'case_title' => $hearing->case->title ?? '',
                    'court_name' => $hearing->court->name ?? '',
                    'status' => $hearing->status,
                    'color' => $this->getStatusColor($hearing->status)
                ];
            });

        $timelines = CaseTimeline::withPermissionCheck()
            ->with(['case'])
            ->whereBetween('event_date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
            ->where('is_completed', false)
            ->orderBy('event_date')
            ->take(5)
            ->get()
            ->map(function ($timeline) {
                $eventDateTime = \Carbon\Carbon::parse($timeline->event_date);
                return [
                    'id' => 'timeline_' . $timeline->id,
                    'title' => $timeline->title,
                    'type' => 'timeline',
                    'date' => $eventDateTime->format('Y-m-d'),
                    'time' => $eventDateTime->format('H:i'),
                    'case_title' => $timeline->case->title ?? '',
                    'status' => $timeline->status,
                    'color' => '#f59e0b'
                ];
            });

        return $hearings->concat($timelines)->sortBy('date')->take(10)->values();
    }

    private function getStatusColor($status)
    {
        $colors = [
            'scheduled' => '#3b82f6',
            'in_progress' => '#f59e0b',
            'completed' => '#10b981',
            'postponed' => '#f97316',
            'cancelled' => '#ef4444',
            'pending' => '#6b7280',
            'active' => '#10b981'
        ];

        return $colors[$status] ?? '#6b7280';
    }
}