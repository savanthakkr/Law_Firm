<?php

namespace App\Models;

use App\Traits\AutoApplyPermissionCheck;

class ClientBillingCurrency extends BaseModel
{
    use AutoApplyPermissionCheck;

    protected $fillable = [
        'name',
        'code',
        'symbol',
        'description',
        'is_default',
        'status',
        'created_by'
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'status' => 'boolean',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}