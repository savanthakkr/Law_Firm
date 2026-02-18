<?php

namespace App\Models;

use App\Traits\AutoApplyPermissionCheck;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProfessionalLicense extends BaseModel
{
    use HasFactory, AutoApplyPermissionCheck;

    protected $fillable = [
        'user_id',
        'license_type',
        'license_number',
        'issuing_authority',
        'jurisdiction',
        'issue_date',
        'expiry_date',
        'status',
        'notes',
        'created_by'
    ];

    protected $casts = [
        'issue_date' => 'date',
        'expiry_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // public function scopeWithPermissionCheck($query)
    // {
    //     return $query->where('created_by', createdBy());
    // }

    public function getStatusColorAttribute()
    {
        return match($this->status) {
            'active' => '#10b981',
            'expired' => '#f59e0b',
            'suspended' => '#ef4444',
            'revoked' => '#dc2626',
            default => '#6b7280'
        };
    }

    public function getIsExpiringAttribute()
    {
        return $this->expiry_date && $this->expiry_date <= now()->addDays(30);
    }

    public function getDaysUntilExpiryAttribute()
    {
        if (!$this->expiry_date) return null;
        return now()->diffInDays($this->expiry_date, false);
    }
}