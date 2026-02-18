<?php

namespace App\Models;

use App\Traits\AutoApplyPermissionCheck;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeeStructure extends BaseModel
{
    use HasFactory, AutoApplyPermissionCheck;

    protected $fillable = [
        'created_by',
        'client_id',
        'case_id',
        'fee_type_id',
        'amount',
        'percentage',
        'hourly_rate',
        'description',
        'effective_date',
        'end_date',
        'is_active',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'percentage' => 'decimal:2',
        'hourly_rate' => 'decimal:2',
        'effective_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
    ];

    protected static function booted()
    {
        static::addGlobalScope('company', function ($builder) {
            if (auth()->check() && auth()->user()->type !== 'super admin') {
                $builder->where('created_by', createdBy());
            }
        });
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function feeType(): BelongsTo
    {
        return $this->belongsTo(FeeType::class);
    }

    public function getDisplayAmountAttribute(): string
    {
        if (!$this->feeType) return 'N/A';
        
        return match(strtolower($this->feeType->name)) {
            'hourly', 'hourly rate' => '$' . number_format($this->hourly_rate, 2) . '/hr',
            'fixed', 'fixed fee' => '$' . number_format($this->amount, 2),
            'contingency', 'contingency fee' => number_format($this->percentage, 1) . '%',
            'retainer' => '$' . number_format($this->amount, 2),
            'blended', 'blended rate' => '$' . number_format($this->hourly_rate, 2) . '/hr',
            default => 'N/A'
        };
    }
}