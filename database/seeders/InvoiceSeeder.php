<?php

namespace Database\Seeders;

use App\Models\Invoice;
use App\Models\Client;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class InvoiceSeeder extends Seeder
{
    public function run(): void
    {
        $companies = User::where('type', 'company')->get();

        foreach ($companies as $company) {
            $clients = Client::where('created_by', $company->id)->get();
            
            // Create 3 invoices per client
            foreach ($clients as $client) {
                for ($invoiceNum = 1; $invoiceNum <= 3; $invoiceNum++) {
                    $this->createTimeEntriesAndExpenses($company, $client);
                    $this->createInvoiceForClient($company, $client);
                }
            }
        }
    }

    private function createTimeEntriesAndExpenses($company, $client)
    {
        $cases = \App\Models\CaseModel::where('created_by', $company->id)
            ->where('client_id', $client->id)
            ->get();

        if ($cases->isEmpty()) return;

        $case = $cases->random();
        
        // Create time entries
        for ($i = 0; $i < rand(2, 5); $i++) {
            \App\Models\TimeEntry::create([
                'case_id' => $case->id,
                'user_id' => $company->id,
                'created_by' => $company->id,
                'description' => 'Legal consultation and case review',
                'hours' => rand(1, 8),
                'billable_rate' => rand(100, 300),
                'is_billable' => true,
                'status' => 'approved',
                'entry_date' => now()->subDays(rand(1, 30)),
            ]);
        }

        // Create expenses
        $expenseCategory = \App\Models\ExpenseCategory::where('created_by', $company->id)->first();
        if ($expenseCategory) {
            for ($i = 0; $i < rand(1, 3); $i++) {
                \App\Models\Expense::create([
                    'case_id' => $case->id,
                    'created_by' => $company->id,
                    'expense_category_id' => $expenseCategory->id,
                    'description' => 'Court filing fees and documentation',
                    'amount' => rand(50, 500),
                    'is_billable' => true,
                    'is_approved' => true,
                    'expense_date' => now()->subDays(rand(1, 30)),
                ]);
            }
        }
    }

    private function createInvoiceForClient($company, $client)
    {
        $cases = \App\Models\CaseModel::where('created_by', $company->id)
            ->where('client_id', $client->id)
            ->get();

        if ($cases->isEmpty()) return;

        $case = $cases->random();
        
        $timeEntries = \App\Models\TimeEntry::where('case_id', $case->id)
            ->where('created_by', $company->id)
            ->whereNull('invoice_id')
            ->where('is_billable', true)
            ->where('status', 'approved')
            ->get();
            
        $expenses = \App\Models\Expense::where('case_id', $case->id)
            ->where('created_by', $company->id)
            ->whereNull('invoice_id')
            ->where('is_billable', true)
            ->where('is_approved', true)
            ->get();
        
        $lineItems = [];
        
        foreach ($timeEntries as $entry) {
            $lineItems[] = [
                'type' => 'time',
                'description' => $entry->description,
                'quantity' => $entry->hours,
                'rate' => $entry->billable_rate,
                'amount' => $entry->hours * $entry->billable_rate
            ];
        }
        
        foreach ($expenses as $expense) {
            $lineItems[] = [
                'type' => 'expense',
                'description' => $expense->description,
                'quantity' => 1,
                'rate' => $expense->amount,
                'amount' => $expense->amount
            ];
        }
        
        if (empty($lineItems)) return;
        
        $subtotal = collect($lineItems)->sum('amount');
        $taxRate = $client->tax_rate ?? 10;
        $taxAmount = $subtotal * ($taxRate / 100);
        $totalAmount = $subtotal + $taxAmount;
        
        $currencyId = \App\Models\ClientBillingCurrency::where('created_by', $company->id)->first()?->id;
        
        $invoiceDate = now()->subDays(rand(1, 30));
        $statuses = ['draft', 'sent', 'paid', 'overdue'];
        
        $invoice = Invoice::create([
            'created_by' => $company->id,
            'client_id' => $client->id,
            'case_id' => $case->id,
            'currency_id' => $currencyId,
            'subtotal' => round($subtotal, 2),
            'tax_amount' => round($taxAmount, 2),
            'total_amount' => round($totalAmount, 2),
            'status' => $statuses[array_rand($statuses)],
            'invoice_date' => $invoiceDate,
            'due_date' => $invoiceDate->copy()->addDays(30),
            'notes' => 'Legal services for ' . $client->name,
            'line_items' => $lineItems,
        ]);
        
        // Link time entries and expenses to invoice
        $timeEntries->each(fn($entry) => $entry->update(['invoice_id' => $invoice->id]));
        $expenses->each(fn($expense) => $expense->update(['invoice_id' => $invoice->id]));
        
        // Create payment for paid invoices
        if ($invoice->status === 'paid') {
            \App\Models\Payment::create([
                'invoice_id' => $invoice->id,
                'amount' => $invoice->total_amount,
                'payment_date' => $invoice->invoice_date->addDays(rand(1, 15)),
                'payment_method' => collect(['credit_card', 'bank_transfer', 'check'])->random(),
                'notes' => 'Payment for invoice #' . $invoice->invoice_number,
                'created_by' => $company->id,
            ]);
        }
    }
}