<?php

namespace App\Http\Controllers;

use App\Models\BillingRate;
use App\Models\User;
use App\Models\Client;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BillingRateController extends Controller
{
    public function index(Request $request)
    {
        $query = BillingRate::withPermissionCheck()
            ->with(['user', 'client', 'creator'])
            ->where('created_by', createdBy());

        // Handle search
        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('notes', 'like', '%' . $request->search . '%')
                    ->orWhereHas('user', function ($userQuery) use ($request) {
                        $userQuery->where('name', 'like', '%' . $request->search . '%');
                    })
                    ->orWhereHas('client', function ($clientQuery) use ($request) {
                        $clientQuery->where('name', 'like', '%' . $request->search . '%');
                    });
            });
        }

        // Handle user filter
        if ($request->has('user_id') && !empty($request->user_id) && $request->user_id !== 'all') {
            $query->where('user_id', $request->user_id);
        }

        // Handle client filter
        if ($request->has('client_id') && $request->client_id !== 'all') {
            if ($request->client_id === 'null') {
                $query->whereNull('client_id');
            } else {
                $query->where('client_id', $request->client_id);
            }
        }

        // Handle rate type filter
        if ($request->has('rate_type') && !empty($request->rate_type) && $request->rate_type !== 'all') {
            $query->where('rate_type', $request->rate_type);
        }

        // Handle status filter
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Handle sorting
        if ($request->has('sort_field') && !empty($request->sort_field)) {
            $query->orderBy($request->sort_field, $request->sort_direction ?? 'asc');
        } else {
            $query->orderBy('effective_date', 'desc');
        }

        $billingRates = $query->paginate($request->per_page ?? 10);

        // Get users for filter dropdown
        $users = User::where('created_by', createdBy())
            ->whereDoesntHave('roles', function ($q) {
                $q->where('name', 'client');
            })
            ->orWhere('id', createdBy())
            ->get(['id', 'name']);

        // Get clients for filter dropdown
        $clients = Client::where('created_by', createdBy())
            ->get(['id', 'name']);

        return Inertia::render('billing/billing-rates/index', [
            'billingRates' => $billingRates,
            'users' => $users,
            'clients' => $clients,
            'filters' => $request->all(['search', 'user_id', 'client_id', 'rate_type', 'status', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'client_id' => 'nullable|integer',
            'rate_type' => 'required|in:hourly,fixed,contingency',
            'hourly_rate' => 'nullable|numeric|min:0',
            'fixed_amount' => 'nullable|numeric|min:0',
            'contingency_percentage' => 'nullable|numeric|min:0|max:100',
            'effective_date' => 'required|date',
            'end_date' => 'nullable|date|after:effective_date',
            'status' => 'nullable|in:active,inactive',
            'notes' => 'nullable|string',
        ]);

        // Handle empty client_id (convert to null for default rate)
        if (empty($validated['client_id'])) {
            $validated['client_id'] = null;
        }

        $validated['created_by'] = createdBy();
        $validated['status'] = $validated['status'] ?? 'active';

        // Verify user belongs to the current user's company
        $user = User::where('id', $validated['user_id'])
            ->where(function ($q) {
                $q->where('created_by', createdBy())
                    ->orWhere('id', createdBy());
            })
            ->first();

        if (!$user) {
            return redirect()->back()->with('error', 'Invalid user selected.');
        }

        // Verify client belongs to the current user's company if provided
        if (!empty($validated['client_id'])) {
            $client = Client::where('id', $validated['client_id'])
                ->where('created_by', createdBy())
                ->first();

            if (!$client) {
                return redirect()->back()->with('error', 'Invalid client selected.');
            }
        }

        BillingRate::create($validated);

        return redirect()->back()->with('success', 'Billing rate created successfully.');
    }

    public function update(Request $request, $billingRateId)
    {
        $billingRate = BillingRate::where('id', $billingRateId)
            ->where('created_by', createdBy())
            ->first();

        if (!$billingRate) {
            return redirect()->back()->with('error', 'Billing rate not found.');
        }

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'client_id' => 'nullable|integer',
            'rate_type' => 'required|in:hourly,fixed,contingency',
            'hourly_rate' => 'nullable|numeric|min:0',
            'fixed_amount' => 'nullable|numeric|min:0',
            'contingency_percentage' => 'nullable|numeric|min:0|max:100',
            'effective_date' => 'required|date',
            'end_date' => 'nullable|date|after:effective_date',
            'status' => 'nullable|in:active,inactive',
            'notes' => 'nullable|string',
        ]);

        // Handle empty client_id (convert to null for default rate)
        if (empty($validated['client_id'])) {
            $validated['client_id'] = null;
        }

        // Verify user belongs to the current user's company
        $user = User::where('id', $validated['user_id'])
            ->where(function ($q) {
                $q->where('created_by', createdBy())
                    ->orWhere('id', createdBy());
            })
            ->first();

        if (!$user) {
            return redirect()->back()->with('error', 'Invalid user selected.');
        }

        // Verify client belongs to the current user's company if provided
        if (!empty($validated['client_id'])) {
            $client = Client::where('id', $validated['client_id'])
                ->where('created_by', createdBy())
                ->first();

            if (!$client) {
                return redirect()->back()->with('error', 'Invalid client selected.');
            }
        }

        $billingRate->update($validated);

        return redirect()->back()->with('success', 'Billing rate updated successfully.');
    }

    public function destroy($billingRateId)
    {
        $billingRate = BillingRate::where('id', $billingRateId)
            ->where('created_by', createdBy())
            ->first();

        if (!$billingRate) {
            return redirect()->back()->with('error', 'Billing rate not found.');
        }

        $billingRate->delete();

        return redirect()->back()->with('success', 'Billing rate deleted successfully.');
    }

    public function toggleStatus($billingRateId)
    {
        $billingRate = BillingRate::where('id', $billingRateId)
            ->where('created_by', createdBy())
            ->first();

        if (!$billingRate) {
            return redirect()->back()->with('error', 'Billing rate not found.');
        }

        $billingRate->status = $billingRate->status === 'active' ? 'inactive' : 'active';
        $billingRate->save();

        return redirect()->back()->with('success', 'Billing rate status updated successfully.');
    }
}
