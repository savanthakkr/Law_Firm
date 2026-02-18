<?php

namespace App\Models;

use App\Traits\AutoApplyPermissionCheck;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CaseStatus extends BaseModel
{
    use HasFactory, AutoApplyPermissionCheck;

    protected $fillable = [
        'name',
        'description',
        'color',
        'is_default',
        'is_closed',
        'status',
        'created_by'
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'is_closed' => 'boolean',
    ];

    public function cases()
    {
        return $this->hasMany(CaseModel::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // public function scopeWithPermissionCheck($query)
    // {
    //     return $query->where('created_by', createdBy());
    // }
}