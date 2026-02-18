<?php

namespace App\Models;

use App\Traits\AutoApplyPermissionCheck;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Hearing extends BaseModel
{
    use HasFactory, AutoApplyPermissionCheck;

    protected $fillable = [
        'hearing_id',
        'case_id',
        'court_id',
        'judge_id',
        'hearing_type_id',
        'title',
        'description',
        'hearing_date',
        'hearing_time',
        'duration_minutes',
        'status',
        'notes',
        'outcome',
        'attendees',
        'created_by'
    ];

    protected $casts = [
        'attendees' => 'array',
        'hearing_date' => 'date',
        'hearing_time' => 'datetime:H:i',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($hearing) {
            if (!$hearing->hearing_id) {
                $hearing->hearing_id = 'HR' . str_pad(
                    (Hearing::max('id') ?? 0) + 1, 
                    6, 
                    '0', 
                    STR_PAD_LEFT
                );
            }
        });
    }

    public function case()
    {
        return $this->belongsTo(CaseModel::class, 'case_id');
    }

    public function court()
    {
        return $this->belongsTo(Court::class);
    }

    public function judge()
    {
        return $this->belongsTo(Judge::class);
    }

    public function hearingType()
    {
        return $this->belongsTo(HearingType::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}