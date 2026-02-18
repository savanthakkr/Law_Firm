<?php

namespace App\Http\Controllers;

use App\Models\ClientType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ClientTypeController extends Controller
{
    public function index(Request $request)
    {
        $query = ClientType::withPermissionCheck()
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

        $clientTypes = $query->paginate($request->per_page ?? 10);

        return Inertia::render('clients/client-types/index', [
            'clientTypes' => $clientTypes,
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

        // Check if client type with same name already exists for this company
        $exists = ClientType::where('name', $validated['name'])
            ->where('created_by', createdBy())
            ->exists();

        if ($exists) {
            return redirect()->back()->with('error', 'Client type with this name already exists.');
        }

        ClientType::create($validated);

        return redirect()->back()->with('success', 'Client type created successfully.');
    }

    public function update(Request $request, $clientTypeId)
    {
        $clientType = ClientType::where('id', $clientTypeId)
            ->where('created_by', createdBy())
            ->first();

        if ($clientType) {
            try {
                $validated = $request->validate([
                    'name' => 'required|string|max:255',
                    'description' => 'nullable|string',
                    'status' => 'nullable|in:active,inactive',
                ]);

                // Check if client type with same name already exists for this company (excluding current)
                $exists = ClientType::where('name', $validated['name'])
                    ->where('created_by', createdBy())
                    ->where('id', '!=', $clientTypeId)
                    ->exists();

                if ($exists) {
                    return redirect()->back()->with('error', 'Client type with this name already exists.');
                }

                $clientType->update($validated);

                return redirect()->back()->with('success', 'Client type updated successfully');
            } catch (\Exception $e) {
                return redirect()->back()->with('error', $e->getMessage() ?: 'Failed to update client type');
            }
        } else {
            return redirect()->back()->with('error', 'Client type not found.');
        }
    }

    public function destroy($clientTypeId)
    {
        $clientType = ClientType::where('id', $clientTypeId)
            ->where('created_by', createdBy())
            ->first();

        if ($clientType) {
            try {
                // Check if client type has clients
                if (class_exists('App\\Models\\Client')) {
                    $clientCount = \App\Models\Client::where('client_type_id', $clientTypeId)->count();
                    if ($clientCount > 0) {
                        return response()->json(['message' => 'Cannot delete client type with assigned clients'], 400);
                    }
                }
                $clientType->delete();
                return redirect()->back()->with('success', 'Client type deleted successfully');
            } catch (\Exception $e) {
                return redirect()->back()->with('error', $e->getMessage() ?: 'Failed to delete client type');
            }
        } else {
            return redirect()->back()->with('error', 'Client type not found.');
        }
    }

    public function toggleStatus($clientTypeId)
    {
        $clientType = ClientType::where('id', $clientTypeId)
            ->where('created_by', createdBy())
            ->first();

        if ($clientType) {
            try {
                $clientType->status = $clientType->status === 'active' ? 'inactive' : 'active';
                $clientType->save();

                return redirect()->back()->with('success', 'Client type status updated successfully');
            } catch (\Exception $e) {
                return redirect()->back()->with('error', $e->getMessage() ?: 'Failed to update client type status');
            }
        } else {
            return redirect()->back()->with('error', 'Client type not found.');
        }
    }
}