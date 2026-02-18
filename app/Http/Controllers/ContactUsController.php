<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ContactUsController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('contacts');
        
        if ($request->has('search')) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('email', 'like', "%{$searchTerm}%")
                  ->orWhere('subject', 'like', "%{$searchTerm}%");
            });
        }
        
        $sortField = $request->input('sort_field', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);
        
        $perPage = $request->input('per_page', 10);
        $contacts = $query->paginate($perPage)->withQueryString();
        
        return Inertia::render('contact-us/index', [
            'contacts' => $contacts,
            'filters' => $request->all(['search', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }
}