<?php

namespace App\Http\Controllers;

use App\Models\CompanySetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CompanySettingController extends Controller
{
    public function index(Request $request)
    {
        $query = CompanySetting::query()
            ->with(['creator'])
            ->where('created_by', createdBy());

        // Handle search
        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('setting_key', 'like', '%' . $request->search . '%')
                    ->orWhere('setting_value', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        // Handle category filter
        if ($request->has('category') && !empty($request->category) && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        // Handle type filter
        if ($request->has('setting_type') && !empty($request->setting_type) && $request->setting_type !== 'all') {
            $query->where('setting_type', $request->setting_type);
        }

        // Handle sorting
        if ($request->has('sort_field') && !empty($request->sort_field)) {
            $query->orderBy($request->sort_field, $request->sort_direction ?? 'asc');
        } else {
            $query->orderBy('category', 'asc')->orderBy('setting_key', 'asc');
        }

        $companySettings = $query->paginate($request->per_page ?? 10);

        return Inertia::render('advocate/company-settings/index', [
            'companySettings' => $companySettings,
            'filters' => $request->all(['search', 'category', 'setting_type', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    public function update(Request $request, $settingId)
    {
        $setting = CompanySetting::where('id', $settingId)
            ->where('created_by', createdBy())
            ->first();

        if ($setting) {
            try {
                $validated = $request->validate([
                    'setting_value' => 'required|string',
                    'description' => 'nullable|string',
                ]);

                $setting->update($validated);

                return redirect()->back()->with('success', 'Company setting updated successfully');
            } catch (\Exception $e) {
                return redirect()->back()->with('error', $e->getMessage() ?: 'Failed to update company setting');
            }
        } else {
            return redirect()->back()->with('error', 'Company setting not found.');
        }
    }
}