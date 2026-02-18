<?php

namespace App\Http\Controllers;

use App\Models\CompanyProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CompanyProfileController extends Controller
{
    public function index(Request $request)
    {
        // Get single advocate profile for current user
        $companyProfile = CompanyProfile::withPermissionCheck()->where('created_by', createdBy())->first();

        return Inertia::render('advocate/company-profiles/index', [
            'companyProfile' => $companyProfile,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            // Personal Details
            'advocate_name' => 'required|string|max:255',
            'bar_registration_number' => 'required|string|max:255',
            'years_of_experience' => 'nullable|integer|min:0',
            
            // Contact Details
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'website' => 'nullable|url|max:255',
            'address' => 'nullable|string',
            
            // Professional Details
            'law_degree' => 'nullable|string|max:255',
            'university' => 'nullable|string|max:255',
            'specialization' => 'nullable|string',
            
            // Court & Jurisdiction
            'court_jurisdictions' => 'nullable|string',
            'languages_spoken' => 'nullable|string|max:255',
            
            // Business Details
            'consultation_fees' => 'nullable|numeric|min:0',
            'office_hours' => 'nullable|string|max:255',
            'success_rate' => 'nullable|integer|min:0|max:100',
            
            // Company Details
            'name' => 'nullable|string|max:255',
            'registration_number' => 'nullable|string|max:255',
            'establishment_date' => 'nullable|date',
            'company_size' => 'required|in:solo,small,medium,large',
            'business_type' => 'required|in:law_firm,corporate_legal,government,other',
            
            // Services
            'services_offered' => 'nullable|string',
            'notable_cases' => 'nullable|string',
            'description' => 'nullable|string',
            'status' => 'nullable|in:active,inactive',
        ]);

        $validated['created_by'] = createdBy();
        $validated['status'] = $validated['status'] ?? 'active';

        // Check if company profile already exists for this user
        $exists = CompanyProfile::where('created_by', createdBy())->exists();

        if ($exists) {
            return redirect()->back()->with('error', 'Company profile already exists for this user.');
        }

        CompanyProfile::create($validated);

        return redirect()->back()->with('success', 'Company profile created successfully.');
    }

    public function update(Request $request, $profileId = null)
    {
        // Get existing profile or prepare for creation
        $profile = CompanyProfile::where('created_by', createdBy())->first();
        
        $validated = $request->validate([
            // Personal Details
            'advocate_name' => 'required|string|max:255',
            'bar_registration_number' => 'required|string|max:255',
            'years_of_experience' => 'nullable|integer|min:0',
            
            // Contact Details
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'website' => 'nullable|url|max:255',
            'address' => 'nullable|string',
            
            // Professional Details
            'law_degree' => 'nullable|string|max:255',
            'university' => 'nullable|string|max:255',
            'specialization' => 'nullable|string',
            
            // Court & Jurisdiction
            'court_jurisdictions' => 'nullable|string',
            'languages_spoken' => 'nullable|string|max:255',
            
            // Business Details
            'consultation_fees' => 'nullable|numeric|min:0',
            'office_hours' => 'nullable|string|max:255',
            'success_rate' => 'nullable|integer|min:0|max:100',
            
            // Company Details
            'name' => 'nullable|string|max:255',
            'registration_number' => 'nullable|string|max:255',
            'establishment_date' => 'nullable|date',
            'company_size' => 'required|in:solo,small,medium,large',
            'business_type' => 'required|in:law_firm,corporate_legal,government,other',
            
            // Services
            'services_offered' => 'nullable|string',
            'notable_cases' => 'nullable|string',
            'description' => 'nullable|string',
            'status' => 'nullable|in:active,inactive',
        ]);

        $validated['created_by'] = createdBy();
        $validated['status'] = $validated['status'] ?? 'active';

        if ($profile) {
            $profile->update($validated);
            return redirect()->back()->with('success', 'Advocate profile updated successfully');
        } else {
            CompanyProfile::create($validated);
            return redirect()->back()->with('success', 'Advocate profile created successfully');
        }
    }

    public function destroy($profileId)
    {
        $profile = CompanyProfile::where('id', $profileId)
            ->where('created_by', createdBy())
            ->first();

        if ($profile) {
            try {
                $profile->delete();
                return redirect()->back()->with('success', 'Company profile deleted successfully');
            } catch (\Exception $e) {
                return redirect()->back()->with('error', $e->getMessage() ?: 'Failed to delete company profile');
            }
        } else {
            return redirect()->back()->with('error', 'Company profile not found.');
        }
    }

    public function toggleStatus($profileId)
    {
        $profile = CompanyProfile::where('id', $profileId)
            ->where('created_by', createdBy())
            ->first();

        if ($profile) {
            try {
                $profile->status = $profile->status === 'active' ? 'inactive' : 'active';
                $profile->save();

                return redirect()->back()->with('success', 'Company profile status updated successfully');
            } catch (\Exception $e) {
                return redirect()->back()->with('error', $e->getMessage() ?: 'Failed to update company profile status');
            }
        } else {
            return redirect()->back()->with('error', 'Company profile not found.');
        }
    }
}