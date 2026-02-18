<?php

namespace App\Http\Controllers;

use App\Models\KnowledgeArticle;
use App\Models\ResearchCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KnowledgeArticleController extends Controller
{
    public function index(Request $request)
    {
        $query = KnowledgeArticle::withPermissionCheck()
            ->with(['category', 'creator']);

        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                    ->orWhere('content', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->has('category_id') && $request->category_id !== 'all') {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('is_public') && $request->is_public !== 'all') {
            $query->where('is_public', $request->is_public === '1');
        }

        if ($request->has('sort_field') && !empty($request->sort_field)) {
            $query->orderBy($request->sort_field, $request->sort_direction ?? 'asc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $articles = $query->paginate($request->per_page ?? 10);

        $categories = ResearchCategory::where('created_by', createdBy())
            ->where('status', 'active')
            ->get(['id', 'name']);

        return Inertia::render('legal-research/knowledge/index', [
            'articles' => $articles,
            'categories' => $categories,
            'filters' => $request->all(['search', 'category_id', 'status', 'is_public', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'category_id' => 'nullable|exists:research_categories,id',
            'tags' => 'nullable|array',
            'is_public' => 'nullable|boolean',
            'status' => 'nullable|in:draft,published,archived',
        ]);

        if ($validated['category_id']) {
            $category = ResearchCategory::where('id', $validated['category_id'])
                ->where('created_by', createdBy())
                ->first();
            if (!$category) {
                return redirect()->back()->with('error', 'Invalid category selection.');
            }
        }

        $validated['created_by'] = createdBy();
        $validated['status'] = $validated['status'] ?? 'draft';
        $validated['is_public'] = $validated['is_public'] ?? false;

        KnowledgeArticle::create($validated);

        return redirect()->back()->with('success', 'Knowledge article created successfully.');
    }

    public function update(Request $request, $articleId)
    {
        $article = KnowledgeArticle::where('id', $articleId)->where('created_by', createdBy())->first();

        if (!$article) {
            return redirect()->back()->with('error', 'Knowledge article not found.');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'category_id' => 'nullable|exists:research_categories,id',
            'tags' => 'nullable|array',
            'is_public' => 'nullable|boolean',
            'status' => 'nullable|in:draft,published,archived',
        ]);

        if ($validated['category_id']) {
            $category = ResearchCategory::where('id', $validated['category_id'])
                ->where('created_by', createdBy())
                ->first();
            if (!$category) {
                return redirect()->back()->with('error', 'Invalid category selection.');
            }
        }

        $article->update($validated);

        return redirect()->back()->with('success', 'Knowledge article updated successfully.');
    }

    public function destroy($articleId)
    {
        $article = KnowledgeArticle::where('id', $articleId)->where('created_by', createdBy())->first();

        if (!$article) {
            return redirect()->back()->with('error', 'Knowledge article not found.');
        }

        $article->delete();

        return redirect()->back()->with('success', 'Knowledge article deleted successfully.');
    }

    public function publish($articleId)
    {
        $article = KnowledgeArticle::where('id', $articleId)->where('created_by', createdBy())->first();

        if (!$article) {
            return redirect()->back()->with('error', 'Knowledge article not found.');
        }

        $article->status = $article->status === 'published' ? 'draft' : 'published';
        $article->save();

        return redirect()->back()->with('success', 'Knowledge article status updated successfully.');
    }
}