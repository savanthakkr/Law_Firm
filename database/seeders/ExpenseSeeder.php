<?php

namespace Database\Seeders;

use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ExpenseSeeder extends Seeder
{
    public function run(): void
    {
        $companies = User::where('type', 'company')->get();

        foreach ($companies as $company) {
            $categories = ExpenseCategory::where('created_by', $company->id)->get();
            $cases = \App\Models\CaseModel::where('created_by', $company->id)->get();

            if ($categories->isEmpty() || $cases->isEmpty()) continue;

            // Create 1-2 expenses per case
            foreach ($cases as $case) {
                $expenseCount = rand(1, 2);
                $descriptions = [
                    'Court filing fee for case documents',
                    'Travel expenses for client meeting',
                    'Expert witness consultation fee',
                    'Document copying and printing costs',
                    'Legal research database access',
                    'Office supplies for case preparation',
                    'Postage and courier services',
                    'Conference call and communication costs'
                ];
                
                for ($i = 1; $i <= $expenseCount; $i++) {
                    $expenseDate = now()->subDays(rand(1, 60));
                    
                    $expenseData = [
                        'created_by' => $company->id,
                        'case_id' => $case->id,
                        'expense_category_id' => $categories->random()->id,
                        'invoice_id' => null,
                        'description' => $descriptions[array_rand($descriptions)],
                        'amount' => rand(50, 500),
                        'expense_date' => $expenseDate,
                        'is_billable' => true,
                        'is_approved' => true,
                        'receipt_file' => null,
                        'notes' => 'Case-related expense for professional services.',
                    ];
                    
                    Expense::create($expenseData);
                }
            }
        }
    }
}