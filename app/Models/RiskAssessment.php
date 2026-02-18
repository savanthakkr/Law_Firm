<?php

namespace App\Models;

use App\Traits\AutoApplyPermissionCheck;
use Illuminate\Database\Eloquent\Model;

class RiskAssessment extends BaseModel
{
    use AutoApplyPermissionCheck;
    
    protected $fillable = [
        'risk_title',
        'risk_category_id',
        'description',
        'probability',
        'impact',
        'mitigation_plan',
        'control_measures',
        'assessment_date',
        'review_date',
        'status',
        'responsible_person',
        'created_by'
    ];

    protected $casts = [
        'assessment_date' => 'date',
        'review_date' => 'date',
    ];

    /**
     * Get the user who created the risk assessment.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function riskCategory()
    {
        return $this->belongsTo(RiskCategory::class);
    }

    /**
     * Calculate risk score based on probability and impact
     */
    public function getRiskScoreAttribute()
    {
        $probabilityValues = [
            'very_low' => 1,
            'low' => 2,
            'medium' => 3,
            'high' => 4,
            'very_high' => 5
        ];

        $impactValues = [
            'very_low' => 1,
            'low' => 2,
            'medium' => 3,
            'high' => 4,
            'very_high' => 5
        ];

        return ($probabilityValues[$this->probability] ?? 3) * ($impactValues[$this->impact] ?? 3);
    }

    /**
     * Get risk level based on score
     */
    public function getRiskLevelAttribute()
    {
        $score = $this->risk_score;
        
        if ($score <= 4) return 'low';
        if ($score <= 9) return 'medium';
        if ($score <= 16) return 'high';
        return 'critical';
    }
}