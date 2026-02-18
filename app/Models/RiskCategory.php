<?php

namespace App\Models;

use App\Traits\AutoApplyPermissionCheck;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RiskCategory extends BaseModel
{
    use AutoApplyPermissionCheck;

    protected $fillable = [
        'name',
        'description',
        'color',
        'status',
        'created_by'
    ];

    // public function scopeWithPermissionCheck($query)
    // {
    //     return $query->where('created_by', createdBy());
    // }

    public function riskAssessments(): HasMany
    {
        return $this->hasMany(RiskAssessment::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}