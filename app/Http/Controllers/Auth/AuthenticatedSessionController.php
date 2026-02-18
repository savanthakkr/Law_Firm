<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use App\Models\UserSession;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {

        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
            'settings' => settings()
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        // $userId = User::where('email', $request->email)->first()?->id;
        // $sessionData = UserSession::where('user_id', $userId)->count();
        // if($sessionData >= 2){
        //     UserSession::where('user_id', $userId)->delete();
        // }

        $request->authenticate();

        // After successful auth, block expired trial companies from logging in
        $user = $request->user();
        if ($user && $user->type === 'company' && $user->is_trial && $user->isTrialExpired()) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return back()->withErrors([
                'email' => __('Your trial period has expired. Please contact support or subscribe to a plan.'),
            ]);
        }

        $request->session()->regenerate();

        // Check if email verification is enabled and user is not verified
        $emailVerificationEnabled = getSetting('emailVerification', false);
        if ($emailVerificationEnabled && !$request->user()->hasVerifiedEmail()) {
            return redirect()->route('verification.notice');
        }

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
