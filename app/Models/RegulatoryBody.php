<?php

namespace App\Models;

use App\Traits\AutoApplyPermissionCheck;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RegulatoryBody extends BaseModel
{
    use HasFactory, AutoApplyPermissionCheck;

    protected $fillable = [
        'name',
        'description',
        'jurisdiction',
        'contact_email',
        'contact_phone',
        'address',
        'website',
        'status',
        'created_by'
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function complianceRequirements()
    {
        return $this->hasMany(ComplianceRequirement::class, 'regulatory_body_id');
    }

    // public function scopeWithPermissionCheck($query)
    // {
    //     return $query->where('created_by', createdBy());
    // }
}