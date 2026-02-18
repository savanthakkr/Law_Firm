<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\ClientType;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ClientController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $query = Client::withPermissionCheck()
            ->with(['clientType', 'creator']);

        // Handle search
        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('email', 'like', '%' . $request->search . '%')
                    ->orWhere('phone', 'like', '%' . $request->search . '%')
                    ->orWhere('client_id', 'like', '%' . $request->search . '%')
                    ->orWhere('company_name', 'like', '%' . $request->search . '%');
            });
        }

        // Handle client type filter
        if ($request->has('client_type_id') && !empty($request->client_type_id) && $request->client_type_id !== 'all') {
            $query->where('client_type_id', $request->client_type_id);
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

        $clients = $query->paginate($request->per_page ?? 10);

        // Get client types for filter dropdown
        $clientTypes = ClientType::withPermissionCheck()
            ->where('status', 'active')
            ->get(['id', 'name']);
            
        // Get plan limits for clients (same pattern as UserController)
        $authUser = auth()->user();
        $planLimits = null;
        if ($authUser->type === 'company' && $authUser->plan) {
            $currentClients = Client::where('created_by', $authUser->id)->count();
            $planLimits = [
                'current_clients' => $currentClients,
                'max_clients' => $authUser->plan->max_clients,
                'can_create' => $currentClients < $authUser->plan->max_clients
            ];
        }
        elseif ($authUser->type !== 'superadmin' && $authUser->created_by) {
            $companyUser = User::find($authUser->created_by);
            if ($companyUser && $companyUser->type === 'company' && $companyUser->plan) {
                $currentClients = Client::where('created_by', $companyUser->id)->count();
                $planLimits = [
                    'current_clients' => $currentClients,
                    'max_clients' => $companyUser->plan->max_clients,
                    'can_create' => $currentClients < $companyUser->plan->max_clients
                ];
            }
        }

        return Inertia::render('clients/index', [
            'clients' => $clients,
            'clientTypes' => $clientTypes,
            'planLimits' => $planLimits,
            'filters' => $request->all(['search', 'client_type_id', 'status', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        // Check client limit (same pattern as UserController)
        $authUser = auth()->user();
        if ($authUser->type === 'company' && $authUser->plan) {
            $currentClients = Client::where('created_by', $authUser->id)->count();
            $maxClients = $authUser->plan->max_clients;
            
            if ($currentClients >= $maxClients) {
                return redirect()->back()->with('error', __('Client limit exceeded. Your plan allows maximum :max clients. Please upgrade your plan.', ['max' => $maxClients]));
            }
        }
        elseif ($authUser->type !== 'superadmin' && $authUser->created_by) {
            $companyUser = User::find($authUser->created_by);
            if ($companyUser && $companyUser->type === 'company' && $companyUser->plan) {
                $currentClients = Client::where('created_by', $companyUser->id)->count();
                $maxClients = $companyUser->plan->max_clients;
                
                if ($currentClients >= $maxClients) {
                    return redirect()->back()->with('error', __('Client limit exceeded. Your company plan allows maximum :max clients. Please contact your administrator.', ['max' => $maxClients]));
                }
            }
        }
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'password' => 'nullable|string|min:6',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'client_type_id' => 'required|exists:client_types,id',
            'status' => 'nullable|in:active,inactive',
            'company_name' => 'nullable|string|max:255',
            'tax_id' => 'nullable|string|max:50',
            'tax_rate' => 'nullable|numeric|min:0|max:100',
            'date_of_birth' => 'nullable|date',
            'notes' => 'nullable|string',
            'referral_source' => 'nullable|string|max:255',
        ]);

        $validated['created_by'] = createdBy();
        $validated['status'] = $validated['status'] ?? 'active';

        // Check if client type belongs to the current user's company
        $clientType = ClientType::where('id', $validated['client_type_id'])
            ->where('created_by', createdBy())
            ->first();

        if (!$clientType) {
            return redirect()->back()->with('error', 'Invalid client type selected.');
        }

        // Check if client with same email already exists for this company
        if (!empty($validated['email'])) {
            $exists = Client::where('email', $validated['email'])
                ->where('created_by', createdBy())
                ->exists();

            if ($exists) {
                return redirect()->back()->with('error', 'Client with this email already exists.');
            }
        }

        $client = Client::create($validated);

        // Create user account for client if email and password provided
        if (!empty($validated['email']) && !empty($validated['password'])) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
                'type' => 'client',
                'created_by' => createdBy()
            ]);
            
            // Assign client role
            $clientRole = \Spatie\Permission\Models\Role::where('name', 'client')->first();
            if ($clientRole) {
                $user->assignRole($clientRole);
            }
        }

        return redirect()->back()->with('success', 'Client created successfully.');
    }

    public function update(Request $request, $clientId)
    {
        $client = Client::withPermissionCheck()
            ->where('id', $clientId)
            ->first();

        if ($client) {
            try {
                $validated = $request->validate([
                    'name' => 'required|string|max:255',
                    'email' => 'nullable|email|max:255',
                    'phone' => 'nullable|string|max:20',
                    'address' => 'nullable|string',
                    'client_type_id' => 'required|exists:client_types,id',
                    'status' => 'nullable|in:active,inactive',
                    'company_name' => 'nullable|string|max:255',
                    'tax_id' => 'nullable|string|max:50',
                    'tax_rate' => 'nullable|numeric|min:0|max:100',
                    'date_of_birth' => 'nullable|date',
                    'notes' => 'nullable|string',
                    'referral_source' => 'nullable|string|max:255',
                ]);

                // Check if client type belongs to the current user's company
                $clientType = ClientType::withPermissionCheck()
                    ->where('id', $validated['client_type_id'])
                    ->first();

                if (!$clientType) {
                    return redirect()->back()->with('error', 'Invalid client type selected.');
                }

                // Check if client with same email already exists for this company (excluding current)
                if (!empty($validated['email'])) {
                    $exists = Client::where('email', $validated['email'])
                        ->where('created_by', createdBy())
                        ->where('id', '!=', $clientId)
                        ->exists();

                    if ($exists) {
                        return redirect()->back()->with('error', 'Client with this email already exists.');
                    }
                }

                $client->update($validated);

                return redirect()->back()->with('success', 'Client updated successfully');
            } catch (\Exception $e) {
                return redirect()->back()->with('error', $e->getMessage() ?: 'Failed to update client');
            }
        } else {
            return redirect()->back()->with('error', 'Client not found.');
        }
    }

    public function show($clientId)
    {
        $client = Client::withPermissionCheck()
            ->with(['clientType', 'creator', 'billingInfo'])
            ->where('id', $clientId)
            ->first();

        // Load currency name if billing info exists
        if ($client && $client->billingInfo && $client->billingInfo->currency) {
            $currency = \App\Models\ClientBillingCurrency::find($client->billingInfo->currency);
            $client->billingInfo->currency_name = $currency ? $currency->name : null;
            $client->billingInfo->currency_code = $currency ? $currency->code : null;
            $client->billingInfo->currency_symbol = $currency ? $currency->symbol : null;
        }

        $documents = \App\Models\ClientDocument::withPermissionCheck()
            ->where('client_id', $clientId)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('clients/show', [
            'client' => $client,
            'documents' => $documents,
        ]);
    }

    public function destroy($clientId)
    {
        $client = Client::withPermissionCheck()
            ->where('id', $clientId)
            ->first();

        if ($client) {
            try {
                $client->delete();
                return redirect()->back()->with('success', 'Client deleted successfully');
            } catch (\Exception $e) {
                return redirect()->back()->with('error', $e->getMessage() ?: 'Failed to delete client');
            }
        } else {
            return redirect()->back()->with('error', 'Client not found.');
        }
    }

    public function toggleStatus($clientId)
    {
        $client = Client::withPermissionCheck()
            ->where('id', $clientId)
            ->first();

        if ($client) {
            try {
                $client->status = $client->status === 'active' ? 'inactive' : 'active';
                $client->save();

                return redirect()->back()->with('success', 'Client status updated successfully');
            } catch (\Exception $e) {
                return redirect()->back()->with('error', $e->getMessage() ?: 'Failed to update client status');
            }
        } else {
            return redirect()->back()->with('error', 'Client not found.');
        }
    }

    public function resetPassword(Request $request, $clientId)
    {
        // Check permission
        if (!auth()->user()->can('reset-client-password')) {
            return redirect()->back()->with('error', 'You do not have permission to reset client passwords.');
        }

        $request->validate([
            'password' => 'required|min:6|confirmed',
        ]);

        $client = Client::withPermissionCheck()
            ->where('id', $clientId)
            ->first();

        if (!$client) {
            return redirect()->back()->with('error', 'Client not found.');
        }

        if (empty($client->email)) {
            return redirect()->back()->with('error', 'Client does not have an email address.');
        }

        // Find the user account associated with this client
        $user = User::where('email', $client->email)
            ->where('type', 'client')
            ->where('created_by', createdBy())
            ->first();

        if (!$user) {
            return redirect()->back()->with('error', 'No user account found for this client.');
        }

        try {
            $user->password = \Illuminate\Support\Facades\Hash::make($request->password);
            $user->save();

            return redirect()->back()->with('success', 'Client password reset successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage() ?: 'Failed to reset client password');
        }
    }
}