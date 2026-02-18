<?php

namespace App\Models;

use App\Traits\AutoApplyPermissionCheck;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResearchSource extends BaseModel
{
    use HasFactory, AutoApplyPermissionCheck;

    protected $fillable = [
        'source_name',
        'source_type',
        'description',
        'url',
        'access_info',
        'credentials',
        'status',
        'created_by'
    ];

    protected $casts = [
        'credentials' => 'array',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // public function scopeWithPermissionCheck($query)
    // {
    //     return $query->where('created_by', createdBy());
    // }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}