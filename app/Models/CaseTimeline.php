<?php

namespace App\Models;

use App\Traits\AutoApplyPermissionCheck;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CaseTimeline extends BaseModel
{
    use HasFactory, AutoApplyPermissionCheck;

    protected $fillable = [
        'case_id',
        'event_type',
        'event_type_id',
        'title',
        'description',
        'event_date',
        'is_completed',
        'status',
        'created_by'
    ];

    protected $casts = [
        'event_date' => 'datetime',
        'is_completed' => 'boolean',
    ];

    public function case()
    {
        return $this->belongsTo(CaseModel::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function eventType()
    {
        return $this->belongsTo(EventType::class, 'event_type_id');
    }

    // public function scopeWithPermissionCheck($query)
    // {
    //     return $query->whereHas('case', function ($q) {
    //         $q->where('created_by', createdBy());
    //     });
    // }
}