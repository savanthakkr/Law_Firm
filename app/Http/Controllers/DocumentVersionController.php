<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\DocumentVersion;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class DocumentVersionController extends Controller
{
    public function index(Request $request)
    {
        $query = DocumentVersion::withPermissionCheck()
            ->with(['document', 'creator'])
            ->withPermissionCheck();

        if ($request->has('document_id') && !empty($request->document_id)) {
            $query->where('document_id', $request->document_id);
        }

        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('version_number', 'like', '%' . $request->search . '%')
                    ->orWhere('changes_description', 'like', '%' . $request->search . '%');
            });
        }

        $query->orderBy('created_at', 'desc');
        $versions = $query->paginate($request->per_page ?? 10);

        $documents = Document::where('created_by', createdBy())
            ->get(['id', 'name']);

        return Inertia::render('document-management/versions/index', [
            'versions' => $versions,
            'documents' => $documents,
            'filters' => $request->all(['search', 'document_id', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'document_id' => 'required|exists:documents,id',
            'file' => 'required|string',
            'changes_description' => 'nullable|string',
        ]);

        $document = Document::where('id', $validated['document_id'])
            ->where('created_by', createdBy())
            ->first();

        if (!$document) {
            return redirect()->back()->with('error', 'Document not found.');
        }

        DB::transaction(function () use ($validated, $document, $request) {
            // Mark current version as not current
            DocumentVersion::where('document_id', $document->id)
                ->update(['is_current' => false]);

            // Get next version number
            $lastVersion = DocumentVersion::where('document_id', $document->id)
                ->orderBy('version_number', 'desc')
                ->first();
            
            $versionParts = explode('.', $lastVersion ? $lastVersion->version_number : '0.0');
            $newVersion = $versionParts[0] . '.' . ((int)$versionParts[1] + 1);

            // Create new version
            DocumentVersion::create([
                'document_id' => $document->id,
                'version_number' => $newVersion,
                'file_path' => $validated['file'],
                'changes_description' => $validated['changes_description'] ?? null,
                'is_current' => true,
                'created_by' => createdBy(),
            ]);

            // Update document with new version info
            $document->update([
                'file_path' => $validated['file'],
            ]);
        });

        return redirect()->back()->with('success', 'New version created successfully.');
    }

    public function destroy($versionId)
    {
        $version = DocumentVersion::withPermissionCheck()
            ->where('id', $versionId)
            ->first();

        if (!$version) {
            return redirect()->back()->with('error', 'Version not found.');
        }

        if ($version->is_current) {
            return redirect()->back()->with('error', 'Cannot delete current version.');
        }

        // Delete file from storage
        if ($version->file_path && Storage::disk('public')->exists(str_replace('/storage/', '', $version->file_path))) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $version->file_path));
        }

        $version->delete();

        return redirect()->back()->with('success', 'Version deleted successfully.');
    }

    public function download($versionId)
    {
        $version = DocumentVersion::withPermissionCheck()
            ->where('id', $versionId)
            ->first();

        if (!$version) {
            return redirect()->back()->with('error', 'Version not found.');
        }

        $filePath = str_replace('/storage/', '', $version->file_path);
        
        if (!Storage::disk('public')->exists($filePath)) {
            return redirect()->back()->with('error', 'File not found.');
        }

        return Storage::disk('public')->download($filePath, $version->file_name);
    }

    public function restore($versionId)
    {
        $version = DocumentVersion::withPermissionCheck()
            ->where('id', $versionId)
            ->first();

        if (!$version) {
            return redirect()->back()->with('error', 'Version not found.');
        }

        DB::transaction(function () use ($version) {
            // Mark all versions as not current
            DocumentVersion::where('document_id', $version->document_id)
                ->update(['is_current' => false]);

            // Mark this version as current
            $version->update(['is_current' => true]);

            // Update document with this version's info
            $version->document->update([
                'file_path' => $version->file_path,
            ]);
        });

        return redirect()->back()->with('success', 'Version restored successfully.');
    }
}