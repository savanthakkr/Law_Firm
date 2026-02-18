<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Client;
use App\Models\ClientBillingInfo;
use App\Services\EmailTemplateService;
use Illuminate\Http\Request;

use Inertia\Inertia;

class InvoiceController extends BaseController
{
    public function index(Request $request)
    {
        $query = Invoice::withPermissionCheck()->with(['client', 'creator']);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('invoice_number', 'like', '%' . $request->search . '%')
                  ->orWhereHas('client', function ($clientQuery) use ($request) {
                      $clientQuery->where('name', 'like', '%' . $request->search . '%');
                  });
            });
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->client_id) {
            $query->where('client_id', $request->client_id);
        }

        // Handle sorting
        if ($request->has('sort_field') && !empty($request->sort_field)) {
            $query->orderBy($request->sort_field, $request->sort_direction ?? 'asc');
        } else {
            $query->orderBy('invoice_date', 'desc');
        }

        $invoices = $query->paginate($request->per_page ?? 10);
        $clients = Client::withPermissionCheck()->select('id', 'name')->get();

        return Inertia::render('billing/invoices/index', [
            'invoices' => $invoices,
            'clients' => $clients,
            'filters' => $request->all(['search', 'status', 'client_id', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    public function create()
    {
        $clients = Client::withPermissionCheck()->select('id', 'name', 'tax_rate')
            ->orderBy('name')
            ->get();
        $cases = \App\Models\CaseModel::withPermissionCheck()->with('client:id,name')
            ->whereHas('timeEntries', function($q) {
                $q->where('is_billable', true)->whereNull('invoice_id');
            })
            ->select('id', 'title', 'client_id')
            ->get();
        $templates = \App\Models\EmailTemplate::select('id', 'name')->get();
        $currencies = \App\Models\ClientBillingCurrency::withPermissionCheck()->where('status', true)
            ->select('id', 'name', 'code', 'symbol')
            ->get();
        $timeEntries = \App\Models\TimeEntry::withPermissionCheck()
            ->with('case.client:id,name')
            ->where('is_billable', true)
            ->whereNull('invoice_id')
            ->get();
        $expenses = \App\Models\Expense::withPermissionCheck()
            ->with('category')
            ->unbilled()
            ->get();
            
        // Load client billing info
        $clientBillingInfo = ClientBillingInfo::withPermissionCheck()
            ->select('client_id', 'payment_terms', 'custom_payment_terms', 'currency')
            ->get()
            ->keyBy('client_id');

        return Inertia::render('billing/invoices/create', [
            'clients' => $clients,
            'cases' => $cases,
            'templates' => $templates,
            'currencies' => $currencies,
            'timeEntries' => $timeEntries,
            'expenses' => $expenses,
            'clientBillingInfo' => $clientBillingInfo
        ]);
    }

    public function show(Invoice $invoice)
    {
        $invoice->load(['client', 'case']);
        
        // Get all invoice items: line_items from JSON + linked time entries/expenses
        $invoiceItems = [];
        
        // Add line_items from JSON field (manually added items)
        if ($invoice->line_items) {
            foreach ($invoice->line_items as $item) {
                $invoiceItems[] = [
                    'id' => $item['id'] ?? null,
                    'type' => $item['type'] ?? 'manual',
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'rate' => $item['rate'],
                    'amount' => $item['amount'],
                    'expense_date' => $item['expense_date'] ?? null
                ];
            }
        }
        
        // Add linked time entries and expenses
        $linkedItemsResponse = $this->getCaseTimeEntries($invoice->case_id);
        $linkedItems = $linkedItemsResponse->original->toArray();
        // $invoiceItems = array_merge($invoiceItems, $linkedItems);
        
        // Load client billing info and currencies
        $clientBillingInfo = ClientBillingInfo::withPermissionCheck()
            ->select('client_id', 'currency')
            ->get()
            ->keyBy('client_id');
        $currencies = \App\Models\ClientBillingCurrency::where('status', true)
            ->select('id', 'name', 'code', 'symbol')
            ->get();
            
        return Inertia::render('billing/invoices/show', [
            'invoice' => $invoice,
            'invoiceItems' => $invoiceItems,
            'clientBillingInfo' => $clientBillingInfo,
            'currencies' => $currencies
        ]);
    }

    public function edit(Invoice $invoice)
    {
        $invoice->load(['client', 'case', 'emailTemplate', 'currency']);
        
        $clients = Client::select('id', 'name', 'tax_rate')->get();
        $cases = \App\Models\CaseModel::with('client:id,name')
            ->select('id', 'case_id', 'title', 'client_id')
            ->get();
        $templates = \App\Models\EmailTemplate::select('id', 'name')->get();
        $currencies = \App\Models\ClientBillingCurrency::where('status', true)
            ->select('id', 'name', 'code', 'symbol')
            ->get();
        
        // Load client billing info
        $clientBillingInfo = ClientBillingInfo::withPermissionCheck()
            ->select('client_id', 'currency')
            ->get()
            ->keyBy('client_id');
            
        return Inertia::render('billing/invoices/edit', [
            'clients' => $clients,
            'cases' => $cases,
            'templates' => $templates,
            'currencies' => $currencies,
            'invoice' => $invoice,
            'clientBillingInfo' => $clientBillingInfo
        ]);
    }

    public function store(Request $request)
    {
        // Only company users can create invoices
        if (!auth()->user()->hasRole(['company', 'superadmin'])) {
            return redirect()->back()->with('error', 'Only company users can create invoices.');
        }
        
        $request->validate([
            'client_id' => 'required|exists:clients,id',
            'case_id' => 'nullable|integer',
            'email_template_id' => 'nullable|exists:email_templates,id',
            'currency_id' => 'nullable|exists:client_billing_currencies,id',
            'subtotal' => 'nullable|numeric|min:0',
            'tax_amount' => 'nullable|numeric|min:0',
            'invoice_date' => 'required|date',
            'due_date' => 'required|date|after:invoice_date',
            'notes' => 'nullable|string|max:1000',
            'line_items' => 'nullable|array',
            'line_items.*.description' => 'required|string',
            'line_items.*.quantity' => 'required|numeric|min:0',
            'line_items.*.rate' => 'required|numeric|min:0',
            'line_items.*.amount' => 'required|numeric|min:0',
        ]);

        $taxAmount = $request->tax_amount ?? 0;
        $subtotal = $request->subtotal ?? collect($request->line_items)->sum('amount');
        $totalAmount = $subtotal + $taxAmount;

        Invoice::create([
            'created_by' => createdBy(),
            'client_id' => $request->client_id,
            'case_id' => $request->case_id,
            'currency_id' => $request->currency_id,
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'total_amount' => $totalAmount,
            'status' => 'draft',
            'invoice_date' => $request->invoice_date,
            'due_date' => $request->due_date,
            'notes' => $request->notes,
            'line_items' => $request->line_items,
        ]);

        return redirect()->back()->with('success', 'Invoice created successfully.');
    }

    public function update(Request $request, Invoice $invoice)
    {
        $request->validate([
            'client_id' => 'required|exists:clients,id',
            'case_id' => 'nullable|integer',
            'email_template_id' => 'nullable|exists:email_templates,id',
            'currency_id' => 'nullable|exists:client_billing_currencies,id',
            'subtotal' => 'nullable|numeric|min:0',
            'tax_amount' => 'nullable|numeric|min:0',
            'invoice_date' => 'required|date',
            'due_date' => 'required|date|after:invoice_date',
            'notes' => 'nullable|string|max:1000',
            'line_items' => 'nullable|array',
            'line_items.*.description' => 'required|string',
            'line_items.*.quantity' => 'required|numeric|min:0',
            'line_items.*.rate' => 'required|numeric|min:0',
            'line_items.*.amount' => 'required|numeric|min:0',
        ]);

        $taxAmount = $request->tax_amount ?? 0;
        $subtotal = $request->subtotal ?? collect($request->line_items)->sum('amount');
        $totalAmount = $subtotal + $taxAmount;

        $invoice->update([
            'client_id' => $request->client_id,
            'case_id' => $request->case_id,
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'total_amount' => $totalAmount,
            'invoice_date' => $request->invoice_date,
            'due_date' => $request->due_date,
            'notes' => $request->notes,
            'line_items' => $request->line_items,
        ]);

        return redirect()->back()->with('success', 'Invoice updated successfully.');
    }

    public function destroy(Invoice $invoice)
    {
        $invoice->delete();
        return redirect()->back()->with('success', 'Invoice deleted successfully.');
    }

    public function send(Invoice $invoice)
    {
        $invoice->load(['client', 'case']);

        if ($invoice->client->email) {
            try {
                $emailService = new EmailTemplateService();
                
                // Get client currency symbol
                $currencySymbol = '$'; // Default
                $clientBilling = ClientBillingInfo::where('client_id', $invoice->client_id)->first();
                if ($clientBilling && $clientBilling->currency) {
                    $currency = \App\Models\ClientBillingCurrency::where('code', $clientBilling->currency)
                        ->where('status', true)
                        ->first();
                    if ($currency) {
                        $currencySymbol = $currency->symbol;
                    }
                }
                
                $variables = [
                    '{invoice_number}' => $invoice->invoice_number,
                    '{client_name}' => $invoice->client->name,
                    '{total_amount}' => number_format($invoice->total_amount, 2),
                    '{due_date}' => $invoice->due_date->format('F j, Y'),
                    '{invoice_date}' => $invoice->invoice_date->format('F j, Y'),
                    '{case_title}' => $invoice->case ? $invoice->case->title : 'N/A',
                    '{company_name}' => config('app.name'),
                    '{app_name}' => config('app.name'),
                    '{currency_symbol}' => $currencySymbol,
                    '{theme_color}' => '#3b82f6',
                    '{payment_url}' => $invoice->payment_url
                ];
                
                $emailService->sendTemplateEmailWithLanguage(
                    templateName: 'Invoice Email',
                    variables: $variables,
                    toEmail: $invoice->client->email,
                    toName: $invoice->client->name,
                    language: 'en'
                );
            } catch (\Exception $e) {
                return redirect()->back()->withErrors(['error' => 'Failed to send invoice: ' . $e->getMessage()]);
            }
        }
        
        $invoice->update(['status' => 'sent']);
        return redirect()->back()->with('success', 'Invoice sent successfully.');
    }

    public function generate(Invoice $invoice)
    {
        $invoice->load(['client', 'case', 'creator']);
        
        $companyProfile = \App\Models\CompanyProfile::where('created_by', createdBy())->first();
        
        // Get all invoice items: line_items from JSON + linked time entries/expenses
        $invoiceItems = [];
        
        // Add line_items from JSON field (manually added items)
        if ($invoice->line_items) {
            foreach ($invoice->line_items as $item) {
                $invoiceItems[] = [
                    'id' => $item['id'] ?? null,
                    'type' => $item['type'] ?? 'manual',
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'rate' => $item['rate'],
                    'amount' => $item['amount'],
                    'expense_date' => $item['expense_date'] ?? null
                ];
            }
        }
        
        // Add linked time entries and expenses
        $linkedItemsResponse = $this->getCaseTimeEntries($invoice->case_id);
        $linkedItems = $linkedItemsResponse->original->toArray();
        // $invoiceItems = array_merge($invoiceItems, $linkedItems);
        
        // Load client billing info and currencies
        $clientBillingInfo = ClientBillingInfo::withPermissionCheck()
            ->select('client_id', 'currency')
            ->get()
            ->keyBy('client_id');
        $currencies = \App\Models\ClientBillingCurrency::where('status', true)
            ->select('id', 'name', 'code', 'symbol')
            ->get();
            
        return Inertia::render('billing/invoices/generate', [
            'invoice' => $invoice,
            'companyProfile' => $companyProfile,
            'invoiceItems' => $invoiceItems,
            'clientBillingInfo' => $clientBillingInfo,
            'currencies' => $currencies
        ]);
    }

    public function generateFromTimeEntries(Request $request)
    {
        $request->validate([
            'client_id' => 'required|exists:clients,id',
            'case_id' => 'nullable|exists:cases,id',
            'time_entry_ids' => 'required|array',
            'time_entry_ids.*' => 'exists:time_entries,id',
            'invoice_date' => 'required|date',
            'due_date' => 'required|date|after:invoice_date',
        ]);

        $timeEntries = \App\Models\TimeEntry::whereIn('id', $request->time_entry_ids)
            ->unbilled()
            ->get();

        if ($timeEntries->isEmpty()) {
            return redirect()->back()->with('error', 'No unbilled time entries found.');
        }

        $lineItems = $timeEntries->map(function ($entry) {
            return [
                'description' => $entry->description,
                'quantity' => $entry->hours,
                'rate' => $entry->billable_rate,
                'amount' => $entry->total_amount
            ];
        })->toArray();

        $subtotal = $timeEntries->sum('total_amount');

        $invoice = Invoice::create([
            'created_by' => createdBy(),
            'client_id' => $request->client_id,
            'case_id' => $request->case_id,
            'subtotal' => $subtotal,
            'tax_amount' => 0,
            'total_amount' => $subtotal,
            'status' => 'draft',
            'invoice_date' => $request->invoice_date,
            'due_date' => $request->due_date,
            'line_items' => $lineItems,
        ]);

        // Mark time entries as billed
        $timeEntries->each(function ($entry) use ($invoice) {
            $entry->update(['invoice_id' => $invoice->id]);
        });

        return redirect()->route('billing.invoices.index')
            ->with('success', 'Invoice generated from time entries successfully.');
    }

    public function generateFromTimeAndExpenses(Request $request)
    {
        $request->validate([
            'client_id' => 'required|exists:clients,id',
            'case_id' => 'nullable|exists:cases,id',
            'time_entry_ids' => 'nullable|array',
            'time_entry_ids.*' => 'exists:time_entries,id',
            'expense_ids' => 'nullable|array',
            'expense_ids.*' => 'exists:expenses,id',
            'invoice_date' => 'required|date',
            'due_date' => 'required|date|after:invoice_date',
        ]);

        $lineItems = [];
        $subtotal = 0;

        // Add time entries
        if ($request->time_entry_ids) {
            $timeEntries = \App\Models\TimeEntry::withPermissionCheck()
                ->whereIn('id', $request->time_entry_ids)
                ->unbilled()
                ->get();

            foreach ($timeEntries as $entry) {
                $lineItems[] = [
                    'type' => 'time',
                    'billing_type' => $entry->billing_rate_type,
                    'description' => $entry->description . ' (' . $entry->billing_display . ')',
                    'quantity' => $entry->billing_rate_type === 'fixed' ? 1 : $entry->hours,
                    'rate' => $entry->billing_rate_type === 'fixed' ? $entry->total_amount : $entry->billable_rate,
                    'amount' => $entry->total_amount
                ];
                $subtotal += $entry->total_amount;
            }
        }

        // Add expenses
        if ($request->expense_ids) {
            $expenses = \App\Models\Expense::withPermissionCheck()
                ->whereIn('id', $request->expense_ids)
                ->unbilled()
                ->get();

            foreach ($expenses as $expense) {
                $lineItems[] = [
                    'type' => 'expense',
                    'description' => $expense->description,
                    'quantity' => 1,
                    'rate' => $expense->amount,
                    'amount' => $expense->amount
                ];
                $subtotal += $expense->amount;
            }
        }

        if (empty($lineItems)) {
            return redirect()->back()->with('error', 'No billable items selected.');
        }

        $invoice = Invoice::create([
            'created_by' => createdBy(),
            'client_id' => $request->client_id,
            'case_id' => $request->case_id,
            'subtotal' => $subtotal,
            'tax_amount' => 0,
            'total_amount' => $subtotal,
            'status' => 'draft',
            'invoice_date' => $request->invoice_date,
            'due_date' => $request->due_date,
            'line_items' => $lineItems,
        ]);

        // Mark items as billed
        if (isset($timeEntries) && $timeEntries->count() > 0) {
            foreach ($timeEntries as $entry) {
                $entry->invoice_id = $invoice->id;
                $entry->save();
            }
        }
        if (isset($expenses)) {
            $expenses->each(function ($expense) use ($invoice) {
                $expense->update(['invoice_id' => $invoice->id]);
            });
        }

        return redirect()->route('billing.invoices.index')
            ->with('success', 'Invoice generated successfully.');
    }

    public function getClientCases($clientId)
    {
        $cases = \App\Models\CaseModel::where('client_id', $clientId)
            ->select('id', 'title', 'case_id')
            ->get();
            
        return response()->json($cases);
    }

    public function getCaseTimeEntries($caseId)
    {
        $case = \App\Models\CaseModel::find($caseId);
        if (!$case) {
            return response()->json([]);
        }

        $timeEntries = \App\Models\TimeEntry::withPermissionCheck()
            ->where('case_id', $caseId)
            ->where('is_billable', true)
            ->where('status', 'approved')
            ->with(['case:id,case_id,title'])
            ->select('id', 'case_id', 'client_id', 'description', 'hours', 'billable_rate', 'invoice_id', 'status')
            ->get()
            ->map(function ($entry) {
                return [
                    'id' => $entry->id,
                    'type' => 'time',
                    'case_info' => $entry->case ? $entry->case->case_id . ' - ' . $entry->case->title : 'General',
                    'description' => $entry->description,
                    'quantity' => $entry->hours,
                    'rate' => $entry->billable_rate,
                    'amount' => $entry->hours * $entry->billable_rate,
                    'status' => $entry->status,
                    'invoice_id' => $entry->invoice_id
                ];
            });

        $expenses = \App\Models\Expense::withPermissionCheck()
            ->where('case_id', $caseId)
            ->where('is_billable', 1)
            ->where('is_approved', 1)
            ->with(['category'])
            ->select('id', 'case_id', 'description', 'amount', 'expense_date')
            ->get()
            ->map(function ($expense) {
                return [
                    'id' => $expense->id,
                    'type' => 'expense',
                    'description' => $expense->description,
                    'quantity' => 1,
                    'rate' => $expense->amount,
                    'amount' => $expense->amount,
                    'expense_date' => $expense->expense_date
                ];
            });

        $data = $timeEntries->concat($expenses);
            
        return response()->json($data);
    }

    public function getClientTimeEntries($clientId)
    {
        $timeEntries = \App\Models\TimeEntry::where(function($query) use ($clientId) {
                // Case-specific time entries
                $query->whereHas('case', function($q) use ($clientId) {
                    $q->where('client_id', $clientId);
                })
                // OR general time entries for this client
                ->orWhere('client_id', $clientId);
            })
            ->where('is_billable', true)
            ->where('status', 'approved')
            ->whereNull('invoice_id')
            ->with(['case:id,case_id,title'])
            ->select('id', 'case_id', 'client_id', 'description', 'hours', 'billable_rate')
            ->get()
            ->map(function ($entry) {
                return [
                    'id' => $entry->id,
                    'type' => $entry->case_id ? 'case' : 'general',
                    'case_info' => $entry->case ? $entry->case->case_id . ' - ' . $entry->case->title : 'General',
                    'description' => $entry->description,
                    'quantity' => $entry->hours,
                    'rate' => $entry->billable_rate,
                    'amount' => $entry->hours * $entry->billable_rate
                ];
            });
            
        return response()->json($timeEntries);
    }

    public function getInvoiceItems($invoiceId)
    {
        // Get time entries and expenses linked to this invoice with permission check
        $timeEntries = \App\Models\TimeEntry::withPermissionCheck()
            ->where('invoice_id', $invoiceId)
            ->get()
            ->map(function ($entry) {
                return [
                    'id' => $entry->id,
                    'type' => 'time',
                    'description' => $entry->description,
                    'quantity' => $entry->hours,
                    'rate' => $entry->billable_rate,
                    'amount' => $entry->hours * $entry->billable_rate,
                    'status' => $entry->status
                ];
            });

        $expenses = \App\Models\Expense::withPermissionCheck()
            ->where('invoice_id', $invoiceId)
            ->get()
            ->map(function ($expense) {
                return [
                    'id' => $expense->id,
                    'type' => 'expense',
                    'description' => $expense->description,
                    'quantity' => 1,
                    'rate' => $expense->amount,
                    'amount' => $expense->amount
                ];
            });

        return $timeEntries->concat($expenses)->toArray();
    }
    
    /**
     * Calculate due date based on payment terms
     */
    private function calculateDueDateFromTerms($invoiceDate, $paymentTerms)
    {
        $date = \Carbon\Carbon::parse($invoiceDate);
        
        return match($paymentTerms) {
            'net_15' => $date->addDays(15)->format('Y-m-d'),
            'net_30' => $date->addDays(30)->format('Y-m-d'),
            'net_45' => $date->addDays(45)->format('Y-m-d'),
            'net_60' => $date->addDays(60)->format('Y-m-d'),
            'due_on_receipt' => $date->format('Y-m-d'),
            default => $date->addDays(30)->format('Y-m-d')
        };
    }
}