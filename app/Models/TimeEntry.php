<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\AutoApplyPermissionCheck;

class TimeEntry extends BaseModel
{
    use HasFactory, AutoApplyPermissionCheck;

    protected $fillable = [
        'entry_id',
        'case_id',
        'client_id',
        'invoice_id',
        'user_id',
        'description',
        'hours',
        'billable_rate',
        'billing_rate_type',
        'is_billable',
        'entry_date',
        'start_time',
        'end_time',
        'status',
        'notes',
        'created_by'
    ];

    protected $casts = [
        'entry_date' => 'date',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'hours' => 'decimal:2',
        'billable_rate' => 'decimal:2',
        'is_billable' => 'boolean',
    ];

    /**
     * Boot method to auto-generate entry ID and set billing rate
     */
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($timeEntry) {
            if (!$timeEntry->entry_id) {
                $timeEntry->entry_id = 'TE' . str_pad(
                    (TimeEntry::max('id') ?? 0) + 1, 
                    6, 
                    '0', 
                    STR_PAD_LEFT
                );
            }
            
            // Auto-set billing rate if not provided
            if (!$timeEntry->billable_rate && $timeEntry->user_id) {
                $billingRate = \App\Models\BillingRate::getBillingRateForUserClient(
                    $timeEntry->user_id, 
                    $timeEntry->client_id
                );
                
                if ($billingRate) {
                    $timeEntry->billing_rate_type = $billingRate->rate_type;
                    $timeEntry->billable_rate = $billingRate->getEffectiveRate();
                } else {
                    // Set default values if no billing rate found
                    $timeEntry->billing_rate_type = 'hourly';
                    $timeEntry->billable_rate = 0;
                }
            }
        });
    }

    /**
     * Get the case that owns the time entry.
     */
    public function case()
    {
        return $this->belongsTo(CaseModel::class, 'case_id');
    }

    /**
     * Get the client that owns the time entry.
     */
    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Get the user who logged the time.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the user who created the time entry.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the invoice that owns the time entry.
     */
    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    /**
     * Get the billing rate for this time entry.
     */
    public function billingRate()
    {
        return $this->belongsTo(BillingRate::class, 'user_id', 'user_id')
            ->where('client_id', $this->client_id)
            ->where('status', true)
            ->where('effective_date', '<=', now())
            ->where(function($q) {
                $q->whereNull('end_date')->orWhere('end_date', '>=', now());
            });
    }

    /**
     * Calculate total billable amount based on billing type
     */
    public function getTotalAmountAttribute()
    {
        if (!$this->is_billable || !$this->billable_rate) {
            return 0;
        }
        
        return match($this->billing_rate_type) {
            'hourly' => $this->hours * $this->billable_rate,
            'fixed' => $this->billable_rate, // Fixed amount regardless of hours
            'contingency' => 0, // Contingency calculated at case completion
            default => $this->hours * $this->billable_rate
        };
    }

    /**
     * Get billing display text
     */
    public function getBillingDisplayAttribute()
    {
        return match($this->billing_rate_type) {
            'hourly' => $this->hours . ' hrs × $' . number_format($this->billable_rate, 2),
            'fixed' => 'Fixed Fee: $' . number_format($this->billable_rate, 2),
            'contingency' => number_format($this->billable_rate, 1) . '% Contingency',
            default => $this->hours . ' hrs × $' . number_format($this->billable_rate, 2)
        };
    }

    /**
     * Scope for unbilled entries
     */
    public function scopeUnbilled($query)
    {
        return $query->where('is_billable', true)->whereNull('invoice_id');
    }
}