<?php

namespace Database\Seeders;

use App\Models\Dashboard;
use App\Models\User;
use Illuminate\Database\Seeder;

class DashboardSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all company users (not superadmin)
        $companyUsers = User::where('type', '!=', 'superadmin')->get();

        foreach ($companyUsers as $user) {
            // Create default executive dashboard
            Dashboard::create([
                'name' => 'Executive Dashboard',
                'description' => 'Main executive dashboard with key performance indicators',
                'layout_config' => [
                    'widgets' => [
                        ['type' => 'revenue_chart', 'position' => ['x' => 0, 'y' => 0, 'w' => 6, 'h' => 4]],
                        ['type' => 'case_metrics', 'position' => ['x' => 6, 'y' => 0, 'w' => 6, 'h' => 4]],
                        ['type' => 'client_stats', 'position' => ['x' => 0, 'y' => 4, 'w' => 4, 'h' => 3]],
                        ['type' => 'billing_summary', 'position' => ['x' => 4, 'y' => 4, 'w' => 4, 'h' => 3]],
                        ['type' => 'team_performance', 'position' => ['x' => 8, 'y' => 4, 'w' => 4, 'h' => 3]]
                    ]
                ],
                'dashboard_type' => 'executive',
                'is_default' => true,
                'is_public' => true,
                'status' => 'active',
                'user_id' => $user->id,
                'created_by' => $user->id,
            ]);

            // Create financial dashboard
            Dashboard::create([
                'name' => 'Financial Analytics',
                'description' => 'Financial performance and revenue analytics dashboard',
                'layout_config' => [
                    'widgets' => [
                        ['type' => 'revenue_trends', 'position' => ['x' => 0, 'y' => 0, 'w' => 8, 'h' => 4]],
                        ['type' => 'profit_margins', 'position' => ['x' => 8, 'y' => 0, 'w' => 4, 'h' => 4]],
                        ['type' => 'billing_rates', 'position' => ['x' => 0, 'y' => 4, 'w' => 6, 'h' => 3]],
                        ['type' => 'collection_efficiency', 'position' => ['x' => 6, 'y' => 4, 'w' => 6, 'h' => 3]]
                    ]
                ],
                'dashboard_type' => 'financial',
                'is_default' => false,
                'is_public' => true,
                'status' => 'active',
                'user_id' => $user->id,
                'created_by' => $user->id,
            ]);

            // Create operational dashboard
            Dashboard::create([
                'name' => 'Operational Metrics',
                'description' => 'Case management and operational performance dashboard',
                'layout_config' => [
                    'widgets' => [
                        ['type' => 'case_success_rates', 'position' => ['x' => 0, 'y' => 0, 'w' => 6, 'h' => 4]],
                        ['type' => 'case_duration', 'position' => ['x' => 6, 'y' => 0, 'w' => 6, 'h' => 4]],
                        ['type' => 'workload_distribution', 'position' => ['x' => 0, 'y' => 4, 'w' => 8, 'h' => 3]],
                        ['type' => 'productivity_metrics', 'position' => ['x' => 8, 'y' => 4, 'w' => 4, 'h' => 3]]
                    ]
                ],
                'dashboard_type' => 'operational',
                'is_default' => false,
                'is_public' => true,
                'status' => 'active',
                'user_id' => $user->id,
                'created_by' => $user->id,
            ]);
        }
    }
}