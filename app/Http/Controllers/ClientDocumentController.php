<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\ClientDocument;
use App\Models\DocumentType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ClientDocumentController extends BaseController
{
    public function index(Request $request)
    {
        $query = ClientDocument::withPermissionCheck()
            ->with(['client', 'creator', 'documentType']);

        // Handle search
        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('document_name', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%')
                    ->orWhereHas('client', function ($clientQuery) use ($request) {
                        $clientQuery->where('name', 'like', '%' . $request->search . '%');
                    });
            });
        }

        // Handle client filter
        if ($request->has('client_id') && !empty($request->client_id) && $request->client_id !== 'all') {
            $query->where('client_id', $request->client_id);
        }

        // Handle document type filter
        if ($request->has('document_type_id') && !empty($request->document_type_id) && $request->document_type_id !== 'all') {
            $query->where('document_type_id', $request->document_type_id);
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

        $documents = $query->paginate($request->per_page ?? 10);

        // Get clients for filter dropdown
        $clients = Client::withPermissionCheck()
            ->where('status', 'active')
            ->get(['id', 'name']);
        
        // Get document types for dropdown
        $documentTypes = DocumentType::withPermissionCheck()
            ->where('status', 'active')
            ->get(['id', 'name', 'color']);

        return Inertia::render('clients/documents/index', [
            'documents' => $documents,
            'clients' => $clients,
            'documentTypes' => $documentTypes,
            'filters' => $request->all(['search', 'client_id', 'document_type_id', 'status', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'document_name' => 'required|string|max:255',
            'file' => 'required|string',
            'document_type_id' => 'required|exists:document_types,id',
            'description' => 'nullable|string',
            'status' => 'nullable|in:active,archived',
        ]);

        $validated['created_by'] = createdBy();
        $validated['status'] = $validated['status'] ?? 'active';
        $validated['file_path'] = $validated['file'];
        unset($validated['file']);

        // Check if client belongs to the current user's company
        $client = Client::where('id', $validated['client_id'])
            ->where('created_by', createdBy())
            ->first();

        if (!$client) {
            return redirect()->back()->with('error', 'Invalid client selected.');
        }

        ClientDocument::create($validated);

        return redirect()->back()->with('success', 'Document uploaded successfully.');
    }

    public function update(Request $request, $documentId)
    {
        $document = ClientDocument::whereHas('client', function ($q) {
                $q->where('created_by', createdBy());
            })
            ->where('id', $documentId)
            ->first();

        if ($document) {
            try {
                $validated = $request->validate([
                    'client_id' => 'required|exists:clients,id',
                    'document_name' => 'required|string|max:255',
                    'file' => 'nullable|string',
                    'document_type_id' => 'required|exists:document_types,id',
                    'description' => 'nullable|string',
                    'status' => 'nullable|in:active,archived',
                ]);

                // Check if client belongs to the current user's company
                $client = Client::where('id', $validated['client_id'])
                    ->where('created_by', createdBy())
                    ->first();

                if (!$client) {
                    return redirect()->back()->with('error', 'Invalid client selected.');
                }
                if (isset($validated['file'])) {
                    $validated['file_path'] = $validated['file'];
                    unset($validated['file']);
                }
                $document->update($validated);

                return redirect()->back()->with('success', 'Document updated successfully');
            } catch (\Exception $e) {
                return redirect()->back()->with('error', $e->getMessage() ?: 'Failed to update document');
            }
        } else {
            return redirect()->back()->with('error', 'Document not found.');
        }
    }

    public function destroy($documentId)
    {
        $document = ClientDocument::whereHas('client', function ($q) {
                $q->where('created_by', createdBy());
            })
            ->where('id', $documentId)
            ->first();

        if ($document) {
            try {
                // Delete file from storage
                if ($document->file_path && Storage::disk('public')->exists(str_replace('/storage/', '', $document->file_path))) {
                    Storage::disk('public')->delete(str_replace('/storage/', '', $document->file_path));
                }

                $document->delete();
                return redirect()->back()->with('success', 'Document deleted successfully');
            } catch (\Exception $e) {
                return redirect()->back()->with('error', $e->getMessage() ?: 'Failed to delete document');
            }
        } else {
            return redirect()->back()->with('error', 'Document not found.');
        }
    }

    public function download($documentId)
    {
        $document = ClientDocument::whereHas('client', function ($q) {
                $q->where('created_by', createdBy());
            })
            ->where('id', $documentId)
            ->first();

        if ($document && $document->file_path) {
            $filePath = str_replace('/storage/', '', $document->file_path);
            
            if (Storage::disk('public')->exists($filePath)) {
                return response()->download(storage_path('app/public/' . $filePath), $document->document_name);
            }
        }

        return redirect()->back()->with('error', 'File not found.');
    }
}