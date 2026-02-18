<?php

namespace App\Http\Controllers;

use App\Models\CaseModel;
use App\Models\Client;
use App\Models\Invoice;
use App\Models\Task;
use App\Models\Hearing;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardAnalyticsController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $plan = $user->getCurrentPlan();
        $year = $request->get('year', date('Y'));

        return Inertia::render('analytics/index', [
            'kpiMetrics' => $this->getKPIMetrics(),
            'dashboardWidgets' => $this->getDashboardWidgets($year),
            'financialReports' => $this->getFinancialReports(),
            'revenueAnalytics' => $this->getRevenueAnalytics(),
            'caseAnalytics' => $this->getCaseAnalytics(),
            'customReports' => $this->getCustomReports(),
            'planInfo' => [
                'name' => $plan ? $plan->name : 'Free Plan',
                'storage_limit' => $plan ? $plan->storage_limit : 5,
                'max_users' => $plan ? $plan->max_users : 5
            ]
        ]);
    }



    private function getKPIMetrics()
    {
        $companyId = createdBy();

        $activeCases = CaseModel::where('created_by', $companyId)
            ->count();

        $activeClients = Client::where('created_by', $companyId)
            ->count();

        $totalRevenue = Invoice::where('created_by', $companyId)
            ->where('status', 'paid')
            ->sum('total_amount');

        $pendingTasks = Task::where('created_by', $companyId)
            ->count();

        $caseSuccessRate = $this->calculateCaseSuccessRate($companyId);
        $avgResolutionTime = $this->calculateAvgResolutionTime($companyId);

        return [
            'activeCases' => $activeCases,
            'activeClients' => $activeClients,
            'totalRevenue' => $totalRevenue,
            'pendingTasks' => $pendingTasks,
            'caseSuccessRate' => $caseSuccessRate,
            'avgResolutionTime' => $avgResolutionTime,
            'collectionRate' => $this->calculateCollectionRate($companyId),
            'billableHours' => $this->calculateBillableHours($companyId)
        ];
    }

    private function getDashboardWidgets($year = null)
    {
        $companyId = createdBy();
        $year = $year ?: date('Y');

        $tasksByMonth = [];
        for ($month = 1; $month <= 12; $month++) {
            $monthData = [
                'month' => Carbon::create()->month($month)->format('M'),
                'critical' => 0,
                'high' => 0,
                'medium' => 0
            ];
            
            $tasks = Task::where('created_by', $companyId)
                ->whereYear('created_at', $year)
                ->whereMonth('created_at', $month)
                ->selectRaw('priority, COUNT(*) as count')
                ->groupBy('priority')
                ->get();
                
            foreach ($tasks as $task) {
                $priority = strtolower($task->priority);
                if (isset($monthData[$priority])) {
                    $monthData[$priority] = $task->count;
                }
            }
            
            $tasksByMonth[] = $monthData;
        }

        return [
            'recentCases' => CaseModel::where('created_by', $companyId)
                ->with(['client', 'caseStatus'])
                ->latest()
                ->take(5)
                ->get(),
            'overdueInvoices' => Invoice::where('created_by', $companyId)
                ->where('status', 'overdue')
                ->with('client')
                ->take(5)
                ->get(),
            'tasksByPriority' => $tasksByMonth
        ];
    }

    private function getFinancialReports()
    {
        $companyId = createdBy();

        $yearlyRevenue = [];
        for ($year = date('Y') - 4; $year <= date('Y'); $year++) {
            for ($month = 1; $month <= 12; $month++) {
                $revenue = Invoice::where('created_by', $companyId)
                    ->where('status', 'paid')
                    ->whereYear('created_at', $year)
                    ->whereMonth('created_at', $month)
                    ->sum('total_amount');
                
                $yearlyRevenue[] = [
                    'year' => $year,
                    'month' => $month,
                    'month_name' => Carbon::create()->month($month)->format('M'),
                    'revenue' => $revenue ?: 0
                ];
            }
        }

        return [
            'yearlyRevenue' => $yearlyRevenue,
            'outstandingAmount' => Invoice::where('created_by', $companyId)
                ->whereIn('status', ['sent', 'overdue'])
                ->sum('total_amount')
        ];
    }

    private function getRevenueAnalytics()
    {
        $companyId = createdBy();

        return [];
    }

    private function getCaseAnalytics()
    {
        $companyId = createdBy();

        $casesByYear = [];
        for ($year = date('Y') - 4; $year <= date('Y'); $year++) {
            for ($month = 1; $month <= 12; $month++) {
                $monthData = [
                    'year' => $year,
                    'month' => $month,
                    'month_name' => Carbon::create()->month($month)->format('M'),
                    'critical' => 0,
                    'high' => 0,
                    'medium' => 0,
                    'low' => 0
                ];
                
                $cases = CaseModel::where('created_by', $companyId)
                    ->whereYear('created_at', $year)
                    ->whereMonth('created_at', $month)
                    ->selectRaw('priority, COUNT(*) as count')
                    ->groupBy('priority')
                    ->get();
                    
                foreach ($cases as $case) {
                    $priority = strtolower($case->priority);
                    if (isset($monthData[$priority])) {
                        $monthData[$priority] = $case->count;
                    }
                }
                
                $casesByYear[] = $monthData;
            }
        }

        return [
            'casesByType' => CaseModel::where('created_by', $companyId)
                ->with('caseType')
                ->selectRaw('case_type_id, COUNT(*) as count')
                ->groupBy('case_type_id')
                ->get(),
            'casesByYear' => $casesByYear
        ];
    }

    private function getCustomReports()
    {
        $companyId = createdBy();

        return [];
    }

    // Helper calculation methods
    private function calculateCaseSuccessRate($companyId)
    {
        $totalCases = CaseModel::where('created_by', $companyId)->count();
        $successfulCases = CaseModel::where('created_by', $companyId)
            ->where('status', 'closed')
            ->count();
        return $totalCases > 0 ? round(($successfulCases / $totalCases) * 100, 1) : 0;
    }

    private function calculateAvgResolutionTime($companyId)
    {
        return CaseModel::where('created_by', $companyId)
            ->where('status', 'closed')
            ->whereNotNull('expected_completion_date')
            ->selectRaw('AVG(DATEDIFF(updated_at, created_at)) as avg_days')
            ->value('avg_days') ?? 0;
    }

    private function calculateCollectionRate($companyId)
    {
        $totalInvoiced = Invoice::where('created_by', $companyId)
            ->sum('total_amount');
        $totalPaid = Invoice::where('created_by', $companyId)
            ->where('status', 'paid')
            ->sum('total_amount');
        return $totalInvoiced > 0 ? round(($totalPaid / $totalInvoiced) * 100, 1) : 0;
    }

    private function calculateBillableHours($companyId)
    {
        // Mock calculation - implement based on time tracking system
        return Task::where('created_by', $companyId)
            ->where('status', 'completed')
            ->sum('estimated_duration') ?? 0;
    }



    private function calculateResourceUtilization($companyId)
    {
        // Mock calculation - implement based on user activity
        return 78.2;
    }
}