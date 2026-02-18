<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CleTracking extends BaseModel
{
    protected $table = 'cle_tracking';

    protected $fillable = [
        'user_id',
        'course_name',
        'provider',
        'credits_earned',
        'credits_required',
        'completion_date',
        'expiry_date',
        'certificate_number',
        'certificate_file',
        'status',
        'description',
        'created_by'
    ];

    protected $casts = [
        'completion_date' => 'date',
        'expiry_date' => 'date',
        'credits_earned' => 'decimal:2',
        'credits_required' => 'decimal:2',
    ];

    /**
     * Get the user that owns the CLE record.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the user who created the record.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Check if CLE is expired
     */
    public function getIsExpiredAttribute()
    {
        return $this->expiry_date && $this->expiry_date < now();
    }

    /**
     * Get formatted credits
     */
    public function getFormattedCreditsAttribute()
    {
        return number_format($this->credits_earned, 1) . ' credits';
    }
}