<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Plan;
use App\Models\Referral;
use App\Models\ReferralSetting;
use App\Services\EmailTemplateService;
use App\Services\UserService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\CourtType;
use App\Models\CaseType;
use App\Models\CaseStatus;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(Request $request): Response
    {
        $referralCode = $request->get('ref');
        $encryptedPlanId = $request->get('plan');
        $planId = null;
        $referrer = null;

        // Decrypt and validate plan ID
        if ($encryptedPlanId) {
            $planId = $this->decryptPlanId($encryptedPlanId);
            if ($planId && !Plan::find($planId)) {
                $planId = null; // Invalid plan ID
            }
        }

        if ($referralCode) {
            $referrer = User::where('referral_code', $referralCode)
                ->where('type', 'company')
                ->first();
        }

        return Inertia::render('auth/register', [
            'referralCode' => $referralCode,
            'planId' => $planId,
            'referrer' => $referrer ? $referrer->name : null,
            'settings' => settings(),
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $userData = [
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'type' => 'company',
            'is_active' => 1,
            'is_enable_login' => 1,
            'created_by' => 0,
            'plan_is_active' => 0,
        ];

        // Handle referral code
        if ($request->referral_code) {
            $referrer = User::where('referral_code', $request->referral_code)
                ->where('type', 'company')
                ->first();

            if ($referrer) {
                $userData['used_referral_code'] = $request->referral_code;
            }
        }

        $user = User::create($userData);

        // Create default court types for this company
CourtType::insert([
    [
        'name' => 'UK Supreme Court',
        'description' => 'The final court of appeal for all UK cases.',
        'color' => '#f78c3b',
        'status' => 'active',
        'created_by' => $user->id
    ],
    [
        'name' => 'Court of Appeal',
        'description' => 'Hears appeals from lower courts in criminal and civil cases.',
        'color' => '#f78c3b',
        'status' => 'active',
        'created_by' => $user->id
    ],
    [
        'name' => 'High Court (England & Wales)',
        'description' => "Deals with serious civil cases, with divisions including King's Bench, Chancery, and Family.",
        'color' => '#f78c3b',
        'status' => 'active',
        'created_by' => $user->id
    ],
    [
        'name' => 'Crown Court (England & Wales)',
        'description' => 'Hears serious criminal cases.',
        'color' => '#f78c3b',
        'status' => 'active',
        'created_by' => $user->id
    ],
    [
        'name' => 'County Court (England & Wales)',
        'description' => 'Handles most civil disputes.',
        'color' => '#f78c3b',
        'status' => 'active',
        'created_by' => $user->id
    ],
    [
        'name' => "Magistrates' Courts",
        'description' => 'Deal with less serious criminal cases.',
        'color' => '#f78c3b',
        'status' => 'active',
        'created_by' => $user->id
    ],
    [
        'name' => 'Family Court',
        'description' => 'Hears family-related cases.',
        'color' => '#f78c3b',
        'status' => 'active',
        'created_by' => $user->id
    ],
    [
        'name' => 'Tribunals',
        'description' => 'Separate system for specific issues.',
        'color' => '#f78c3b',
        'status' => 'active',
        'created_by' => $user->id
    ]
]);

CaseStatus::insert([
 ['name'=>'New','description'=>'Case has been created but not yet reviewed','color'=>'#2563eb','status'=>'active','created_by'=>$user->id],
 ['name'=>'Open','description'=>'Case is active and under review','color'=>'#0ea5e9','status'=>'active','created_by'=>$user->id],
 ['name'=>'In Progress','description'=>'Work on the case is currently ongoing','color'=>'#f59e0b','status'=>'active','created_by'=>$user->id],
 ['name'=>'Under Investigation','description'=>'Case is being analyzed or investigated','color'=>'#a855f7','status'=>'active','created_by'=>$user->id],
 ['name'=>'Pending','description'=>'Waiting for client input, documents, or external action','color'=>'#f97316','status'=>'active','created_by'=>$user->id],
 ['name'=>'Hearing Scheduled','description'=>'Court hearing date has been fixed','color'=>'#22c55e','status'=>'active','created_by'=>$user->id],
 ['name'=>'On Hold','description'=>'Case is temporarily paused','color'=>'#64748b','status'=>'active','created_by'=>$user->id],
 ['name'=>'Awaiting Judgment','description'=>'Hearings completed, judgment pending','color'=>'#14b8a6','status'=>'active','created_by'=>$user->id],
 ['name'=>'Closed','description'=>'Case is completed and officially closed','color'=>'#dc2626','status'=>'active','created_by'=>$user->id],
]);
CaseType::insert([
 ['name'=>'Criminal','description'=>'Prosecutions for criminal offences','color'=>'#ef4444','status'=>'active','created_by'=>$user->id],
 ['name'=>'Civil Litigation','description'=>'Contract disputes, negligence, damages','color'=>'#3b82f6','status'=>'active','created_by'=>$user->id],
 ['name'=>'Family Law','description'=>'Divorce, child custody, financial remedies','color'=>'#ec4899','status'=>'active','created_by'=>$user->id],
 ['name'=>'Employment Tribunal','description'=>'Unfair dismissal, discrimination, redundancy','color'=>'#f59e0b','status'=>'active','created_by'=>$user->id],
 ['name'=>'Immigration & Asylum','description'=>'Visa, asylum, deportation matters','color'=>'#22c55e','status'=>'active','created_by'=>$user->id],
 ['name'=>'Housing / Landlord & Tenant','description'=>'Evictions, rent disputes, housing claims','color'=>'#0ea5e9','status'=>'active','created_by'=>$user->id],
 ['name'=>'Commercial & Corporate','description'=>'Business, shareholder, company disputes','color'=>'#6366f1','status'=>'active','created_by'=>$user->id],
 ['name'=>'Personal Injury','description'=>'Road traffic accidents, workplace injuries','color'=>'#14b8a6','status'=>'active','created_by'=>$user->id],
 ['name'=>'Judicial Review','description'=>'Challenges to decisions by public bodies','color'=>'#8b5cf6','status'=>'active','created_by'=>$user->id],
 ['name'=>'Probate & Wills','description'=>'Inheritance, estate administration, will disputes','color'=>'#64748b','status'=>'active','created_by'=>$user->id],
]);



        // $emailService = new EmailTemplateService();

        // $variables = [
        //     '{user_email}' => $user->email,
        //     '{user_name}' => $user->name,
        //     '{user_type}' => 'Company',
        //     '{app_name}' => config('app.name'),
        //     '{app_url}' => config('app.url'),
        //     '{theme_color}' => getSetting('theme_color', '#3b82f6')
        // ];

        // $emailService->sendTemplateEmailWithLanguage(
        //     templateName: 'Company Registration Welcome',
        //     variables: $variables,
        //     toEmail: $user->email,
        //     toName: $user->name,
        //     language: 'en'
        // );

        // Assign role and settings to the user
        defaultRoleAndSetting($user);

        // Note: Referral record will be created when user purchases a plan
        // This is handled in the PlanController or payment controllers

        Auth::login($user);

        // Check if email verification is enabled
        $emailVerificationEnabled = getSetting('emailVerification', false);
        if ($emailVerificationEnabled) {
            event(new Registered($user));
            return redirect()->route('verification.notice');
        }

        // Redirect to plans page with selected plan
        $planId = $request->plan_id;
        if ($planId) {
            return redirect()->route('plans.index', ['selected' => $planId]);
        }

        return to_route('dashboard');
    }

    /**
     * Decrypt plan ID from encrypted string
     */
    private function decryptPlanId($encryptedPlanId)
    {
        try {
            $key = 'advocate2025'; // Use a secure key
            $encrypted = base64_decode($encryptedPlanId);
            $decrypted = '';

            for ($i = 0; $i < strlen($encrypted); $i++) {
                $decrypted .= chr(ord($encrypted[$i]) ^ ord($key[$i % strlen($key)]));
            }

            return is_numeric($decrypted) ? (int)$decrypted : null;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Create referral record when user purchases a plan
     */
    private function createReferralRecord(User $user)
    {
        $settings = ReferralSetting::current();

        if (!$settings->is_enabled) {
            return;
        }

        $referrer = User::where('referral_code', $user->used_referral_code)->first();
        if (!$referrer || !$user->plan) {
            return;
        }

        // Calculate commission based on plan price
        $planPrice = $user->plan->price ?? 0;
        $commissionAmount = ($planPrice * $settings->commission_percentage) / 100;

        if ($commissionAmount > 0) {
            Referral::create([
                'user_id' => $user->id,
                'company_id' => $referrer->id,
                'commission_percentage' => $settings->commission_percentage,
                'amount' => $commissionAmount,
                'plan_id' => $user->plan_id,
            ]);
        }
    }
}
