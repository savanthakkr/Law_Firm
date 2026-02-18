<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompliancePolicy extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'policy_name',
        'policy_content',
        'effective_date',
        'review_date',
        'status',
        'created_by'
    ];

    protected $casts = [
        'effective_date' => 'date',
        'review_date' => 'date',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}