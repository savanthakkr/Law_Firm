<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Currency;
use App\Models\PaymentSetting;
use App\Models\Webhook;
use App\Models\CompanySetting;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    /**
     * Display the main settings page.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        // Get system settings using helper function
        $systemSettings = settings();
        $currencies = Currency::all();
        $paymentSettings = PaymentSetting::getUserSettings(auth()->id());
        $webhooks = Webhook::where('user_id', auth()->id())->get();
        $companySettings = CompanySetting::where('created_by', createdBy())->get();
        
        return Inertia::render('settings/index', [
            'systemSettings' => $systemSettings,
            'settings' => $systemSettings, // For helper functions
            'cacheSize' => getCacheSize(),
            'currencies' => $currencies,
            'timezones' => config('timezones'),
            'dateFormats' => config('dateformat'),
            'timeFormats' => config('timeformat'),
            'paymentSettings' => $paymentSettings,
            'webhooks' => $webhooks,
            'companySettings' => $companySettings,
        ]);
    }

    public function storeCompanySetting(Request $request)
    {
        $validated = $request->validate([
            'key' => 'required|string|max:255',
            'value' => 'required|string',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:255'
        ]);

        CompanySetting::create([
            'setting_key' => $validated['key'],
            'setting_value' => $validated['value'],
            'description' => $validated['description'],
            'category' => $validated['category'] ?? 'General',
            'created_by' => createdBy()
        ]);

        return redirect()->back()->with('success', 'Company setting created successfully.');
    }

    public function updateCompanySetting(Request $request, $id)
    {
        $validated = $request->validate([
            'key' => 'required|string|max:255',
            'value' => 'required|string',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:255'
        ]);

        $setting = CompanySetting::where('id', $id)
            ->where('created_by', createdBy())
            ->firstOrFail();

        $setting->update([
            'setting_key' => $validated['key'],
            'setting_value' => $validated['value'],
            'description' => $validated['description'],
            'category' => $validated['category'] ?? 'General'
        ]);

        return redirect()->back()->with('success', 'Company setting updated successfully.');
    }

    public function destroyCompanySetting($id)
    {
        $setting = CompanySetting::where('id', $id)
            ->where('created_by', createdBy())
            ->firstOrFail();

        $setting->delete();

        return redirect()->back()->with('success', 'Company setting deleted successfully.');
    }
}