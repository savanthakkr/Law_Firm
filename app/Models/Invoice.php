<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Traits\AutoApplyPermissionCheck;

class Invoice extends BaseModel
{
    use HasFactory, AutoApplyPermissionCheck;

    protected $fillable = [
        'created_by',
        'client_id',
        'case_id',
        'currency_id',
        'invoice_number',
        'subtotal',
        'tax_amount',
        'total_amount',
        'status',
        'invoice_date',
        'due_date',
        'notes',
        'line_items',
        'payment_token',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'invoice_date' => 'date',
        'due_date' => 'date',
        'line_items' => 'array',
    ];

    protected static function booted()
    {
        // Removed global scope to use AutoApplyPermissionCheck trait instead

        static::creating(function ($invoice) {
            if (!$invoice->invoice_number) {
                $invoice->invoice_number = 'INV-' . date('Y') . '-' . $invoice->created_by . '-' . str_pad(
                    Invoice::where('created_by', $invoice->created_by)
                        ->whereYear('created_at', date('Y'))->count() + 1, 
                    4, 
                    '0', 
                    STR_PAD_LEFT
                );
            }
            if (!$invoice->payment_token) {
                $invoice->payment_token = \Str::random(32);
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

    public function case(): BelongsTo
    {
        return $this->belongsTo(CaseModel::class, 'case_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function emailTemplate(): BelongsTo
    {
        return $this->belongsTo(EmailTemplate::class);
    }

    public function currency(): BelongsTo
    {
        return $this->belongsTo(ClientBillingCurrency::class, 'currency_id');
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    public function timeEntries(): HasMany
    {
        return $this->hasMany(TimeEntry::class);
    }

    public function getStatusDisplayAttribute(): string
    {
        return match($this->status) {
            'draft' => 'Draft',
            'sent' => 'Sent',
            'paid' => 'Paid',
            'overdue' => 'Overdue',
            'cancelled' => 'Cancelled',
            default => ucfirst($this->status)
        };
    }

    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'draft' => 'secondary',
            'sent' => 'default',
            'paid' => 'default',
            'overdue' => 'destructive',
            'cancelled' => 'secondary',
            default => 'default'
        };
    }

    public function calculateTotals()
    {
        if (!$this->line_items) {
            $this->update([
                'subtotal' => 0,
                'total_amount' => $this->tax_amount ?? 0
            ]);
            return;
        }

        $subtotal = collect($this->line_items)->sum('amount');
        $total = $subtotal + ($this->tax_amount ?? 0);
        
        $this->update([
            'subtotal' => $subtotal,
            'total_amount' => $total
        ]);
    }

    public function addLineItem($description, $quantity = 1, $rate = 0, $amount = null)
    {
        $amount = $amount ?? ($quantity * $rate);
        
        $lineItems = $this->line_items ?? [];
        $lineItems[] = [
            'description' => $description,
            'quantity' => $quantity,
            'rate' => $rate,
            'amount' => $amount
        ];
        
        $this->line_items = $lineItems;
        $this->save();
        $this->calculateTotals();
    }
    
    public function getPaymentUrlAttribute(): string
    {
        return route('invoice.payment', $this->payment_token);
    }
    
    public function getRemainingAmountAttribute(): float
    {
        $totalPaid = $this->payments()->sum('amount');
        return max(0, $this->total_amount - $totalPaid);
    }
    
    public function recalculateFromTimeEntries()
    {
        $this->calculateTotals();
        return $this;
    }
}