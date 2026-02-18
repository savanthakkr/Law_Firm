<?php

namespace App\Http\Controllers;

use App\Models\CleTracking;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CleTrackingController extends BaseController
{
    public function index(Request $request)
    {
        $query = CleTracking::withPermissionCheck()
            ->with(['user', 'creator'])
            ->latest();

        // Handle search
        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('course_name', 'like', '%' . $request->search . '%')
                    ->orWhere('provider', 'like', '%' . $request->search . '%')
                    ->orWhere('certificate_number', 'like', '%' . $request->search . '%')
                    ->orWhereHas('user', function ($userQuery) use ($request) {
                        $userQuery->where('name', 'like', '%' . $request->search . '%');
                    });
            });
        }

        // Handle user filter
        if ($request->has('user_id') && !empty($request->user_id) && $request->user_id !== 'all') {
            $query->where('user_id', $request->user_id);
        }

        // Handle status filter
        if ($request->has('status') && !empty($request->status) && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Handle sorting
        if ($request->has('sort_field') && !empty($request->sort_field)) {
            $query->orderBy($request->sort_field, $request->sort_direction ?? 'asc');
        }

        $cleRecords = $query->paginate($request->per_page ?? 10);

        // Get users for filter dropdown
        $users = User::where('created_by', createdBy())
            ->whereDoesntHave('roles', function ($q) {
                $q->where('name', 'client');
            })
            ->where('status', 'active')
            ->get(['id', 'name']);

        return Inertia::render('compliance/professional-licenses/cle-tracking/index', [
            'cleRecords' => $cleRecords,
            'users' => $users,
            'filters' => $request->all(['search', 'user_id', 'status', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'course_name' => 'required|string|max:255',
            'provider' => 'required|string|max:255',
            'credits_earned' => 'required|numeric|min:0|max:999.99',
            'credits_required' => 'nullable|numeric|min:0|max:999.99',
            'completion_date' => 'required|date',
            'expiry_date' => 'nullable|date|after:completion_date',
            'certificate_number' => 'nullable|string|max:255',
            'certificate_file' => 'nullable|string',
            'status' => 'nullable|in:completed,in_progress,expired',
            'description' => 'nullable|string',
        ]);

        $validated['created_by'] = createdBy();
        $validated['status'] = $validated['status'] ?? 'completed';

        // Check if user belongs to the current company or is the current user
        $user = User::where('id', $validated['user_id'])
            ->where(function ($q) {
                $q->where('created_by', createdBy())
                    ->orWhere('id', auth()->id());
            })
            ->first();

        if (!$user) {
            return redirect()->back()->with('error', 'Invalid user selected.');
        }

        CleTracking::create($validated);

        return redirect()->back()->with('success', 'CLE record created successfully.');
    }

    public function update(Request $request, $id)
    {
        $cleRecord = CleTracking::withPermissionCheck()->findOrFail($id);

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'course_name' => 'required|string|max:255',
            'provider' => 'required|string|max:255',
            'credits_earned' => 'required|numeric|min:0|max:999.99',
            'credits_required' => 'nullable|numeric|min:0|max:999.99',
            'completion_date' => 'required|date',
            'expiry_date' => 'nullable|date|after:completion_date',
            'certificate_number' => 'nullable|string|max:255',
            'certificate_file' => 'nullable|string',
            'status' => 'nullable|in:completed,in_progress,expired',
            'description' => 'nullable|string',
        ]);

        // Check if user belongs to the current company or is the current user
        $user = User::where('id', $validated['user_id'])
            ->where(function ($q) {
                $q->where('created_by', createdBy())
                    ->orWhere('id', auth()->id());
            })
            ->first();

        if (!$user) {
            return redirect()->back()->with('error', 'Invalid user selected.');
        }

        $cleRecord->update($validated);

        return redirect()->back()->with('success', 'CLE record updated successfully.');
    }

    public function destroy($id)
    {
        $cleRecord = CleTracking::withPermissionCheck()->findOrFail($id);

        // Delete certificate file
        if ($cleRecord->certificate_file && Storage::disk('public')->exists(str_replace('/storage/', '', $cleRecord->certificate_file))) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $cleRecord->certificate_file));
        }

        $cleRecord->delete();

        return redirect()->back()->with('success', 'CLE record deleted successfully.');
    }

    public function download($id)
    {
        $cleRecord = CleTracking::withPermissionCheck()->findOrFail($id);

        if ($cleRecord->certificate_file) {
            $filePath = str_replace('/storage/', '', $cleRecord->certificate_file);

            if (Storage::disk('public')->exists($filePath)) {
                $originalName = basename($cleRecord->certificate_file);
                $extension = pathinfo($originalName, PATHINFO_EXTENSION);
                $downloadName = 'CLE_Certificate_' . $cleRecord->course_name . '.' . $extension;

                return response()->download(storage_path('app/public/' . $filePath), $downloadName);
            }
        }

        return redirect()->back()->with('error', 'Certificate file not found.');
    }
}
