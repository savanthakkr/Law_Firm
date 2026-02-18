<?php

namespace App\Http\Controllers;

use App\Models\PlanRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PlanRequestController extends BaseController
{
    public function index(Request $request)
    {
        $query = PlanRequest::with(['user', 'plan', 'approver', 'rejector']);

        // Apply search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($userQuery) use ($search) {
                    $userQuery->where('name', 'like', "%{$search}%")
                             ->orWhere('email', 'like', "%{$search}%");
                })
                ->orWhereHas('plan', function ($planQuery) use ($search) {
                    $planQuery->where('name', 'like', "%{$search}%");
                });
            });
        }

        // Apply filters
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $perPage = $request->get('per_page', 10);
        $planRequests = $query->latest()->paginate($perPage);

        return Inertia::render('plans/plan-request', [
            'planRequests' => $planRequests,
            'filters' => $request->only(['search', 'status', 'per_page'])
        ]);
    }

    public function approve(PlanRequest $planRequest)
    {
        $planRequest->update([
            'status' => 'approved',
            'approved_at' => now(),
            'approved_by' => Auth::id(),
        ]);

        // Assign the approved plan to the user
        $planRequest->user->update([
            'plan_id' => $planRequest->plan_id,
            'plan_is_active' => 1,
            'plan_expire_date' => null, // Set to null for unlimited or set specific date
        ]);

        return redirect()->route('plan-requests.index')->with('success', __('Plan request approved successfully!'));
    }

    public function reject(PlanRequest $planRequest)
    {
        $planRequest->update([
            'status' => 'rejected',
            'rejected_at' => now(),
            'rejected_by' => Auth::id(),
        ]);

        return redirect()->route('plan-requests.index')->with('success', __('Plan request rejected successfully!'));
    }

    public function cancel(PlanRequest $planRequest)
    {
        // Only allow user to cancel their own pending requests
        if ($planRequest->user_id !== Auth::id() || $planRequest->status !== 'pending') {
            return back()->with('error', __('Cannot cancel this request.'));
        }

        $planRequest->delete();

        return back()->with('success', __('Plan request cancelled successfully.'));
    }
}
