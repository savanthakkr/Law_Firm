<?php

namespace App\Http\Controllers;

use App\Models\ClientBillingCurrency;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ClientBillingCurrencyController extends Controller
{
    public function index(Request $request)
    {
        $query = ClientBillingCurrency::withPermissionCheck();

        if ($request->has('search')) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('code', 'like', "%{$searchTerm}%")
                  ->orWhere('symbol', 'like', "%{$searchTerm}%");
            });
        }

        $sortField = $request->input('sort_field', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $perPage = $request->input('per_page', 10);
        $currencies = $query->paginate($perPage)->withQueryString();

        return Inertia::render('client-billing-currencies/index', [
            'currencies' => $currencies,
            'filters' => $request->all(['search', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:client_billing_currencies',
            'symbol' => 'required|string|max:10',
            'description' => 'nullable|string',
            'is_default' => 'boolean',
        ]);

        if ($request->input('is_default')) {
            ClientBillingCurrency::where('created_by', createdBy())
                ->update(['is_default' => false]);
        }

        $validated['created_by'] = Auth::user()->id;
        ClientBillingCurrency::create($validated);

        return redirect()->back()->with('success', 'Currency created successfully.');
    }

    public function update(Request $request, ClientBillingCurrency $clientBillingCurrency)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:client_billing_currencies,code,' . $clientBillingCurrency->id,
            'symbol' => 'required|string|max:10',
            'description' => 'nullable|string',
            'is_default' => 'boolean',
        ]);

        if ($request->input('is_default')) {
            ClientBillingCurrency::where('created_by', Auth::user()->id)
                ->where('id', '!=', $clientBillingCurrency->id)
                ->update(['is_default' => false]);
        }

        $clientBillingCurrency->update($validated);

        return redirect()->back()->with('success', 'Currency updated successfully.');
    }

    public function destroy(ClientBillingCurrency $clientBillingCurrency)
    {
        if ($clientBillingCurrency->is_default) {
            return redirect()->back()->with('error', 'Cannot delete the default currency.');
        }

        $clientBillingCurrency->delete();

        return redirect()->back()->with('success', 'Currency deleted successfully.');
    }

    public function getAllCurrencies()
    {
        $currencies = ClientBillingCurrency::where('created_by', createdBy())
            ->where('status', true)
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'symbol', 'is_default']);
        
        return response()->json($currencies);
    }
}