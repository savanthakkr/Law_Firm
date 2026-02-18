<?php

namespace App\Http\Controllers;

use App\Models\RiskAssessment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RiskAssessmentController extends Controller
{
    public function index(Request $request)
    {
        $query = RiskAssessment::withPermissionCheck()
            ->with(['creator', 'riskCategory'])
            ->where('created_by', createdBy());

        // Handle search
        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('risk_title', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%')
                    ->orWhere('responsible_person', 'like', '%' . $request->search . '%');
            });
        }

        // Handle category filter
        if ($request->has('risk_category') && !empty($request->risk_category) && $request->risk_category !== 'all') {
            $query->where('risk_category_id', $request->risk_category);
        }

        // Handle status filter
        if ($request->has('status') && !empty($request->status) && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Handle risk level filter
        if ($request->has('risk_level') && !empty($request->risk_level) && $request->risk_level !== 'all') {
            // This requires a more complex query since risk_level is calculated
            $query->whereRaw('
                CASE 
                    WHEN (
                        CASE probability 
                            WHEN "very_low" THEN 1 
                            WHEN "low" THEN 2 
                            WHEN "medium" THEN 3 
                            WHEN "high" THEN 4 
                            WHEN "very_high" THEN 5 
                            ELSE 3 
                        END * 
                        CASE impact 
                            WHEN "very_low" THEN 1 
                            WHEN "low" THEN 2 
                            WHEN "medium" THEN 3 
                            WHEN "high" THEN 4 
                            WHEN "very_high" THEN 5 
                            ELSE 3 
                        END
                    ) <= 4 THEN "low"
                    WHEN (
                        CASE probability 
                            WHEN "very_low" THEN 1 
                            WHEN "low" THEN 2 
                            WHEN "medium" THEN 3 
                            WHEN "high" THEN 4 
                            WHEN "very_high" THEN 5 
                            ELSE 3 
                        END * 
                        CASE impact 
                            WHEN "very_low" THEN 1 
                            WHEN "low" THEN 2 
                            WHEN "medium" THEN 3 
                            WHEN "high" THEN 4 
                            WHEN "very_high" THEN 5 
                            ELSE 3 
                        END
                    ) <= 9 THEN "medium"
                    WHEN (
                        CASE probability 
                            WHEN "very_low" THEN 1 
                            WHEN "low" THEN 2 
                            WHEN "medium" THEN 3 
                            WHEN "high" THEN 4 
                            WHEN "very_high" THEN 5 
                            ELSE 3 
                        END * 
                        CASE impact 
                            WHEN "very_low" THEN 1 
                            WHEN "low" THEN 2 
                            WHEN "medium" THEN 3 
                            WHEN "high" THEN 4 
                            WHEN "very_high" THEN 5 
                            ELSE 3 
                        END
                    ) <= 16 THEN "high"
                    ELSE "critical"
                END = ?
            ', [$request->risk_level]);
        }

        // Handle sorting
        if ($request->has('sort_field') && !empty($request->sort_field)) {
            $query->orderBy($request->sort_field, $request->sort_direction ?? 'asc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $riskAssessments = $query->paginate($request->per_page ?? 10);
        
        // Get risk categories for filter dropdown
        $riskCategories = \App\Models\RiskCategory::where('created_by', createdBy())
            ->where('status', 'active')
            ->get(['id', 'name', 'color']);

        return Inertia::render('compliance/risk-assessments/index', [
            'riskAssessments' => $riskAssessments,
            'riskCategories' => $riskCategories,
            'filters' => $request->all(['search', 'risk_category', 'status', 'risk_level', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'risk_title' => 'required|string|max:255',
            'risk_category_id' => 'required|exists:risk_categories,id',
            'description' => 'required|string',
            'probability' => 'required|in:very_low,low,medium,high,very_high',
            'impact' => 'required|in:very_low,low,medium,high,very_high',
            'mitigation_plan' => 'nullable|string',
            'control_measures' => 'nullable|string',
            'assessment_date' => 'required|date',
            'review_date' => 'nullable|date|after:assessment_date',
            'status' => 'nullable|in:identified,assessed,mitigated,monitored,closed',
            'responsible_person' => 'nullable|string|max:255',
        ]);

        $validated['created_by'] = createdBy();
        $validated['status'] = $validated['status'] ?? 'identified';

        RiskAssessment::create($validated);

        return redirect()->back()->with('success', 'Risk assessment created successfully.');
    }

    public function update(Request $request, $riskAssessmentId)
    {
        $riskAssessment = RiskAssessment::where('created_by', createdBy())
            ->where('id', $riskAssessmentId)
            ->first();

        if ($riskAssessment) {
            $validated = $request->validate([
                'risk_title' => 'required|string|max:255',
                'risk_category_id' => 'required|exists:risk_categories,id',
                'description' => 'required|string',
                'probability' => 'required|in:very_low,low,medium,high,very_high',
                'impact' => 'required|in:very_low,low,medium,high,very_high',
                'mitigation_plan' => 'nullable|string',
                'control_measures' => 'nullable|string',
                'assessment_date' => 'required|date',
                'review_date' => 'nullable|date|after:assessment_date',
                'status' => 'nullable|in:identified,assessed,mitigated,monitored,closed',
                'responsible_person' => 'nullable|string|max:255',
            ]);

            $riskAssessment->update($validated);

            return redirect()->back()->with('success', 'Risk assessment updated successfully');
        }

        return redirect()->back()->with('error', 'Risk assessment not found.');
    }

    public function destroy($riskAssessmentId)
    {
        $riskAssessment = RiskAssessment::where('created_by', createdBy())
            ->where('id', $riskAssessmentId)
            ->first();

        if ($riskAssessment) {
            $riskAssessment->delete();
            return redirect()->back()->with('success', 'Risk assessment deleted successfully');
        }

        return redirect()->back()->with('error', 'Risk assessment not found.');
    }
}