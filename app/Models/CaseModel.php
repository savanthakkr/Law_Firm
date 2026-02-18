<?php

namespace App\Models;

use App\Traits\AutoApplyPermissionCheck;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CaseModel extends BaseModel
{
    use HasFactory, AutoApplyPermissionCheck;

    protected $table = 'cases';

    protected $fillable = [
        'case_id',
        'title',
        'description',
        'client_id',
        'case_type_id',
        'case_status_id',
        'court_id',
        'priority',
        'filing_date',
        'expected_completion_date',
        'estimated_value',
        'opposing_party',
        'court_details',
        'status',
        'created_by'
    ];

    protected $casts = [
        'filing_date' => 'date',
        'expected_completion_date' => 'date',
        'estimated_value' => 'decimal:2',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($case) {
            if (!$case->case_id) {
                $case->case_id = 'CASE' . str_pad(
                    (self::max('id') ?? 0) + 1, 
                    6, 
                    '0', 
                    STR_PAD_LEFT
                );
            }
        });
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function caseType()
    {
        return $this->belongsTo(CaseType::class);
    }

    public function caseStatus()
    {
        return $this->belongsTo(CaseStatus::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function court()
    {
        return $this->belongsTo(Court::class);
    }



    public function invoices()
    {
        return $this->hasMany(Invoice::class, 'case_id');
    }

    public function timeEntries()
    {
        return $this->hasMany(TimeEntry::class, 'case_id');
    }
    
    public function teamMembers()
    {
        return $this->hasMany(CaseTeamMember::class, 'case_id');
    }
}