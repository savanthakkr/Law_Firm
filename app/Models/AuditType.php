<?php

namespace App\Models;

use App\Traits\AutoApplyPermissionCheck;
use Illuminate\Database\Eloquent\Model;

class AuditType extends BaseModel
{
    use AutoApplyPermissionCheck;
    
    protected $fillable = [
        'name',
        'description',
        'color',
        'status',
        'created_by'
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function complianceAudits()
    {
        return $this->hasMany(ComplianceAudit::class);
    }
}