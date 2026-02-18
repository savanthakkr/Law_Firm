<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlanController extends Controller
{
    const PLAN_STATUS_ON = 'on';
    const PLAN_STATUS_OFF = 'off';
    const BILLING_CYCLE_MONTHLY = 'monthly';
    const BILLING_CYCLE_YEARLY = 'yearly';
    public function index(Request $request)
    {
        $user = auth()->user();
        
        // Company users see only active plans
        if ($user->type !== 'superadmin') {
            return $this->companyPlansView($request);
        }
        
        // Admin view - validate billing cycle input
        $billingCycle = $request->input('billing_cycle', 'monthly');
        if (!in_array($billingCycle, ['monthly', 'yearly'])) {
            $billingCycle = 'monthly';
        }
        
        $dbPlans = Plan::all();
        $hasDefaultPlan = $dbPlans->where('is_default', true)->count() > 0;
        
        $plans = $dbPlans->map(function ($plan) use ($billingCycle) {
            // Determine features based on plan attributes
            $features = [];
            if ($plan->enable_chatgpt === 'on') $features[] = 'AI Integration';
            
            // Get price based on billing cycle
            $price = $billingCycle === 'yearly' ? $plan->yearly_price : $plan->price;
            
            // Format price with currency symbol
            $formattedPrice = '$' . number_format($price, 2);
            
            // Set duration based on billing cycle
            $duration = $billingCycle === 'yearly' ? 'Yearly' : 'Monthly';
            
            return [
                'id' => $plan->id,
                'name' => $plan->name,
                'price' => $price,
                'formattedPrice' => $formattedPrice,
                'duration' => $duration,
                'description' => $plan->description,
                'trial_days' => $plan->trial_day,
                'features' => $features,
                'stats' => [
                    'users' => $plan->max_users,
                    'cases' => $plan->max_cases,
                    'clients' => $plan->max_clients,
                    'storage' => $plan->storage_limit . ' GB',
                ],
                'status' => $plan->is_plan_enable === 'on',
                'is_default' => $plan->is_default,
                'has_users' => $plan->users()->count() > 0,
                'recommended' => false // Default to false
            ];
        })->toArray();
        
        // Mark the plan with most subscribers as recommended
        $planSubscriberCounts = Plan::withCount('users')->get()->pluck('users_count', 'id');
        $mostSubscribedPlanId = $planSubscriberCounts->keys()->first();
        if ($planSubscriberCounts->isNotEmpty()) {
            $mostSubscribedPlanId = $planSubscriberCounts->keys()->sortByDesc(function($planId) use ($planSubscriberCounts) {
                return $planSubscriberCounts[$planId];
            })->first();
        }
        
        foreach ($plans as &$plan) {
            if ($plan['id'] == $mostSubscribedPlanId && $plan['price'] != '0') {
                $plan['recommended'] = true;
                break;
            }
        }

        return Inertia::render('plans/index', [
            'plans' => $plans,
            'billingCycle' => $billingCycle,
            'hasDefaultPlan' => $hasDefaultPlan,
            'isAdmin' => true
        ]);
    }
    
    /**
     * Toggle plan status
     */
    public function toggleStatus(Plan $plan)
    {
        $plan->is_plan_enable = $plan->is_plan_enable === 'on' ? 'off' : 'on';
        $plan->save();
        
        return back();
    }
    
    /**
     * Show the form for creating a new plan
     */
    public function create()
    {
        $hasDefaultPlan = Plan::where('is_default', true)->exists();
        
        return Inertia::render('plans/create', [
            'hasDefaultPlan' => $hasDefaultPlan
        ]);
    }
    
    /**
     * Store a newly created plan
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:plans',
            'price' => 'required|numeric|min:0',
            'yearly_price' => 'nullable|numeric|min:0',
            'duration' => 'required|string',
            'description' => 'nullable|string',
            'max_users' => 'required|integer|min:0',
            'max_cases' => 'required|integer|min:0',
            'max_clients' => 'required|integer|min:0',
            'storage_limit' => 'required|numeric|min:0',
            'enable_chatgpt' => 'nullable|in:on,off',
            'is_trial' => 'nullable|in:on,off',
            'trial_day' => 'nullable|integer|min:0',
            'is_plan_enable' => 'nullable|in:on,off',
            'is_default' => 'nullable|boolean',
        ]);
        
        // Set default values for nullable fields
        $validated['enable_chatgpt'] = $validated['enable_chatgpt'] ?? 'off';
        $validated['is_trial'] = $validated['is_trial'] ?? null;
        $validated['is_plan_enable'] = $validated['is_plan_enable'] ?? 'on';
        $validated['is_default'] = $validated['is_default'] ?? false;
        
        // If yearly_price is not provided, calculate it as 80% of monthly price * 12
        if (!isset($validated['yearly_price']) || $validated['yearly_price'] === null) {
            $validated['yearly_price'] = $validated['price'] * 12 * 0.8;
        }
        
        try {
            // If this plan is set as default, remove default status from other plans
            if ($validated['is_default']) {
                Plan::where('is_default', true)->update(['is_default' => false]);
            }
            
            // Create the plan
            Plan::create($validated);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => __('Failed to create plan: ') . $e->getMessage()]);
        }
        
        return redirect()->route('plans.index')->with('success', __('Plan created successfully.'));
    }
    
    /**
     * Show the form for editing a plan
     */
    public function edit(Plan $plan)
    {
        $otherDefaultPlanExists = Plan::where('is_default', true)
            ->where('id', '!=', $plan->id)
            ->exists();
            
        return Inertia::render('plans/edit', [
            'plan' => $plan,
            'otherDefaultPlanExists' => $otherDefaultPlanExists
        ]);
    }
    
    /**
     * Update a plan
     */
    public function update(Request $request, Plan $plan)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:plans,name,' . $plan->id,
            'price' => 'required|numeric|min:0',
            'yearly_price' => 'nullable|numeric|min:0',
            'duration' => 'required|string',
            'description' => 'nullable|string',
            'max_users' => 'required|integer|min:0',
            'max_cases' => 'required|integer|min:0',
            'max_clients' => 'required|integer|min:0',
            'storage_limit' => 'required|numeric|min:0',
            'enable_chatgpt' => 'nullable|in:on,off',
            'is_trial' => 'nullable|in:on,off',
            'trial_day' => 'nullable|integer|min:0',
            'is_plan_enable' => 'nullable|in:on,off',
            'is_default' => 'nullable|boolean',
        ]);
        
        // Set default values for nullable fields
        $validated['enable_chatgpt'] = $validated['enable_chatgpt'] ?? 'off';
        $validated['is_trial'] = $validated['is_trial'] ?? null;
        $validated['is_plan_enable'] = $validated['is_plan_enable'] ?? 'on';
        $validated['is_default'] = $validated['is_default'] ?? false;
        
        // If yearly_price is not provided, calculate it as 80% of monthly price * 12
        if (!isset($validated['yearly_price']) || $validated['yearly_price'] === null) {
            $validated['yearly_price'] = $validated['price'] * 12 * 0.8;
        }
        
        try {
            // If this plan is set as default, remove default status from other plans
            if ($validated['is_default'] && !$plan->is_default) {
                Plan::where('is_default', true)->update(['is_default' => false]);
            }
            
            // Update the plan
            $plan->update($validated);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => __('Failed to update plan: ') . $e->getMessage()]);
        }
        
        return redirect()->route('plans.index')->with('success', __('Plan updated successfully.'));
    }
    
    /**
     * Delete a plan
     */
    public function destroy(Plan $plan)
    {
        // Don't allow deleting the default plan
        if ($plan->is_default) {
            return back()->with('error', __('Cannot delete the default plan.'));
        }
        
        $plan->delete();
        
        return redirect()->route('plans.index')->with('success', __('Plan deleted successfully.'));
    }
    
    private function companyPlansView(Request $request)
    {
        $user = auth()->user();
        $billingCycle = $request->input('billing_cycle', 'monthly');
        if (!in_array($billingCycle, ['monthly', 'yearly'])) {
            $billingCycle = 'monthly';
        }
        
        $dbPlans = Plan::where('is_plan_enable', 'on')->get();
        
        // Get user's pending plan requests
        $pendingRequests = \App\Models\PlanRequest::where('user_id', $user->id)
            ->where('status', 'pending')
            ->pluck('plan_id')
            ->toArray();
            
        // Get user's pending subscription orders
        $pendingOrders = \App\Models\PlanOrder::where('user_id', $user->id)
            ->where('status', 'pending')
            ->pluck('plan_id')
            ->toArray();
        
        $plans = $dbPlans->map(function ($plan) use ($billingCycle, $user, $pendingRequests, $pendingOrders) {
            $price = $billingCycle === 'yearly' ? $plan->yearly_price : $plan->price;
            
            $features = [];
            if ($plan->enable_chatgpt === 'on') $features[] = 'AI Integration';
            
            return [
                'id' => $plan->id,
                'name' => $plan->name,
                'price' => $price,
                'formatted_price' => '$' . number_format($price, 2),
                'duration' => $billingCycle === 'yearly' ? 'Yearly' : 'Monthly',
                'description' => $plan->description,
                'trial_days' => $plan->trial_day,
                'features' => $features,
                'stats' => [
                    'users' => $plan->max_users,
                    'cases' => $plan->max_cases,
                    'clients' => $plan->max_clients,
                    'storage' => $plan->storage_limit . ' GB',
                ],
                'is_current' => $user->plan_id == $plan->id,
                'is_trial_available' => $plan->is_trial === 'on' && !$user->is_trial,
                'is_default' => $plan->is_default,
                'has_pending_request' => in_array($plan->id, $pendingRequests),
                'has_pending_order' => in_array($plan->id, $pendingOrders),
                'recommended' => false // Default to false
            ];
        });
        
        // Mark the plan with most subscribers as recommended
        $planSubscriberCounts = Plan::withCount('users')->get()->pluck('users_count', 'id');
        if ($planSubscriberCounts->isNotEmpty()) {
            $mostSubscribedPlanId = $planSubscriberCounts->keys()->sortByDesc(function($planId) use ($planSubscriberCounts) {
                return $planSubscriberCounts[$planId];
            })->first();
            
            $plans = $plans->map(function($plan) use ($mostSubscribedPlanId) {
                if ($plan['id'] == $mostSubscribedPlanId) {
                    $plan['recommended'] = true;
                }
                return $plan;
            });
        }
        
        // Get pending request details for cancel functionality
        $pendingRequestsDetails = \App\Models\PlanRequest::where('user_id', $user->id)
            ->where('status', 'pending')
            ->get()
            ->keyBy('plan_id');
        
        return Inertia::render('plans/index', [
            'plans' => $plans,
            'billingCycle' => $billingCycle,
            'currentPlan' => $user->plan,
            'userTrialUsed' => $user->is_trial,
            'pendingRequests' => $pendingRequestsDetails
        ]);
    }
    
    public function requestPlan(Request $request)
    {
        $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'billing_cycle' => 'required|in:monthly,yearly'
        ]);
        
        $user = auth()->user();
        $plan = Plan::findOrFail($request->plan_id);
        
        // Check if user already has a pending request for this plan
        $existingRequest = \App\Models\PlanRequest::where('user_id', $user->id)
            ->where('plan_id', $plan->id)
            ->where('status', 'pending')
            ->first();
            
        if ($existingRequest) {
            return back()->with('error', __('You already have a pending request for this plan'));
        }
        
        try {
            \App\Models\PlanRequest::create([
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'duration' => $request->billing_cycle,
                'status' => 'pending'
            ]);
            
            return back()->with('success', __('Plan request submitted successfully'));
        } catch (\Exception $e) {
            return back()->withErrors(['error' => __('Failed to submit plan request: ') . $e->getMessage()]);
        }
    }
    
    public function startTrial(Request $request)
    {
        $request->validate([
            'plan_id' => 'required|exists:plans,id'
        ]);
        
        $user = auth()->user();
        $plan = Plan::findOrFail($request->plan_id);
        
        if ($user->is_trial || $plan->is_trial !== 'on') {
            return back()->withErrors(['error' => 'Trial not available']);
        }
        
        try {
            $user->update([
                'plan_id' => $plan->id,
                'is_trial' => 1,
                'trial_day' => $plan->trial_day,
                'trial_expire_date' => now()->addDays($plan->trial_day)
            ]);
            
            return back()->with('success', __('Trial started successfully'));
        } catch (\Exception $e) {
            return back()->withErrors(['error' => __('Failed to start trial: ') . $e->getMessage()]);
        }
    }
    
    public function subscribe(Request $request)
    {
        $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'billing_cycle' => 'required|in:monthly,yearly'
        ]);
        
        $user = auth()->user();
        $plan = Plan::findOrFail($request->plan_id);
        
        // Use the plan's getPriceForCycle method for consistent pricing
        $price = $plan->getPriceForCycle($request->billing_cycle);
        
        // Validate that yearly price exists if yearly billing is selected
        if ($request->billing_cycle === 'yearly' && $plan->yearly_price === null) {
            return back()->withErrors(['error' => __('Yearly billing is not available for this plan')]);
        }
        
        try {
            \App\Models\PlanOrder::create([
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'billing_cycle' => $request->billing_cycle,
                'original_price' => $price,
                'final_price' => $price,
                'status' => 'pending'
            ]);
            
            return back()->with('success', __('Subscription request submitted successfully'));
        } catch (\Exception $e) {
            return back()->withErrors(['error' => __('Failed to create subscription: ') . $e->getMessage()]);
        }
    }
}