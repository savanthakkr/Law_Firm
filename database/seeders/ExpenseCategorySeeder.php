<?php

namespace Database\Seeders;

use App\Models\ExpenseCategory;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ExpenseCategorySeeder extends Seeder
{
    public function run(): void
    {
        $companies = User::where('type', 'company')->get();

        // Create 2-3 expense categories per company
        $availableCategories = [
            ['name' => 'Court Fees', 'description' => 'Filing fees and court-related expenses'],
            ['name' => 'Travel', 'description' => 'Travel expenses for client meetings and court appearances'],
            ['name' => 'Office Supplies', 'description' => 'General office supplies and materials'],
            ['name' => 'Expert Witnesses', 'description' => 'Expert witness fees and related costs'],
            ['name' => 'Document Production', 'description' => 'Printing, copying, and document preparation costs'],
            ['name' => 'Research', 'description' => 'Legal research and database access costs'],
            ['name' => 'Communications', 'description' => 'Phone, internet, and communication expenses'],
            ['name' => 'Postage', 'description' => 'Mailing and shipping costs'],
            ['name' => 'Technology', 'description' => 'Software licenses and technology expenses'],
            ['name' => 'Professional Services', 'description' => 'External professional service fees'],
            ['name' => 'Entertainment', 'description' => 'Client entertainment and business meals'],
        ];

        foreach ($companies as $company) {
            $categoryCount = rand(8, 10);
            $selectedCategories = collect($availableCategories)->random($categoryCount);
            
            foreach ($selectedCategories as $category) {
                ExpenseCategory::firstOrCreate([
                    'name' => $category['name'],
                    'created_by' => $company->id
                ], [
                    'description' => $category['description'],
                    'status' => 'active',
                    'created_by' => $company->id,
                ]);
            }
        }
    }
}