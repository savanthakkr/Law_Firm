<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\DocumentCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    public function index(Request $request)
    {
        $query = Document::withPermissionCheck()
            ->with(['category', 'creator']);

        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%')
                    ->orWhereHas('category', function ($categoryQuery) use ($request) {
                        $categoryQuery->where('name', 'like', '%' . $request->search . '%');
                    });
            });
        }

        if ($request->has('category_id') && !empty($request->category_id) && $request->category_id !== 'all') {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('status') && !empty($request->status) && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('confidentiality') && !empty($request->confidentiality) && $request->confidentiality !== 'all') {
            $query->where('confidentiality', $request->confidentiality);
        }

        if ($request->has('sort_field') && !empty($request->sort_field)) {
            $query->orderBy($request->sort_field, $request->sort_direction ?? 'asc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $documents = $query->paginate($request->per_page ?? 10);

        $categories = DocumentCategory::withPermissionCheck()
            ->where('status', 'active')
            ->get(['id', 'name']);

        return Inertia::render('document-management/documents/index', [
            'documents' => $documents,
            'categories' => $categories,
            'filters' => $request->all(['search', 'category_id', 'status', 'confidentiality', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    public function show(Request $request, $documentId)
    {
        $document = Document::with(['category', 'creator'])
            ->withPermissionCheck()
            ->where('id', $documentId)
            ->first();

        if (!$document) {
            return redirect()->route('document-management.documents.index')
                ->with('error', 'Document not found.');
        }

        $latestVersion = \App\Models\DocumentVersion::where('document_id', $documentId)
            ->orderBy('version_number', 'desc')
            ->first();

        // Get document comments (read-only)
        $comments = \App\Models\DocumentComment::with(['creator'])
            ->where('document_id', $documentId)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Get document permissions (read-only)
        $permissions = \App\Models\DocumentPermission::with(['user', 'creator'])
            ->where('document_id', $documentId)
            ->active()
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('document-management/documents/show', [
            'document' => $document,
            'latestVersion' => $latestVersion,
            'comments' => $comments,
            'permissions' => $permissions,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:document_categories,id',
            'file' => 'required|string',
            'status' => 'nullable|in:draft,review,final,archived',
            'confidentiality' => 'nullable|in:public,internal,confidential,restricted',
            'tags' => 'nullable|array',
        ]);

        // Verify category belongs to current company
        $category = DocumentCategory::where('id', $validated['category_id'])
            ->where('created_by', createdBy())
            ->first();

        if (!$category) {
            return redirect()->back()->with('error', 'Invalid category selection.');
        }

        $validated['file_path'] = $validated['file'];
        $validated['created_by'] = createdBy();
        $validated['status'] = $validated['status'] ?? 'draft';
        $validated['confidentiality'] = $validated['confidentiality'] ?? 'internal';
        unset($validated['file']);

        Document::create($validated);

        return redirect()->back()->with('success', 'Document uploaded successfully.');
    }

    public function update(Request $request, $documentId)
    {
        $document = Document::withPermissionCheck()
            ->where('id', $documentId)
            ->first();

        if (!$document) {
            return redirect()->back()->with('error', 'Document not found.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:document_categories,id',
            'status' => 'nullable|in:draft,review,final,archived',
            'confidentiality' => 'nullable|in:public,internal,confidential,restricted',
            'tags' => 'nullable|array',
        ]);

        // Verify category belongs to current company
        $category = DocumentCategory::where('id', $validated['category_id'])
            ->where('created_by', createdBy())
            ->first();

        if (!$category) {
            return redirect()->back()->with('error', 'Invalid category selection.');
        }

        $document->update($validated);

        return redirect()->back()->with('success', 'Document updated successfully.');
    }

    public function destroy($documentId)
    {
        $document = Document::withPermissionCheck()
            ->where('id', $documentId)
            ->first();

        if (!$document) {
            return redirect()->back()->with('error', 'Document not found.');
        }

        // Delete file from storage
        if ($document->file_path && Storage::disk('public')->exists(str_replace('/storage/', '', $document->file_path))) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $document->file_path));
        }

        $document->delete();

        return redirect()->back()->with('success', 'Document deleted successfully.');
    }

    public function download($documentId)
    {
        $document = Document::withPermissionCheck()
            ->where('id', $documentId)
            ->first();

        if (!$document) {
            return redirect()->back()->with('error', 'Document not found.');
        }

        $filePath = str_replace('/storage/', '', $document->file_path);
        
        if (!Storage::disk('public')->exists($filePath)) {
            return redirect()->back()->with('error', 'File not found.');
        }

        return Storage::disk('public')->download($filePath, $document->file_name);
    }

    public function apiDownload($documentId)
    {
        $document = Document::withPermissionCheck()
            ->where('id', $documentId)
            ->first();

        if (!$document) {
            return response()->json(['error' => 'Document not found'], 404);
        }

        $filePath = str_replace('/storage/', '', $document->file_path);
        
        if (!Storage::disk('public')->exists($filePath)) {
            return response()->json(['error' => 'File not found'], 404);
        }

        return Storage::disk('public')->download($filePath, $document->file_name);
    }
}