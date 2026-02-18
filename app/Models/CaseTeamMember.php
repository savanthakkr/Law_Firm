<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CaseTeamMember extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'case_id',
        'user_id',
        'assigned_date',
        'status',
        'created_by'
    ];

    protected $casts = [
        'assigned_date' => 'date',
    ];

    public function case()
    {
        return $this->belongsTo(CaseModel::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeWithPermissionCheck($query)
    {
        return $query->whereHas('case', function ($q) {
            $q->where('created_by', createdBy());
        });
    }
}