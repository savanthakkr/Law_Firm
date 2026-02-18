<?php

namespace App\Http\Controllers;

use App\Models\ExpenseCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExpenseCategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = ExpenseCategory::withPermissionCheck()
            ->with(['creator'])
            ->where('created_by', createdBy());

        // Handle search
        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        // Handle status filter
        if ($request->has('status') && !empty($request->status) && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Handle sorting
        if ($request->has('sort_field') && !empty($request->sort_field)) {
            $query->orderBy($request->sort_field, $request->sort_direction ?? 'asc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $expenseCategories = $query->paginate($request->per_page ?? 10);

        return Inertia::render('billing/expense-categories/index', [
            'expenseCategories' => $expenseCategories,
            'filters' => $request->all(['search', 'status', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|in:active,inactive',
        ]);

        $validated['created_by'] = createdBy();
        $validated['status'] = $validated['status'] ?? 'active';

        // Check if expense category with same name already exists for this company
        $exists = ExpenseCategory::where('name', $validated['name'])
            ->where('created_by', createdBy())
            ->exists();

        if ($exists) {
            return redirect()->back()->with('error', 'Expense category with this name already exists.');
        }

        ExpenseCategory::create($validated);

        return redirect()->back()->with('success', 'Expense category created successfully.');
    }

    public function update(Request $request, $expenseCategoryId)
    {
        $expenseCategory = ExpenseCategory::where('id', $expenseCategoryId)
            ->where('created_by', createdBy())
            ->first();

        if ($expenseCategory) {
            try {
                $validated = $request->validate([
                    'name' => 'required|string|max:255',
                    'description' => 'nullable|string',
                    'status' => 'nullable|in:active,inactive',
                ]);

                // Check if expense category with same name already exists for this company (excluding current)
                $exists = ExpenseCategory::where('name', $validated['name'])
                    ->where('created_by', createdBy())
                    ->where('id', '!=', $expenseCategoryId)
                    ->exists();

                if ($exists) {
                    return redirect()->back()->with('error', 'Expense category with this name already exists.');
                }

                $expenseCategory->update($validated);

                return redirect()->back()->with('success', 'Expense category updated successfully');
            } catch (\Exception $e) {
                return redirect()->back()->with('error', $e->getMessage() ?: 'Failed to update expense category');
            }
        } else {
            return redirect()->back()->with('error', 'Expense category not found.');
        }
    }

    public function destroy($expenseCategoryId)
    {
        $expenseCategory = ExpenseCategory::where('id', $expenseCategoryId)
            ->where('created_by', createdBy())
            ->first();

        if ($expenseCategory) {
            try {
                $expenseCategory->delete();
                return redirect()->back()->with('success', 'Expense category deleted successfully');
            } catch (\Exception $e) {
                return redirect()->back()->with('error', $e->getMessage() ?: 'Failed to delete expense category');
            }
        } else {
            return redirect()->back()->with('error', 'Expense category not found.');
        }
    }

    public function toggleStatus($expenseCategoryId)
    {
        $expenseCategory = ExpenseCategory::where('id', $expenseCategoryId)
            ->where('created_by', createdBy())
            ->first();

        if ($expenseCategory) {
            try {
                $expenseCategory->status = $expenseCategory->status === 'active' ? 'inactive' : 'active';
                $expenseCategory->save();

                return redirect()->back()->with('success', 'Expense category status updated successfully');
            } catch (\Exception $e) {
                return redirect()->back()->with('error', $e->getMessage() ?: 'Failed to update expense category status');
            }
        } else {
            return redirect()->back()->with('error', 'Expense category not found.');
        }
    }
}