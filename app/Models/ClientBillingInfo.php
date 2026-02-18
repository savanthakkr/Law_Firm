<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\AutoApplyPermissionCheck;

class ClientBillingInfo extends BaseModel
{
    use HasFactory, AutoApplyPermissionCheck;

    /**
     * Override the module name for permission checks
     */
    public function getPermissionModule()
    {
        return 'client_billing';
    }

    protected $fillable = [
        'client_id',
        'billing_address',
        'billing_contact_name',
        'billing_contact_email',
        'billing_contact_phone',
        'payment_terms',
        'custom_payment_terms',
        'currency',
        'billing_notes',
        'status',
        'created_by'
    ];



    /**
     * Get the client that owns the billing info.
     */
    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Get the user who created the billing info.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get formatted payment terms
     */
    public function getFormattedPaymentTermsAttribute()
    {
        $terms = [
            'net_15' => 'Net 15 days',
            'net_30' => 'Net 30 days',
            'net_45' => 'Net 45 days',
            'net_60' => 'Net 60 days',
            'due_on_receipt' => 'Due on receipt',
            'custom' => $this->custom_payment_terms ?: 'Custom terms'
        ];

        return $terms[$this->payment_terms] ?? $this->payment_terms;
    }
}