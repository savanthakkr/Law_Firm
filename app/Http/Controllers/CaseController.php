<?php

namespace App\Http\Controllers;

use App\Models\CaseModel;
use App\Models\CaseType;
use App\Models\CaseStatus;
use App\Models\Client;
use App\Models\Court;
use App\Models\CaseTimeline;
use App\Models\CaseTeamMember;
use App\Models\CaseDocument;
use App\Models\DocumentType;
use App\Models\ResearchProject;
use App\Models\Task;
use App\Models\TaskType;
use App\Models\TaskStatus;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CaseController extends BaseController
{
    public function index(Request $request)
    {
        $query = CaseModel::withPermissionCheck()
            ->with(['client', 'caseType', 'caseStatus', 'court', 'creator']);

        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                    ->orWhere('case_id', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%')
                    ->orWhereHas('client', function ($clientQuery) use ($request) {
                        $clientQuery->where('name', 'like', '%' . $request->search . '%');
                    });
            });
        }

        if ($request->has('case_type_id') && !empty($request->case_type_id) && $request->case_type_id !== 'all') {
            $query->where('case_type_id', $request->case_type_id);
        }

        if ($request->has('case_status_id') && !empty($request->case_status_id) && $request->case_status_id !== 'all') {
            $query->where('case_status_id', $request->case_status_id);
        }

        if ($request->has('priority') && !empty($request->priority) && $request->priority !== 'all') {
            $query->where('priority', $request->priority);
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
            $query->orderBy('created_at', 'desc');
        }

        $cases = $query->paginate($request->per_page ?? 10);

        $caseTypes = CaseType::where('created_by', createdBy())->where('status', 'active')->get(['id', 'name']);
        $caseStatuses = CaseStatus::where('created_by', createdBy())->where('status', 'active')->get(['id', 'name']);
        $clients = Client::where('created_by', createdBy())->where('status', 'active')->get(['id', 'name']);
        $courts = Court::where('created_by', createdBy())->where('status', 'active')->get(['id', 'name']);
        
        // Get plan limits for cases (same pattern as UserController)
        $authUser = auth()->user();
        $planLimits = null;
        if ($authUser->type === 'company' && $authUser->plan) {
            $currentCases = CaseModel::where('created_by', $authUser->id)->count();
            $planLimits = [
                'current_cases' => $currentCases,
                'max_cases' => $authUser->plan->max_cases,
                'can_create' => $currentCases < $authUser->plan->max_cases
            ];
        }
        elseif ($authUser->type !== 'superadmin' && $authUser->created_by) {
            $companyUser = User::find($authUser->created_by);
            if ($companyUser && $companyUser->type === 'company' && $companyUser->plan) {
                $currentCases = CaseModel::where('created_by', $companyUser->id)->count();
                $planLimits = [
                    'current_cases' => $currentCases,
                    'max_cases' => $companyUser->plan->max_cases,
                    'can_create' => $currentCases < $companyUser->plan->max_cases
                ];
            }
        }

        return Inertia::render('cases/index', [
            'cases' => $cases,
            'caseTypes' => $caseTypes,
            'caseStatuses' => $caseStatuses,
            'clients' => $clients,
            'courts' => $courts,
            'planLimits' => $planLimits,
            'filters' => $request->all(['search', 'case_type_id', 'case_status_id', 'priority', 'status', 'court_id', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    public function show(Request $request, $caseId)
    {
        $case = CaseModel::withPermissionCheck()
            ->with([
                'client', 
                'caseType', 
                'caseStatus', 
                'court.judges' => function($query) {
                    $query->where('status', 'active');
                }, 
                'court.courtType'
            ])
            ->where('id', $caseId)
            ->first();

        // Timeline query with filters
        $timelineQuery = CaseTimeline::withPermissionCheck()->where('case_id', $caseId);

        if ($request->has('timeline_search') && !empty($request->timeline_search)) {
            $timelineQuery->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->timeline_search . '%')
                    ->orWhere('description', 'like', '%' . $request->timeline_search . '%');
            });
        }

        if ($request->has('timeline_event_type') && $request->timeline_event_type !== 'all') {
            $timelineQuery->where('event_type', $request->timeline_event_type);
        }

        if ($request->has('timeline_status') && $request->timeline_status !== 'all') {
            $timelineQuery->where('status', $request->timeline_status);
        }

        if ($request->has('timeline_completed') && $request->timeline_completed !== 'all') {
            $timelineQuery->where('is_completed', $request->timeline_completed === '1');
        }

        if ($request->has('timeline_sort_field') && !empty($request->timeline_sort_field)) {
            $timelineQuery->orderBy($request->timeline_sort_field, $request->timeline_sort_direction ?? 'asc');
        } else {
            $timelineQuery->orderBy('event_date', 'desc');
        }

        $timelines = $timelineQuery->paginate($request->timeline_per_page ?? 10, ['*'], 'timeline_page');

        // Team members query with filters
        $teamQuery = CaseTeamMember::with('user')
            ->where('case_id', $caseId)
            ->where('created_by', createdBy());

        if ($request->has('team_search') && !empty($request->team_search)) {
            $teamQuery->whereHas('user', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->team_search . '%');
            });
        }

        if ($request->has('team_role') && $request->team_role !== 'all') {
            $teamQuery->where('role', $request->team_role);
        }

        if ($request->has('team_status') && $request->team_status !== 'all') {
            $teamQuery->where('status', $request->team_status);
        }

        if ($request->has('team_sort_field') && !empty($request->team_sort_field)) {
            $teamQuery->orderBy($request->team_sort_field, $request->team_sort_direction ?? 'asc');
        } else {
            $teamQuery->orderBy('assigned_date', 'desc');
        }

        $teamMembers = $teamQuery->paginate($request->team_per_page ?? 10, ['*'], 'team_page');

        // Case documents query with filters
        $documentsQuery = CaseDocument::withPermissionCheck()->where('case_id', $caseId);

        if ($request->has('doc_search') && !empty($request->doc_search)) {
            $documentsQuery->where(function ($q) use ($request) {
                $q->where('document_name', 'like', '%' . $request->doc_search . '%')
                    ->orWhere('description', 'like', '%' . $request->doc_search . '%');
            });
        }

        if ($request->has('doc_type') && $request->doc_type !== 'all') {
            $documentsQuery->where('document_type', $request->doc_type);
        }

        if ($request->has('doc_confidentiality') && $request->doc_confidentiality !== 'all') {
            $documentsQuery->where('confidentiality', $request->doc_confidentiality);
        }

        if ($request->has('doc_status') && $request->doc_status !== 'all') {
            $documentsQuery->where('status', $request->doc_status);
        }

        if ($request->has('doc_sort_field') && !empty($request->doc_sort_field)) {
            $documentsQuery->orderBy($request->doc_sort_field, $request->doc_sort_direction ?? 'asc');
        } else {
            $documentsQuery->orderBy('created_at', 'desc');
        }

        $caseDocuments = $documentsQuery->paginate($request->doc_per_page ?? 10, ['*'], 'doc_page');

        $users = User::withPermissionCheck()
            ->where('status', 'active')
            ->whereDoesntHave('roles', function($q) {
                $q->where('name', 'client');
            })
            ->get(['id', 'name', 'email']);
        $documentTypes = DocumentType::withPermissionCheck()
            ->where('status', 'active')
            ->get(['id', 'name', 'color']);
        $roles = \Spatie\Permission\Models\Role::where('created_by', createdBy())
            ->where('name', '!=', 'superadmin')
            ->get(['id', 'name', 'label']);
        
        // Get case notes for this case
        $caseNotesQuery = \App\Models\CaseNote::withPermissionCheck()
            ->with('creator')
            ->whereJsonContains('case_ids', (string)$caseId)
            ->orderBy('created_at', 'desc');
        $caseNotes = $caseNotesQuery->paginate(10, ['*'], 'notes_page');
        
        // Get research projects for this case with their notes and citations
        $researchProjects = ResearchProject::withPermissionCheck()
            ->with(['researchType', 'notes', 'citations.source'])
            ->where('case_id', $caseId)
            ->orderBy('created_at', 'desc')
            ->paginate(10, ['*'], 'research_page');
        
        // Tasks query with filters
        $tasksQuery = Task::withPermissionCheck()
            ->with(['taskType', 'taskStatus', 'assignedUser'])
            ->where('case_id', $caseId);

        if ($request->has('task_search') && !empty($request->task_search)) {
            $tasksQuery->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->task_search . '%')
                    ->orWhere('description', 'like', '%' . $request->task_search . '%')
                    ->orWhere('task_id', 'like', '%' . $request->task_search . '%');
            });
        }

        if ($request->has('task_type_id') && $request->task_type_id !== 'all') {
            $tasksQuery->where('task_type_id', $request->task_type_id);
        }

        if ($request->has('task_status') && $request->task_status !== 'all') {
            $tasksQuery->where('status', $request->task_status);
        }

        if ($request->has('task_priority') && $request->task_priority !== 'all') {
            $tasksQuery->where('priority', $request->task_priority);
        }

        if ($request->has('task_assigned_to') && $request->task_assigned_to !== 'all') {
            $tasksQuery->where('assigned_to', $request->task_assigned_to);
        }

        if ($request->has('task_sort_field') && !empty($request->task_sort_field)) {
            $tasksQuery->orderBy($request->task_sort_field, $request->task_sort_direction ?? 'asc');
        } else {
            $tasksQuery->orderBy('due_date', 'asc');
        }

        $tasks = $tasksQuery->paginate($request->task_per_page ?? 10, ['*'], 'task_page');
        
        // Get task types and statuses for filters
        $taskTypes = TaskType::where('created_by', createdBy())
            ->where('status', 'active')
            ->get(['id', 'name']);
        $taskStatuses = TaskStatus::where('created_by', createdBy())
            ->where('status', 'active')
            ->get(['id', 'name']);
        
        return Inertia::render('cases/show', [
            'case' => $case,
            'timelines' => $timelines,
            'teamMembers' => $teamMembers,
            'caseDocuments' => $caseDocuments,
            'caseNotes' => $caseNotes,
            'researchProjects' => $researchProjects,
            'tasks' => $tasks,
            'users' => $users,
            'documentTypes' => $documentTypes,
            'roles' => $roles,
            'taskTypes' => $taskTypes,
            'taskStatuses' => $taskStatuses,
            'filters' => $request->all([
                'timeline_search', 'timeline_event_type', 'timeline_status', 'timeline_completed',
                'timeline_sort_field', 'timeline_sort_direction', 'timeline_per_page',
                'team_search', 'team_role', 'team_status',
                'team_sort_field', 'team_sort_direction', 'team_per_page',
                'doc_search', 'doc_type', 'doc_confidentiality', 'doc_status',
                'doc_sort_field', 'doc_sort_direction', 'doc_per_page',
                'task_search', 'task_type_id', 'task_status', 'task_priority', 'task_assigned_to',
                'task_sort_field', 'task_sort_direction', 'task_per_page'
            ]),
        ]);
    }

    public function store(Request $request)
    {
        // Check case limit (same pattern as UserController)
        $authUser = auth()->user();
        if ($authUser->type === 'company' && $authUser->plan) {
            $currentCases = CaseModel::where('created_by', $authUser->id)->count();
            $maxCases = $authUser->plan->max_cases;
            
            if ($currentCases >= $maxCases) {
                return redirect()->back()->with('error', __('Case limit exceeded. Your plan allows maximum :max cases. Please upgrade your plan.', ['max' => $maxCases]));
            }
        }
        elseif ($authUser->type !== 'superadmin' && $authUser->created_by) {
            $companyUser = User::find($authUser->created_by);
            if ($companyUser && $companyUser->type === 'company' && $companyUser->plan) {
                $currentCases = CaseModel::where('created_by', $companyUser->id)->count();
                $maxCases = $companyUser->plan->max_cases;
                
                if ($currentCases >= $maxCases) {
                    return redirect()->back()->with('error', __('Case limit exceeded. Your company plan allows maximum :max cases. Please contact your administrator.', ['max' => $maxCases]));
                }
            }
        }
        
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'client_id' => 'required|exists:clients,id',
            'case_type_id' => 'required|exists:case_types,id',
            'case_status_id' => 'required|exists:case_statuses,id',
            'court_id' => 'required|exists:courts,id',
            'priority' => 'required|in:low,medium,high',
            'filing_date' => 'nullable|date',
            'expected_completion_date' => 'nullable|date',
            'estimated_value' => 'nullable|numeric|min:0',
            'opposing_party' => 'nullable|string',
            'court_details' => 'nullable|string',
            'status' => 'nullable|in:active,inactive',
        ]);

        $validated['created_by'] = createdBy();
        $validated['status'] = $validated['status'] ?? 'active';

        // Verify related records belong to current company
        $client = Client::where('id', $validated['client_id'])->where('created_by', createdBy())->first();
        $caseType = CaseType::where('id', $validated['case_type_id'])->where('created_by', createdBy())->first();
        $caseStatus = CaseStatus::where('id', $validated['case_status_id'])->where('created_by', createdBy())->first();
        $court = Court::where('id', $validated['court_id'])->where('created_by', createdBy())->first();

        if (!$client || !$caseType || !$caseStatus || !$court) {
            return redirect()->back()->with('error', 'Invalid selection. Please try again.');
        }

        CaseModel::create($validated);

        return redirect()->back()->with('success', 'Case created successfully.');
    }

    public function update(Request $request, $caseId)
    {
        $case = CaseModel::where('id', $caseId)->where('created_by', createdBy())->first();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'client_id' => 'required|exists:clients,id',
            'case_type_id' => 'required|exists:case_types,id',
            'case_status_id' => 'required|exists:case_statuses,id',
            'court_id' => 'required|exists:courts,id',
            'priority' => 'required|in:low,medium,high',
            'filing_date' => 'nullable|date',
            'expected_completion_date' => 'nullable|date',
            'estimated_value' => 'nullable|numeric|min:0',
            'opposing_party' => 'nullable|string',
            'court_details' => 'nullable|string',
            'status' => 'nullable|in:active,inactive',
        ]);

        // Verify related records belong to current company
        $client = Client::where('id', $validated['client_id'])->where('created_by', createdBy())->first();
        $caseType = CaseType::where('id', $validated['case_type_id'])->where('created_by', createdBy())->first();
        $caseStatus = CaseStatus::where('id', $validated['case_status_id'])->where('created_by', createdBy())->first();
        $court = Court::where('id', $validated['court_id'])->where('created_by', createdBy())->first();

        if (!$client || !$caseType || !$caseStatus || !$court) {
            return redirect()->back()->with('error', 'Invalid selection. Please try again.');
        }

        $case->update($validated);

        return redirect()->back()->with('success', 'Case updated successfully.');
    }

    public function destroy($caseId)
    {
        $case = CaseModel::where('id', $caseId)->where('created_by', createdBy())->first();

        $case->delete();

        return redirect()->back()->with('success', 'Case deleted successfully.');
    }

    public function toggleStatus($caseId)
    {
        $case = CaseModel::where('id', $caseId)->where('created_by', createdBy())->first();
        
        $case->status = $case->status === 'active' ? 'inactive' : 'active';
        $case->save();

        return redirect()->back()->with('success', 'Case status updated successfully.');
    }
}