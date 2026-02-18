<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\ClientBillingInfo;
use App\Models\ClientBillingCurrency;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClientBillingInfoController extends Controller
{
    public function index(Request $request)
    {
        $query = ClientBillingInfo::withPermissionCheck()
            ->with(['client', 'creator']);

        // Handle search
        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('billing_contact_name', 'like', '%' . $request->search . '%')
                    ->orWhere('billing_contact_email', 'like', '%' . $request->search . '%')
                    ->orWhereHas('client', function ($clientQuery) use ($request) {
                        $clientQuery->where('name', 'like', '%' . $request->search . '%');
                    });
            });
        }

        // Handle client filter
        if ($request->has('client_id') && !empty($request->client_id) && $request->client_id !== 'all') {
            $query->where('client_id', $request->client_id);
        }

        // Handle payment terms filter
        if ($request->has('payment_terms') && !empty($request->payment_terms) && $request->payment_terms !== 'all') {
            $query->where('payment_terms', $request->payment_terms);
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

        $billingInfo = $query->paginate($request->per_page ?? 10);

        // Get clients for filter dropdown
        $clients = Client::where('created_by', createdBy())
            ->where('status', 'active')
            ->get(['id', 'name']);

        // Get currencies for form dropdown
        $currencies = ClientBillingCurrency::where('created_by', createdBy())
            ->where('status', true)
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'symbol', 'is_default']);

        return Inertia::render('clients/billing/index', [
            'billingInfo' => $billingInfo,
            'clients' => $clients,
            'currencies' => $currencies,
            'filters' => $request->all(['search', 'client_id', 'payment_terms', 'status', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id|unique:client_billing_infos,client_id',
            'billing_address' => 'nullable|string',
            'billing_contact_name' => 'nullable|string|max:255',
            'billing_contact_email' => 'nullable|email|max:255',
            'billing_contact_phone' => 'nullable|string|max:20',
            'payment_terms' => 'required|in:net_15,net_30,net_45,net_60,due_on_receipt,custom',
            'custom_payment_terms' => 'nullable|string|max:255',
            'currency' => 'nullable|exists:client_billing_currencies,code',
            'billing_notes' => 'nullable|string',
            'status' => 'nullable|in:active,suspended,closed',
        ]);

        $validated['created_by'] = createdBy();
        $validated['status'] = $validated['status'] ?? 'active';
        $validated['currency'] = $validated['currency'] ?? 'USD';

        // Check if client belongs to the current user's company
        $client = Client::where('id', $validated['client_id'])
            ->where('created_by', createdBy())
            ->first();

        if (!$client) {
            return redirect()->back()->with('error', 'Invalid client selected.');
        }

        ClientBillingInfo::create($validated);

        return redirect()->back()->with('success', 'Billing information created successfully.');
    }

    public function update(Request $request, $billingId)
    {
        $billing = ClientBillingInfo::whereHas('client', function ($q) {
                $q->where('created_by', createdBy());
            })
            ->where('id', $billingId)
            ->first();

        if ($billing) {
            try {
                $validated = $request->validate([
                    'client_id' => 'required|exists:clients,id|unique:client_billing_infos,client_id,' . $billingId,
                    'billing_address' => 'nullable|string',
                    'billing_contact_name' => 'nullable|string|max:255',
                    'billing_contact_email' => 'nullable|email|max:255',
                    'billing_contact_phone' => 'nullable|string|max:20',
                    'payment_terms' => 'required|in:net_15,net_30,net_45,net_60,due_on_receipt,custom',
                    'custom_payment_terms' => 'nullable|string|max:255',
                    'currency' => 'nullable|exists:client_billing_currencies,code',
                    'billing_notes' => 'nullable|string',
                    'status' => 'nullable|in:active,suspended,closed',
                ]);

                // Check if client belongs to the current user's company
                $client = Client::where('id', $validated['client_id'])
                    ->where('created_by', createdBy())
                    ->first();

                if (!$client) {
                    return redirect()->back()->with('error', 'Invalid client selected.');
                }

                $billing->update($validated);

                return redirect()->back()->with('success', 'Billing information updated successfully');
            } catch (\Exception $e) {
                return redirect()->back()->with('error', $e->getMessage() ?: 'Failed to update billing information');
            }
        } else {
            return redirect()->back()->with('error', 'Billing information not found.');
        }
    }

    public function destroy($billingId)
    {
        $billing = ClientBillingInfo::whereHas('client', function ($q) {
                $q->where('created_by', createdBy());
            })
            ->where('id', $billingId)
            ->first();

        if ($billing) {
            try {
                $billing->delete();
                return redirect()->back()->with('success', 'Billing information deleted successfully');
            } catch (\Exception $e) {
                return redirect()->back()->with('error', $e->getMessage() ?: 'Failed to delete billing information');
            }
        } else {
            return redirect()->back()->with('error', 'Billing information not found.');
        }
    }
}