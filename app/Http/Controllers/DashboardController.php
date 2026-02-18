<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Plan;
use App\Models\PlanOrder;
use App\Models\PlanRequest;
use App\Models\CaseModel;
use App\Models\Message;
use App\Models\Task;
use App\Models\Hearing;
use App\Models\Client;
use App\Models\TimeEntry;
use App\Models\Invoice;
use App\Models\Payment;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        // Super admin always gets dashboard
        if ($user->type === 'superadmin' || $user->type === 'super admin') {
            return $this->renderDashboard();
        }

        // Check if user has any permission (means they have access to some module)
        if ($user->getAllPermissions()->count() > 0) {
            return $this->renderDashboard();
        }

        // If no permissions, redirect to first available page
        return $this->redirectToFirstAvailablePage();
    }

    public function redirectToFirstAvailablePage()
    {
        $user = auth()->user();

        // Define available routes with their permissions
        $routes = [
            ['route' => 'users.index', 'permission' => 'manage-users'],
            ['route' => 'roles.index', 'permission' => 'manage-roles'],

            ['route' => 'plans.index', 'permission' => 'manage-plans'],
            ['route' => 'referral.index', 'permission' => 'manage-referral'],
            ['route' => 'settings.index', 'permission' => 'manage-settings'],
        ];

        // Find first available route
        foreach ($routes as $routeData) {
            if ($user->hasPermissionTo($routeData['permission'])) {
                return redirect()->route($routeData['route']);
            }
        }

        // If no permissions found, logout user
        auth()->logout();
        return redirect()->route('login')->with('error', __('No access permissions found.'));
    }

    private function renderDashboard()
    {
        $user = auth()->user();

        if ($user->type === 'superadmin' || $user->type === 'super admin') {
            return $this->renderSuperAdminDashboard();
        } else if ($user->type === 'company') {
            return $this->renderCompanyDashboard();
        } else if ($user->type === 'client') {
            return $this->renderClientDashboard();
        } else {
            return $this->renderTeamMemberDashboard();
        }
    }

    private function renderSuperAdminDashboard()
    {
        // Legal Industry Statistics
        $totalLawFirms = User::where('type', 'company')->count();
        $totalRevenue = PlanOrder::where('status', 'approved')->sum('final_price') ?? 0;
        $activePlans = Plan::where('is_plan_enable', 1)->count();
        $pendingRequests = PlanRequest::where('status', 'pending')->count();
        
        // Legal-specific metrics
        $totalCases = CaseModel::count();
        $activeCases = CaseModel::whereHas('caseStatus', function($q) {
            $q->where('is_closed', false);
        })->count();
        $totalClients = Client::count();
        $totalHearings = Hearing::where('hearing_date', '>=', now())->count();
        $totalAttorneys = User::whereHas('roles', function($q) {
            $q->whereIn('name', ['company', 'team_member']);
        })->count();
        $totalDocuments = \App\Models\Document::count() + \App\Models\CaseDocument::count() + \App\Models\ClientDocument::count();

        // Calculate monthly growth
        $currentMonthFirms = User::where('type', 'company')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();
        $previousMonthFirms = User::where('type', 'company')
            ->whereMonth('created_at', now()->subMonth()->month)
            ->whereYear('created_at', now()->subMonth()->year)
            ->count();
        $monthlyGrowth = $previousMonthFirms > 0
            ? round((($currentMonthFirms - $previousMonthFirms) / $previousMonthFirms) * 100, 1)
            : ($currentMonthFirms > 0 ? 100 : 0);

        // Revenue analytics
        $monthlyRevenue = PlanOrder::where('status', 'approved')
            ->whereMonth('created_at', now()->month)
            ->sum('final_price') ?? 0;
        $yearlyRevenue = PlanOrder::where('status', 'approved')
            ->whereYear('created_at', now()->year)
            ->sum('final_price') ?? 0;

        // Practice area distribution
        $practiceAreas = \App\Models\PracticeArea::selectRaw('name, COUNT(*) as count')
            ->groupBy('name')
            ->orderBy('count', 'desc')
            ->take(5)
            ->get()
            ->map(function($area) {
                return [
                    'name' => $area->name,
                    'count' => $area->count,
                    'percentage' => round(($area->count / \App\Models\PracticeArea::count()) * 100, 1)
                ];
            });

        // Recent activity with legal context
        $recentActivity = collect()
            ->merge(User::where('type', 'company')->latest()->take(2)->get()->map(function($firm) {
                return [
                    'id' => $firm->id,
                    'type' => 'law_firm',
                    'message' => "New law firm registered: {$firm->name}",
                    'time' => $firm->created_at->diffForHumans(),
                    'status' => 'success'
                ];
            }))
            ->merge(PlanOrder::where('status', 'approved')->latest()->take(2)->get()->map(function($order) {
                return [
                    'id' => $order->id,
                    'type' => 'subscription',
                    'message' => "Plan subscription: $" . number_format($order->final_price, 2),
                    'time' => $order->created_at->diffForHumans(),
                    'status' => 'success'
                ];
            }))
            ->merge(PlanRequest::where('status', 'pending')->latest()->take(1)->get()->map(function($request) {
                return [
                    'id' => $request->id,
                    'type' => 'plan_request',
                    'message' => "Plan upgrade request pending",
                    'time' => $request->created_at->diffForHumans(),
                    'status' => 'warning'
                ];
            }))
            ->sortByDesc('time')
            ->take(5)
            ->values();

        $dashboardData = [
            'stats' => [
                'totalLawFirms' => $totalLawFirms,
                'totalRevenue' => $totalRevenue,
                'monthlyRevenue' => $monthlyRevenue,
                'yearlyRevenue' => $yearlyRevenue,
                'activePlans' => $activePlans,
                'pendingRequests' => $pendingRequests,
                'monthlyGrowth' => $monthlyGrowth,
                'totalCases' => $totalCases,
                'activeCases' => $activeCases,
                'totalClients' => $totalClients,
                'totalHearings' => $totalHearings,
                'totalAttorneys' => $totalAttorneys,
                'totalDocuments' => $totalDocuments,
            ],
            'recentActivity' => $recentActivity,
            'topPlans' => Plan::withCount('users')
                ->orderBy('users_count', 'desc')
                ->take(5)
                ->get()
                ->map(function ($plan) {
                    return [
                        'name' => $plan->name,
                        'subscribers' => $plan->users_count,
                        'revenue' => $plan->users_count * $plan->price,
                        'price' => $plan->price,
                        'features' => [
                            'max_users' => $plan->max_users,
                            'max_cases' => $plan->max_cases,
                            'max_clients' => $plan->max_clients,
                            'storage_limit' => $plan->storage_limit
                        ]
                    ];
                }),
            'practiceAreas' => $practiceAreas,
            'revenueAnalytics' => [
                'total' => $totalRevenue,
                'monthly' => $monthlyRevenue,
                'yearly' => $yearlyRevenue,
                'growth' => $monthlyGrowth
            ]
        ];

        return Inertia::render('superadmin/dashboard', [
            'dashboardData' => $dashboardData
        ]);
    }

    private function renderCompanyDashboard()
    {
        $user = auth()->user();
        $companyId = createdBy();

        // Get legal management statistics  
        $totalCases = CaseModel::where('created_by', $companyId)->count();
        $activeCases = CaseModel::where('created_by', $companyId)
            ->where(function ($query) {
                $query->whereHas('caseStatus', function ($q) {
                    $q->where('is_closed', false);
                })->Where('status', 'active');
            })
            ->count();
        $totalClients = Client::where('created_by', $companyId)->count();
        $activeClients = Client::where('created_by', $companyId)->where('status', 'active')->count();
        $pendingTasks = Task::where('created_by', $companyId)->where('status', 1)->count();
        $upcomingHearings = Hearing::where('created_by', $companyId)
            ->where('hearing_date', '>=', now())
            ->count();
        $unreadMessages = Message::where('company_id', $companyId)
            ->where('recipient_id', auth()->id())
            ->where('is_read', false)
            ->count();

        // Calculate monthly growth
        $currentMonthClients = Client::where('created_by', $companyId)
            ->whereMonth('created_at', now()->month)
            ->count();
        $previousMonthClients = Client::where('created_by', $companyId)
            ->whereMonth('created_at', now()->subMonth()->month)
            ->count();
        $monthlyGrowth = $previousMonthClients > 0
            ? round((($currentMonthClients - $previousMonthClients) / $previousMonthClients) * 100, 1)
            : ($currentMonthClients > 0 ? 100 : 0);

        // Cases by status
        $casesByStatus = CaseModel::where('created_by', $companyId)
            ->with('caseStatus')
            ->get()
            ->groupBy(function ($case) {
                return $case->caseStatus ? $case->caseStatus->name : ucfirst($case->status ?? 'pending');
            })
            ->map(function ($cases, $statusName) {
                $colors = ['#10b981', '#f59e0b', '#6b7280', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#64748b'];
                static $colorIndex = 0;
                return [
                    'name' => $statusName,
                    'value' => $cases->count(),
                    'color' => $colors[$colorIndex++ % count($colors)]
                ];
            })
            ->values()
            ->toArray();

        // Recent activity
        $recentActivity = collect()
            ->merge(CaseModel::where('created_by', $companyId)->latest()->take(3)->get()->map(function ($case) {
                return [
                    'id' => $case->id,
                    'type' => 'case',
                    'title' => 'New case created',
                    'description' => $case->title,
                    'time' => $case->created_at->diffForHumans(),
                    'status' => 'success'
                ];
            }))
            ->merge(Message::where('company_id', $companyId)->where('recipient_id', auth()->id())->latest()->take(2)->get()->map(function ($message) {
                return [
                    'id' => $message->id,
                    'type' => 'message',
                    'title' => 'New message received',
                    'description' => substr($message->content, 0, 50) . '...',
                    'time' => $message->created_at->diffForHumans(),
                    'status' => 'info'
                ];
            }))
            ->sortByDesc('time')
            ->take(5)
            ->values();

        // Upcoming hearings
        $upcomingHearingsList = Hearing::where('created_by', $companyId)
            ->where('hearing_date', '>=', now())
            ->orderBy('hearing_date')
            ->take(4)
            ->get()
            ->map(function ($hearing) {
                return [
                    'id' => $hearing->id,
                    'title' => $hearing->title ?? 'Court Hearing',
                    'court' => $hearing->court ?? 'District Court',
                    'date' => $hearing->hearing_date->format('M d, Y'),
                    'time' => $hearing->hearing_date->format('H:i A'),
                    'type' => $hearing->hearing_type ?? 'General'
                ];
            });

        // Tasks by priority (in progress only)
        $tasksPriority = [
            ['priority' => 'High', 'count' => Task::where('created_by', $companyId)->where('priority', 'high')->where('status', 'in_progress')->count(), 'color' => '#ef4444'],
            ['priority' => 'Medium', 'count' => Task::where('created_by', $companyId)->where('priority', 'medium')->where('status', 'in_progress')->count(), 'color' => '#f59e0b'],
            ['priority' => 'Low', 'count' => Task::where('created_by', $companyId)->where('priority', 'low')->where('status', 'in_progress')->count(), 'color' => '#10b981']
        ];

        // Get user's current plan with relationship
        $user->load('plan');
        $currentPlan = $user->getCurrentPlan();
        $storageLimit = $currentPlan ? $currentPlan->storage_limit : 5; // Default 5GB if no plan

        // Calculate actual storage usage
        $documentsStorage = 0; // File size removed from documents
        $caseDocumentsStorage = 0; // File size removed from case documents
        $clientDocumentsStorage = 0; // File size removed from client documents

        $totalStorageUsed = $documentsStorage + $caseDocumentsStorage + $clientDocumentsStorage;

        // Get actual user count for the company
        $currentUsers = User::where('created_by', $companyId)->where('status', 'active')->count();

        // Calculate actual revenue from payments (most accurate)
        $totalRevenue = Payment::where('created_by', $companyId)
            ->sum('amount') ?? 0;

        $dashboardData = [
            'stats' => [
                'totalCases' => $totalCases,
                'activeCases' => $activeCases,
                'totalClients' => $totalClients,
                'activeClients' => $activeClients,
                'currentUsers' => $currentUsers,
                'totalRevenue' => $totalRevenue,
                'monthlyGrowth' => $monthlyGrowth,
                'pendingTasks' => $pendingTasks,
                'upcomingHearings' => $upcomingHearings,
                'unreadMessages' => $unreadMessages
            ],
            'recentActivity' => $recentActivity,
            'casesByStatus' => $casesByStatus,
            'upcomingHearings' => $upcomingHearingsList,
            'tasksPriority' => $tasksPriority,
            'plan' => [
                'name' => $currentPlan ? $currentPlan->name : 'Free Plan',
                'storage_limit' => $storageLimit,
                'max_users' => $currentPlan ? $currentPlan->max_users : 5,
                'max_cases' => $currentPlan ? $currentPlan->max_cases : 10,
                'max_clients' => $currentPlan ? $currentPlan->max_clients : 10,
                'price' => $currentPlan ? $currentPlan->price : 0,
                'yearly_price' => $currentPlan ? $currentPlan->yearly_price : 0,
                'is_trial' => $user->is_trial,
                'trial_expire_date' => $user->trial_expire_date,
                'plan_expire_date' => $user->plan_expire_date,
                'features' => $currentPlan ? [
                    'custom_domain' => $currentPlan->enable_custdomain === 'on',
                    'subdomain' => $currentPlan->enable_custsubdomain === 'on',
                    'pwa' => $currentPlan->pwa_business === 'on',
                    'chatgpt' => $currentPlan->enable_chatgpt === 'on',
                    'branding' => $currentPlan->enable_branding === 'on'
                ] : []
            ],
            'storage' => [
                'total_used' => round($totalStorageUsed, 2),
                'documents_used' => round($documentsStorage, 2),
                'case_documents_used' => round($caseDocumentsStorage, 2),
                'client_documents_used' => round($clientDocumentsStorage, 2),
                'limit' => $storageLimit
            ]
        ];

        return Inertia::render('dashboard', [
            'dashboardData' => $dashboardData
        ]);
    }

    private function renderTeamMemberDashboard()
    {
        $user = auth()->user();

        // My assigned tasks only
        $myTasks = Task::withPermissionCheck()
            ->where('assigned_to', $user->id)
            ->whereIn('status', ['not_started', 'in_progress'])
            ->orderBy('due_date', 'asc')
            ->limit(5)
            ->get(['id', 'title', 'priority', 'due_date', 'status']);

        // Cases where I'm assigned or involved (through tasks or time entries)
        $myCaseIds = collect()
            ->merge(Task::withPermissionCheck()->where('assigned_to', $user->id)->pluck('case_id'))
            ->merge(TimeEntry::withPermissionCheck()->where('user_id', $user->id)->pluck('case_id'))
            ->filter()
            ->unique()
            ->values();

        $myCases = CaseModel::withPermissionCheck()
            ->with(['client', 'caseStatus'])
            ->whereIn('id', $myCaseIds)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get(['id', 'case_id', 'title', 'client_id', 'case_status_id', 'priority']);

        // Upcoming hearings for my cases only
        $upcomingHearings = Hearing::withPermissionCheck()
            ->with(['case', 'court'])
            ->whereIn('case_id', $myCaseIds)
            ->where('hearing_date', '>=', now())
            ->orderBy('hearing_date', 'asc')
            ->limit(5)
            ->get(['id', 'title', 'hearing_date', 'hearing_time', 'case_id', 'court_id']);

        // My time entries only
        $recentTimeEntries = TimeEntry::withPermissionCheck()
            ->with(['case'])
            ->where('user_id', $user->id)
            ->orderBy('entry_date', 'desc')
            ->limit(5)
            ->get(['id', 'description', 'hours', 'entry_date', 'case_id']);

        // Calculate task completion percentage
        $totalTasks = Task::withPermissionCheck()->where('assigned_to', $user->id)->count();
        $completedTasks = Task::withPermissionCheck()->where('assigned_to', $user->id)->where('status', 'completed')->count();
        $taskCompletionPercentage = $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100) : 0;

        // Statistics - only my data
        $stats = [
            'total_tasks' => $totalTasks,
            'pending_tasks' => Task::withPermissionCheck()->where('assigned_to', $user->id)->whereIn('status', ['not_started', 'in_progress'])->count(),
            'total_cases' => $myCaseIds->count(), // Only cases I'm involved in
            'total_hours_this_month' => TimeEntry::withPermissionCheck()->where('user_id', $user->id)->whereMonth('entry_date', now()->month)->sum('hours') ?? 0,
            'task_completion_percentage' => $taskCompletionPercentage,
        ];

        return Inertia::render('dashboard/TeamMemberDashboard', [
            'myTasks' => $myTasks,
            'myCases' => $myCases,
            'upcomingHearings' => $upcomingHearings,
            'recentTimeEntries' => $recentTimeEntries,
            'stats' => $stats,
        ]);
    }

    private function renderClientDashboard()
    {
        $user = auth()->user();
        $client = Client::where('email', $user->email)->first();
        
        if (!$client) {
            return redirect()->route('login')->with('error', 'Client profile not found');
        }

        $myCases = CaseModel::withPermissionCheck()->with(['caseStatus', 'caseType'])->get();
        $upcomingHearings = Hearing::withPermissionCheck()->with(['case', 'court'])->where('hearing_date', '>=', now())->get();
        $recentDocuments = \App\Models\ClientDocument::withPermissionCheck()->latest()->limit(5)->get();

        // Calculate message counts for this client
        $totalMessages = Message::where('recipient_id', $user->id)->count();
        $unreadMessages = Message::where('recipient_id', $user->id)->where('is_read', false)->count();

        $stats = [
            'total_cases' => CaseModel::withPermissionCheck()->count(),
            'active_cases' => CaseModel::withPermissionCheck()->whereHas('caseStatus', function($q) {
                $q->where('is_closed', false);
            })->count(),
            'upcoming_hearings' => $upcomingHearings->count(),
            'total_documents' => \App\Models\ClientDocument::withPermissionCheck()->count(),
            'total_messages' => $totalMessages,
            'unread_messages' => $unreadMessages,
        ];

        return Inertia::render('dashboard/ClientDashboard', [
            'client' => $client,
            'myCases' => $myCases,
            'upcomingHearings' => $upcomingHearings,
            'recentDocuments' => $recentDocuments,
            'stats' => $stats,
            'userType' => 'client',
            'dashboardData' => ['stats' => $stats]
        ]);
    }
}
