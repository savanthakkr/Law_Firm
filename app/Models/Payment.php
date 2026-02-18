<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Traits\AutoApplyPermissionCheck;

class Payment extends BaseModel
{
    use HasFactory, AutoApplyPermissionCheck;

    protected $fillable = [
        'created_by',
        'invoice_id',
        'payment_method',
        'amount',
        'payment_date',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_date' => 'date',
    ];

    protected static function booted()
    {
        // Removed global scope to use AutoApplyPermissionCheck trait instead

        static::created(function ($payment) {
            $invoice = $payment->invoice;
            $totalPaid = $invoice->payments()->sum('amount');
            
            // Update invoice status based on payment amount
            if ($totalPaid >= $invoice->total_amount) {
                $invoice->update(['status' => 'paid']);
            } elseif ($totalPaid > 0 && $invoice->status === 'draft') {
                // If partial payment received, change from draft to sent
                $invoice->update(['status' => 'sent']);
            }
        });
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function client()
    {
        return $this->hasOneThrough(Client::class, Invoice::class, 'id', 'id', 'invoice_id', 'client_id');
    }

    public function getPaymentMethodDisplayAttribute(): string
    {
        return match($this->payment_method) {
            'cash' => 'Cash',
            'check' => 'Check',
            'credit_card' => 'Credit Card',
            'bank_transfer' => 'Bank Transfer',
            'online' => 'Online Payment',
            default => ucfirst($this->payment_method)
        };
    }
}