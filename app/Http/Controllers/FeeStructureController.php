<?php

namespace App\Http\Controllers;

use App\Models\FeeStructure;
use App\Models\Client;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FeeStructureController extends Controller
{
    public function index(Request $request)
    {
        $query = FeeStructure::withPermissionCheck()->with(['client', 'creator', 'feeType']);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('description', 'like', '%' . $request->search . '%')
                  ->orWhereHas('client', function ($clientQuery) use ($request) {
                      $clientQuery->where('name', 'like', '%' . $request->search . '%');
                  });
            });
        }

        if ($request->fee_type) {
            $query->where('fee_type', $request->fee_type);
        }

        if ($request->client_id) {
            $query->where('client_id', $request->client_id);
        }

        if ($request->status !== null) {
            $query->where('is_active', $request->status);
        }

        $feeStructures = $query->orderBy('created_at', 'desc')->paginate(10);
        $clients = Client::select('id', 'name')->get();
        $feeTypes = \App\Models\FeeType::select('id', 'name')->where('status', 'active')->get();

        return Inertia::render('billing/fee-structures/index', [
            'feeStructures' => $feeStructures,
            'clients' => $clients,
            'feeTypes' => $feeTypes,
            'filters' => $request->only(['search', 'fee_type', 'client_id', 'status']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'nullable|string',
            'case_id' => 'nullable|integer',
            'fee_type_id' => 'required|exists:fee_types,id',
            'amount' => 'nullable|numeric|min:0',
            'percentage' => 'nullable|numeric|min:0|max:100',
            'hourly_rate' => 'nullable|numeric|min:0',
            'description' => 'nullable|string|max:1000',
            'effective_date' => 'required|date',
            'end_date' => 'nullable|date|after:effective_date',
        ]);

        // Handle empty client_id or 'none' value (convert to null)
        if (empty($validated['client_id']) || $validated['client_id'] === 'none' || $validated['client_id'] === 'null') {
            $validated['client_id'] = null;
        } else {
            $validated['client_id'] = (int) $validated['client_id'];
        }

        FeeStructure::create([
            'created_by' => createdBy(),
            'client_id' => $validated['client_id'],
            'case_id' => $validated['case_id'] ?? null,
            'fee_type_id' => $validated['fee_type_id'],
            'amount' => $validated['amount'],
            'percentage' => $validated['percentage'],
            'hourly_rate' => $validated['hourly_rate'],
            'description' => $validated['description'],
            'effective_date' => $validated['effective_date'],
            'end_date' => $validated['end_date'],
            'is_active' => true,
        ]);

        return redirect()->back()->with('success', 'Fee structure created successfully.');
    }

    public function update(Request $request, FeeStructure $feeStructure)
    {
        $request->validate([
            'client_id' => 'nullable|exists:clients,id',
            'case_id' => 'nullable|integer',
            'fee_type_id' => 'required|exists:fee_types,id',
            'amount' => 'nullable|numeric|min:0',
            'percentage' => 'nullable|numeric|min:0|max:100',
            'hourly_rate' => 'nullable|numeric|min:0',
            'description' => 'nullable|string|max:1000',
            'effective_date' => 'required|date',
            'end_date' => 'nullable|date|after:effective_date',
        ]);

        $feeStructure->update([
            'client_id' => $request->client_id,
            'case_id' => $request->case_id,
            'fee_type_id' => $request->fee_type_id,
            'amount' => $request->amount,
            'percentage' => $request->percentage,
            'hourly_rate' => $request->hourly_rate,
            'description' => $request->description,
            'effective_date' => $request->effective_date,
            'end_date' => $request->end_date,
        ]);

        return redirect()->back()->with('success', 'Fee structure updated successfully.');
    }

    public function destroy(FeeStructure $feeStructure)
    {
        $feeStructure->delete();
        return redirect()->back()->with('success', 'Fee structure deleted successfully.');
    }

    public function toggleStatus(FeeStructure $feeStructure)
    {
        $feeStructure->update(['is_active' => !$feeStructure->is_active]);
        return redirect()->back()->with('success', 'Fee structure status updated successfully.');
    }
}