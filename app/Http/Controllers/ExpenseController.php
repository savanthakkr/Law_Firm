<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\ExpenseCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExpenseController extends BaseController
{
    public function index(Request $request)
    {
        $query = Expense::withPermissionCheck()->with(['category', 'creator', 'case']);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('description', 'like', '%' . $request->search . '%')
                  ->orWhereHas('category', function ($categoryQuery) use ($request) {
                      $categoryQuery->where('name', 'like', '%' . $request->search . '%');
                  });
            });
        }

        if ($request->category_id) {
            $query->where('expense_category_id', $request->category_id);
        }

        if ($request->is_billable !== null) {
            $query->where('is_billable', $request->is_billable);
        }

        if ($request->is_approved !== null) {
            $query->where('is_approved', $request->is_approved);
        }

        $expenses = $query->orderBy('expense_date', 'desc')->paginate(10);
        $categories = ExpenseCategory::select('id', 'name')->get();
        $cases = \App\Models\CaseModel::withPermissionCheck()->select('id', 'case_id', 'title')->get();

        return Inertia::render('billing/expenses/index', [
            'expenses' => $expenses,
            'categories' => $categories,
            'cases' => $cases,
            'filters' => $request->only(['search', 'category_id', 'is_billable', 'is_approved']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'case_id' => 'nullable|exists:cases,id',
            'expense_category_id' => 'required|exists:expense_categories,id',
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'expense_date' => 'required|date',
            'is_billable' => 'boolean',
            'notes' => 'nullable|string|max:1000',
        ]);

        Expense::create([
            'created_by' => createdBy(),
            'case_id' => $request->case_id,
            'expense_category_id' => $request->expense_category_id,
            'description' => $request->description,
            'amount' => $request->amount,
            'expense_date' => $request->expense_date,
            'is_billable' => $request->boolean('is_billable', true),
            'is_approved' => false,
            'notes' => $request->notes,
        ]);

        return redirect()->back()->with('success', 'Expense created successfully.');
    }

    public function update(Request $request, Expense $expense)
    {
        $request->validate([
            'case_id' => 'nullable|exists:cases,id',
            'expense_category_id' => 'required|exists:expense_categories,id',
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'expense_date' => 'required|date',
            'is_billable' => 'required|in:true,false,1,0',
            'notes' => 'nullable|string|max:1000',
        ]);

        $expense->update([
            'case_id' => $request->case_id,
            'expense_category_id' => $request->expense_category_id,
            'description' => $request->description,
            'amount' => $request->amount,
            'expense_date' => $request->expense_date,
            'is_billable' => filter_var($request->is_billable, FILTER_VALIDATE_BOOLEAN),
            'notes' => $request->notes,
        ]);

        return redirect()->back()->with('success', 'Expense updated successfully.');
    }

    public function destroy(Expense $expense)
    {
        $expense->delete();
        return redirect()->back()->with('success', 'Expense deleted successfully.');
    }

    public function approve(Expense $expense)
    {
        $expense->update(['is_approved' => !$expense->is_approved]);
        return redirect()->back()->with('success', 'Expense approval status updated successfully.');
    }
}