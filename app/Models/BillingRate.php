<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\AutoApplyPermissionCheck;

class BillingRate extends BaseModel
{
    use HasFactory, AutoApplyPermissionCheck;

    protected $fillable = [
        'user_id',
        'client_id',
        'rate_type',
        'hourly_rate',
        'fixed_amount',
        'contingency_percentage',
        'effective_date',
        'end_date',
        'status',
        'notes',
        'created_by'
    ];

    protected $casts = [
        'effective_date' => 'date',
        'end_date' => 'date',
        'hourly_rate' => 'decimal:2',
        'fixed_amount' => 'decimal:2',
        'contingency_percentage' => 'decimal:2',
    ];

    /**
     * Get the user that owns the billing rate.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the client that owns the billing rate.
     */
    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Get the user who created the billing rate.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the display rate based on rate type
     */
    public function getDisplayRateAttribute()
    {
        switch ($this->rate_type) {
            case 'hourly':
                return '$' . number_format($this->hourly_rate, 2) . '/hr';
            case 'fixed':
                return '$' . number_format($this->fixed_amount, 2);
            case 'contingency':
                return number_format($this->contingency_percentage, 2) . '%';
            default:
                return '-';
        }
    }

    /**
     * Scope for active rates
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active')
            ->where('effective_date', '<=', now())
            ->where(function($q) {
                $q->whereNull('end_date')->orWhere('end_date', '>=', now());
            });
    }

    /**
     * Get rate for user and client
     */
    public static function getRateForUserClient($userId, $clientId = null)
    {
        // Try client-specific rate first
        if ($clientId) {
            $rate = static::withPermissionCheck()
                ->where('user_id', $userId)
                ->where('client_id', $clientId)
                ->active()
                ->first();
            if ($rate) return $rate->getEffectiveRate();
        }
        
        // Fallback to default rate
        $defaultRate = static::withPermissionCheck()
            ->where('user_id', $userId)
            ->whereNull('client_id')
            ->active()
            ->first();
            
        return $defaultRate ? $defaultRate->getEffectiveRate() : 0;
    }

    /**
     * Get effective rate based on rate type
     */
    public function getEffectiveRate()
    {
        return match($this->rate_type) {
            'hourly' => $this->hourly_rate,
            'fixed' => $this->fixed_amount,
            'contingency' => $this->contingency_percentage,
            default => $this->hourly_rate ?? 0
        };
    }

    /**
     * Get billing rate with type info
     */
    public static function getBillingRateForUserClient($userId, $clientId = null)
    {
        // Try client-specific rate first
        if ($clientId) {
            $rate = static::withPermissionCheck()
                ->where('user_id', $userId)
                ->where('client_id', $clientId)
                ->active()
                ->first();
            if ($rate) return $rate;
        }
        
        // Fallback to default rate
        return static::withPermissionCheck()
            ->where('user_id', $userId)
            ->whereNull('client_id')
            ->active()
            ->first();
    }
}