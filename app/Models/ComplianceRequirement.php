<?php

namespace App\Models;

use App\Traits\AutoApplyPermissionCheck;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ComplianceRequirement extends BaseModel
{
    use HasFactory, AutoApplyPermissionCheck;

    protected $fillable = [
        'compliance_id',
        'title',
        'description',
        'regulatory_body',
        'category_id',
        'jurisdiction',
        'scope',
        'effective_date',
        'deadline',
        'frequency_id',
        'responsible_party',
        'evidence_requirements',
        'penalty_implications',
        'monitoring_procedures',
        'status',
        'priority',
        'created_by'
    ];

    protected $casts = [
        'effective_date' => 'date',
        'deadline' => 'date',
    ];

    /**
     * Boot method to auto-generate compliance ID
     */
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($compliance) {
            if (!$compliance->compliance_id) {
                $compliance->compliance_id = 'COMP' . str_pad(
                    (self::max('id') ?? 0) + 1, 
                    6, 
                    '0', 
                    STR_PAD_LEFT
                );
            }
        });
    }

    /**
     * Get the user who created the compliance requirement.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the compliance category.
     */
    public function category()
    {
        return $this->belongsTo(ComplianceCategory::class, 'category_id');
    }

    /**
     * Get the compliance frequency.
     */
    public function frequency()
    {
        return $this->belongsTo(ComplianceFrequency::class, 'frequency_id');
    }

    /**
     * Scope for company isolation
     */
    // public function scopeWithPermissionCheck($query)
    // {
    //     return $query->where('created_by', createdBy());
    // }

    /**
     * Get status color for UI
     */
    public function getStatusColorAttribute()
    {
        return match($this->status) {
            'pending' => '#f59e0b',
            'in_progress' => '#3b82f6',
            'compliant' => '#10b981',
            'non_compliant' => '#ef4444',
            'overdue' => '#dc2626',
            default => '#6b7280'
        };
    }

    /**
     * Get priority color for UI
     */
    public function getPriorityColorAttribute()
    {
        return match($this->priority) {
            'low' => '#10b981',
            'medium' => '#f59e0b',
            'high' => '#f97316',
            'critical' => '#ef4444',
            default => '#6b7280'
        };
    }

    /**
     * Check if requirement is overdue
     */
    public function getIsOverdueAttribute()
    {
        return $this->deadline && $this->deadline < now() && $this->status !== 'compliant';
    }

    /**
     * Get days until deadline
     */
    public function getDaysUntilDeadlineAttribute()
    {
        if (!$this->deadline) return null;
        return now()->diffInDays($this->deadline, false);
    }
}