<?php

namespace App\Models;

use App\Traits\AutoApplyPermissionCheck;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Expense extends BaseModel
{
    use HasFactory, AutoApplyPermissionCheck;

    protected $fillable = [
        'created_by',
        'case_id',
        'expense_category_id',
        'invoice_id',
        'description',
        'amount',
        'expense_date',
        'is_billable',
        'is_approved',
        'receipt_file',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'expense_date' => 'date',
        'is_billable' => 'boolean',
        'is_approved' => 'boolean',
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

    public function category(): BelongsTo
    {
        return $this->belongsTo(ExpenseCategory::class, 'expense_category_id');
    }

    public function getStatusDisplayAttribute(): string
    {
        if ($this->is_approved) {
            return 'Approved';
        }
        return 'Pending';
    }

    public function getBillableDisplayAttribute(): string
    {
        return $this->is_billable ? 'Billable' : 'Non-billable';
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function case(): BelongsTo
    {
        return $this->belongsTo(CaseModel::class, 'case_id');
    }

    public function scopeUnbilled($query)
    {
        return $query->where('is_billable', true)
            ->where('is_approved', true)
            ->whereNull('invoice_id');
    }
}