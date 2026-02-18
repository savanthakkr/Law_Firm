<?php

namespace Database\Seeders;

use App\Models\RiskCategory;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RiskCategorySeeder extends Seeder
{
    public function run(): void
    {
        $companyUsers = User::where('type', 'company')->get();
        foreach ($companyUsers as $companyUser) {
            // Create 2-3 risk categories per company
            $categoryCount = rand(8, 10);
            $availableCategories = [
                ['name' => 'Operational Risk', 'description' => 'Risks related to day-to-day operations', 'color' => '#EF4444'],
                ['name' => 'Financial Risk', 'description' => 'Risks related to financial matters', 'color' => '#F59E0B'],
                ['name' => 'Legal Risk', 'description' => 'Risks related to legal compliance', 'color' => '#8B5CF6'],
                ['name' => 'Strategic Risk', 'description' => 'Risks related to strategic decisions', 'color' => '#10B981'],
                ['name' => 'Technology Risk', 'description' => 'Risks related to technology systems', 'color' => '#3B82F6'],
                ['name' => 'Reputational Risk', 'description' => 'Risks related to company reputation and image', 'color' => '#DC2626'],
                ['name' => 'Compliance Risk', 'description' => 'Risks related to regulatory and legal compliance', 'color' => '#059669'],
                ['name' => 'Market Risk', 'description' => 'Risks related to market conditions and competition', 'color' => '#7C2D12'],
                ['name' => 'Human Resources Risk', 'description' => 'Risks related to personnel and staffing', 'color' => '#1E40AF'],
                ['name' => 'Cybersecurity Risk', 'description' => 'Risks related to data breaches and cyber threats', 'color' => '#BE123C'],
                ['name' => 'Client Risk', 'description' => 'Risks related to client relationships and conflicts', 'color' => '#0891B2'],
            ];

            // Randomly select risk categories for this company
            $selectedCategories = collect($availableCategories)->random($categoryCount);

            foreach ($selectedCategories as $category) {
                RiskCategory::firstOrCreate([
                    'name' => $category['name'],
                    'created_by' => $companyUser->id
                ], [
                    'description' => $category['description'],
                    'color' => $category['color'],
                    'status' => 'active',
                    'created_by' => $companyUser->id
                ]);
            }
        }
    }
}
