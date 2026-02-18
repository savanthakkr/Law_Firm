<?php

namespace App\Http\Controllers;

use App\Models\CourtType;
use App\Models\User;
use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use App\Models\CaseType;
use App\Models\CaseStatus;

class CompanyController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query()
            ->where('type', 'company')
            ->with('plan')->orderBy('id', 'asc');
            
        // Apply search filter
        if ($request->has('search') && !empty($request->search)) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }
        
        // Apply status filter
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        
        // Apply date filters
        if ($request->has('start_date') && !empty($request->start_date)) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        
        if ($request->has('end_date') && !empty($request->end_date)) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }
        
        // Apply sorting
        $sortField = $request->input('sort_field', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);
        
        // Get paginated results
        $perPage = $request->input('per_page', 10);
        $companies = $query->paginate($perPage)->withQueryString();
        
        // Transform data for frontend
        $companies->getCollection()->transform(function ($company) {
            return [
                'id' => $company->id,
                'name' => $company->name,
                'email' => $company->email,
                'status' => $company->status,
                'created_at' => $company->created_at,
                'plan_name' => $company->plan ? $company->plan->name : __('No Plan'),
                'plan_expiry_date' => $company->plan_expire_date,
                'appointments_count' => 0, // You can implement this based on your model relationships
            ];
        });
        
        // Get plans for dropdown
        $plans = Plan::all(['id', 'name']);
        
        return Inertia::render('companies/index', [
            'companies' => $companies,
            'plans' => $plans,
            'filters' => $request->only(['search', 'status', 'start_date', 'end_date', 'sort_field', 'sort_direction', 'per_page'])
        ]);
    }
    
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'nullable|string|min:8',
            'status' => 'required|in:active,inactive',
        ]);
        
        $company = new User();
        $company->name = $validated['name'];
        $company->email = $validated['email'];
        
        // Only set password if provided
        if (isset($validated['password'])) {
            $company->password = Hash::make($validated['password']);
        }
        
        $company->type = 'company';
        $company->status = $validated['status'];
        $company->created_by = auth()->id(); // Set creator ID
        // Set company language same as creator (superadmin)
        $creator = auth()->user();
        if ($creator && $creator->lang) {
            $company->lang = $creator->lang;
        }
        
        // Assign default plan (optional – keep this if you still want a plan set)
        $defaultPlan = Plan::where('is_default', true)->first();
        if ($defaultPlan) {
            $company->plan_id = $defaultPlan->id;
            
            // Set plan expiry date based on plan duration
            if ($defaultPlan->duration === 'yearly') {
                $company->plan_expire_date = now()->addYear();
            } else {
                $company->plan_expire_date = now()->addMonth();
            }
            
            // Set plan is active
            $company->plan_is_active = 1;
        }

        // Start 15-day trial for companies created via CompanyController
        $company->is_trial = 1;
        $company->trial_day = 15;
        $company->trial_expire_date = now()->addDays(15);

        $company->save();

        CourtType::insert([
            [
                'name' => 'UK Supreme Court',
                'description' => 'The final court of appeal for all UK cases.',
                'color' => '#f78c3b',
                'status' => 'active',
                'created_by' => $company->id
            ],
            [
                'name' => 'Court of Appeal',
                'description' => 'Hears appeals from lower courts in criminal and civil cases.',
                'color' => '#f78c3b',
                'status' => 'active',
                'created_by' => $company->id
            ],
            [
                'name' => 'High Court (England & Wales)',
                'description' => "Deals with serious civil cases, with divisions including King's Bench, Chancery, and Family.",
                'color' => '#f78c3b',
                'status' => 'active',
                'created_by' => $company->id
            ],
            [
                'name' => 'Crown Court (England & Wales)',
                'description' => 'Hears serious criminal cases (indictable offences).',
                'color' => '#f78c3b',
                'status' => 'active',
                'created_by' => $company->id
            ],
            [
                'name' => 'County Court (England & Wales)',
                'description' => 'Handles most civil disputes.',
                'color' => '#f78c3b',
                'status' => 'active',
                'created_by' => $company->id
            ],
            [
                'name' => "Magistrates' Courts (England & Wales)",
                'description' => 'Deal with less serious criminal cases (summary offences) and family proceedings.',
                'color' => '#f78c3b',
                'status' => 'active',
                'created_by' => $company->id
            ],
            [
                'name' => 'Family Court',
                'description' => 'Hears most family-related cases.',
                'color' => '#f78c3b',
                'status' => 'active',
                'created_by' => $company->id
            ],
            [
                'name' => 'Tribunals',
                'description' => 'Separate system for specific issues (e.g., employment, immigration, social security).',
                'color' => '#f78c3b',
                'status' => 'active',
                'created_by' => $company->id
            ]
        ]);
        
        CaseStatus::insert([
 [
   'name'=>'New',
   'description'=>'Case has been created but not yet reviewed',
   'color'=>'#2563eb',
   'status'=>'active',
   'created_by'=>$company->id
 ],
 [
   'name'=>'Open',
   'description'=>'Case is active and under review',
   'color'=>'#0ea5e9',
   'status'=>'active',
   'created_by'=>$company->id
 ],
 [
   'name'=>'In Progress',
   'description'=>'Work on the case is currently ongoing',
   'color'=>'#f59e0b',
   'status'=>'active',
   'created_by'=>$company->id
 ],
 [
   'name'=>'Under Investigation',
   'description'=>'Case is being analyzed or investigated',
   'color'=>'#a855f7',
   'status'=>'active',
   'created_by'=>$company->id
 ],
 [
   'name'=>'Pending',
   'description'=>'Waiting for client input, documents, or external action',
   'color'=>'#f97316',
   'status'=>'active',
   'created_by'=>$company->id
 ],
 [
   'name'=>'Hearing Scheduled',
   'description'=>'Court hearing date has been fixed',
   'color'=>'#22c55e',
   'status'=>'active',
   'created_by'=>$company->id
 ],
 [
   'name'=>'On Hold',
   'description'=>'Case is temporarily paused',
   'color'=>'#64748b',
   'status'=>'active',
   'created_by'=>$company->id
 ],
 [
   'name'=>'Awaiting Judgment',
   'description'=>'Hearings completed, judgment pending',
   'color'=>'#14b8a6',
   'status'=>'active',
   'created_by'=>$company->id
 ],
 [
   'name'=>'Closed',
   'description'=>'Case is completed and officially closed',
   'color'=>'#dc2626',
   'status'=>'active',
   'created_by'=>$company->id
 ],
]);

CaseType::insert([
 [
  'name'=>'Criminal',
  'description'=>'Prosecutions for criminal offences',
  'color'=>'#ef4444',
  'status'=>'active',
  'created_by'=>$company->id
 ],
 [
  'name'=>'Civil Litigation',
  'description'=>'Contract disputes, negligence, damages',
  'color'=>'#3b82f6',
  'status'=>'active',
  'created_by'=>$company->id
 ],
 [
  'name'=>'Family Law',
  'description'=>'Divorce, child custody, financial remedies',
  'color'=>'#ec4899',
  'status'=>'active',
  'created_by'=>$company->id
 ],
 [
  'name'=>'Employment Tribunal',
  'description'=>'Unfair dismissal, discrimination, redundancy',
  'color'=>'#f59e0b',
  'status'=>'active',
  'created_by'=>$company->id
 ],
 [
  'name'=>'Immigration & Asylum',
  'description'=>'Visa, asylum, deportation matters',
  'color'=>'#22c55e',
  'status'=>'active',
  'created_by'=>$company->id
 ],
 [
  'name'=>'Housing / Landlord & Tenant',
  'description'=>'Evictions, rent disputes, housing claims',
  'color'=>'#0ea5e9',
  'status'=>'active',
  'created_by'=>$company->id
 ],
 [
  'name'=>'Commercial & Corporate',
  'description'=>'Business, shareholder, company disputes',
  'color'=>'#6366f1',
  'status'=>'active',
  'created_by'=>$company->id
 ],
 [
  'name'=>'Personal Injury',
  'description'=>'Road traffic accidents, workplace injuries',
  'color'=>'#14b8a6',
  'status'=>'active',
  'created_by'=>$company->id
 ],
 [
  'name'=>'Judicial Review',
  'description'=>'Challenges to decisions by public bodies',
  'color'=>'#8b5cf6',
  'status'=>'active',
  'created_by'=>$company->id
 ],
 [
  'name'=>'Probate & Wills',
  'description'=>'Inheritance, estate administration, will disputes',
  'color'=>'#64748b',
  'status'=>'active',
  'created_by'=>$company->id
 ],
]);

        // Assign role and settings to the user
        defaultRoleAndSetting($company);
        
        // Trigger email notification
        event(new \App\Events\UserCreated($company, $validated['password'] ?? ''));
        
        // Check for email errors
        if (session()->has('email_error')) {
            return redirect()->back()->with('warning', __('Company created successfully, but welcome email failed: ') . session('email_error'));
        }
        
        return redirect()->back()->with('success', __('Company created successfully'));
    }
    
    public function update(Request $request, User $company)
    {
        // Ensure this is a company type user
        if ($company->type !== 'company') {
            return redirect()->back()->with('error', __('Invalid company record'));
        }
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $company->id,
            'status' => 'required|in:active,inactive',
        ]);
        
        $company->name = $validated['name'];
        $company->email = $validated['email'];
        $company->status = $validated['status'];
        // Only set password if provided
        if (isset($validated['password'])) {
            $company->password = Hash::make($validated['password']);
        }
        
        $company->save();
        
        return redirect()->back()->with('success', __('Company updated successfully'));
    }
    
    public function destroy(User $company)
    {
        // Ensure this is a company type user
        if ($company->type !== 'company') {
            return redirect()->back()->with('error', __('Invalid company record'));
        }
        
        $company->delete();
        
        return redirect()->back()->with('success', __('Company deleted successfully'));
    }
    
    public function resetPassword(Request $request, User $company)
    {
        // Ensure this is a company type user
        if ($company->type !== 'company') {
            return redirect()->back()->with('error', __('Invalid company record'));
        }
        
        $validated = $request->validate([
            'password' => ['required', 'string', 'min:8'],
        ]);
        
        $company->password = Hash::make($validated['password']);
        $company->save();
        
        return redirect()->back()->with('success', __('Password reset successfully'));
    }
    
    public function toggleStatus(User $company)
    {
        // Ensure this is a company type user
        if ($company->type !== 'company') {
            return redirect()->back()->with('error', __('Invalid company record'));
        }
        
        $company->status = $company->status === 'active' ? 'inactive' : 'active';
        $company->save();
        
        return redirect()->back()->with('success', __('Company status updated successfully'));
    }
    
    /**
     * Get available plans for upgrade
     */
    public function getPlans(User $company)
    {
        // Ensure this is a company type user
        if ($company->type !== 'company') {
            return response()->json(['error' => __('Invalid company record')], 400);
        }
        
        $plans = Plan::where('is_plan_enable', 'on')->get();
        
        $formattedPlans = $plans->map(function ($plan) use ($company) {
            // Format features
            $features = [];
            if ($plan->enable_custdomain === 'on') $features[] = __('Custom Domain');
            if ($plan->enable_custsubdomain === 'on') $features[] = __('Subdomain');
            if ($plan->enable_chatgpt === 'on') $features[] = __('AI Integration');
            
            // Calculate yearly price
            $yearlyPrice = $plan->yearly_price;
            if ($yearlyPrice === null) {
                $yearlyPrice = $plan->price * 12 * 0.8;
            }
            
            return [
                'id' => $plan->id,
                'name' => $plan->name,
                'price' => $plan->price,
                'yearly_price' => '$' . number_format($yearlyPrice, 2),
                'duration' => __('Monthly'),
                'description' => $plan->description,
                'features' => $features,
                'business' => $plan->business,
                'max_users' => $plan->max_users,
                'storage_limit' => $plan->storage_limit . ' ' . __('GB'),
                'is_current' => $company->plan_id === $plan->id,
                'is_default' => $plan->is_default
            ];
        });
        
        return response()->json([
            'plans' => $formattedPlans,
            'company' => [
                'id' => $company->id,
                'name' => $company->name,
                'current_plan_id' => $company->plan_id
            ]
        ]);
    }
    
    /**
     * Upgrade company plan
     */
    public function upgradePlan(Request $request, User $company)
    {
        // Ensure this is a company type user
        if ($company->type !== 'company') {
            return back()->with('error', __('Invalid company record'));
        }
        
        $validated = $request->validate([
            'plan_id' => 'required|exists:plans,id',
        ]);
        
        $plan = Plan::find($validated['plan_id']);
        if (!$plan) {
            return back()->with('error', __('Plan not found'));
        }
        
        // Update company plan
        $company->plan_id = $plan->id;
        
        // Set plan expiry date based on plan duration
        if ($plan->duration === 'yearly') {
            $company->plan_expire_date = now()->addYear();
        } else {
            $company->plan_expire_date = now()->addMonth();
        }
        
        // Set plan is active
        $company->plan_is_active = 1;
        
        $company->save();
        
        return back()->with('success', __('Plan upgraded successfully'));
    }
    
    // Business links method removed
}