<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\DocumentComment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DocumentCommentController extends Controller
{
    public function index(Request $request)
    {
        $query = DocumentComment::query()
            ->with(['document', 'creator'])
            ->withPermissionCheck();

        if ($request->has('document_id') && !empty($request->document_id)) {
            $query->where('document_id', $request->document_id);
        }

        if ($request->has('search') && !empty($request->search)) {
            $query->where('comment_text', 'like', '%' . $request->search . '%');
        }

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('is_resolved', $request->status === 'resolved');
        }

        $query->orderBy('created_at', 'desc');
        $comments = $query->paginate($request->per_page ?? 10);

        $documents = Document::withPermissionCheck()
            ->get(['id', 'name']);

        return Inertia::render('document-management/comments/index', [
            'comments' => $comments,
            'documents' => $documents,
            'filters' => $request->all(['search', 'document_id', 'status', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'document_id' => 'required|exists:documents,id',
            'comment_text' => 'required|string',
        ]);

        $document = Document::withPermissionCheck()
            ->where('id', $validated['document_id'])
            ->first();

        if (!$document) {
            return redirect()->back()->with('error', 'Document not found.');
        }

        $validated['created_by'] = createdBy();

        DocumentComment::create($validated);

        return redirect()->back()->with('success', 'Comment added successfully.');
    }

    public function update(Request $request, $commentId)
    {
        $comment = DocumentComment::withPermissionCheck()
            ->where('id', $commentId)
            ->first();

        if (!$comment) {
            return redirect()->back()->with('error', 'Comment not found.');
        }

        $validated = $request->validate([
            'comment_text' => 'required|string',
        ]);

        $comment->update($validated);

        return redirect()->back()->with('success', 'Comment updated successfully.');
    }

    public function destroy($commentId)
    {
        $comment = DocumentComment::withPermissionCheck()
            ->where('id', $commentId)
            ->first();

        if (!$comment) {
            return redirect()->back()->with('error', 'Comment not found.');
        }

        $comment->delete();

        return redirect()->back()->with('success', 'Comment deleted successfully.');
    }

    public function toggleResolve($commentId)
    {
        $comment = DocumentComment::withPermissionCheck()
            ->where('id', $commentId)
            ->first();

        if (!$comment) {
            return redirect()->back()->with('error', 'Comment not found.');
        }

        $comment->is_resolved = !$comment->is_resolved;
        $comment->save();

        return redirect()->back()->with('success', 'Comment status updated successfully.');
    }
}