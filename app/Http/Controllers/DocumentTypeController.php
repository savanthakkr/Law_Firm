<?php

namespace App\Http\Controllers;

use App\Models\DocumentType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DocumentTypeController extends Controller
{
    public function index(Request $request)
    {
        $query = DocumentType::withPermissionCheck()
            ->with(['creator'])
            ->where('created_by', createdBy());

        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->has('status') && !empty($request->status) && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('sort_field') && !empty($request->sort_field)) {
            $query->orderBy($request->sort_field, $request->sort_direction ?? 'asc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $documentTypes = $query->paginate($request->per_page ?? 10);

        return Inertia::render('advocate/document-types/index', [
            'documentTypes' => $documentTypes,
            'filters' => $request->all(['search', 'status', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'required|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'status' => 'nullable|in:active,inactive',
        ]);

        $validated['created_by'] = createdBy();
        $validated['status'] = $validated['status'] ?? 'active';

        DocumentType::create($validated);

        return redirect()->back()->with('success', 'Document type created successfully.');
    }

    public function update(Request $request, $id)
    {
        $documentType = DocumentType::where('id', $id)
            ->where('created_by', createdBy())
            ->first();

        if (!$documentType) {
            return redirect()->back()->with('error', 'Document type not found.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'required|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'status' => 'nullable|in:active,inactive',
        ]);

        $documentType->update($validated);

        return redirect()->back()->with('success', 'Document type updated successfully.');
    }

    public function destroy($id)
    {
        $documentType = DocumentType::where('id', $id)
            ->where('created_by', createdBy())
            ->first();

        if (!$documentType) {
            return redirect()->back()->with('error', 'Document type not found.');
        }

        $documentType->delete();

        return redirect()->back()->with('success', 'Document type deleted successfully.');
    }

    public function toggleStatus($id)
    {
        $documentType = DocumentType::where('id', $id)
            ->where('created_by', createdBy())
            ->first();

        if (!$documentType) {
            return redirect()->back()->with('error', 'Document type not found.');
        }

        $documentType->status = $documentType->status === 'active' ? 'inactive' : 'active';
        $documentType->save();

        return redirect()->back()->with('success', 'Document type status updated successfully.');
    }
}