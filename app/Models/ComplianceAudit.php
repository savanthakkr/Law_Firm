<?php

namespace App\Models;

use App\Traits\AutoApplyPermissionCheck;
use Illuminate\Database\Eloquent\Model;

class ComplianceAudit extends BaseModel
{
    use AutoApplyPermissionCheck;
    
    protected $fillable = [
        'audit_title',
        'audit_type_id',
        'description',
        'audit_date',
        'completion_date',
        'status',
        'scope',
        'findings',
        'recommendations',
        'risk_level',
        'auditor_name',
        'auditor_organization',
        'corrective_actions',
        'follow_up_date',
        'created_by'
    ];

    protected $casts = [
        'audit_date' => 'date',
        'completion_date' => 'date',
        'follow_up_date' => 'date',
    ];

    /**
     * Get the user who created the audit.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the audit type.
     */
    public function auditType()
    {
        return $this->belongsTo(AuditType::class, 'audit_type_id');
    }

    /**
     * Get audit duration in days
     */
    public function getAuditDurationAttribute()
    {
        if (!$this->completion_date) {
            return null;
        }
        
        return $this->audit_date->diffInDays($this->completion_date);
    }

    /**
     * Check if audit is overdue
     */
    public function getIsOverdueAttribute()
    {
        if ($this->status === 'completed' || $this->status === 'cancelled') {
            return false;
        }
        
        if ($this->follow_up_date && $this->follow_up_date < now()) {
            return true;
        }
        
        return false;
    }
}