<?php

namespace App\Models;

use App\Traits\AutoApplyPermissionCheck;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FeeType extends BaseModel
{
    use HasFactory, AutoApplyPermissionCheck;

    protected $fillable = [
        'created_by',
        'name',
        'description',
        'status',
    ];

    protected $casts = [
        'status' => 'string',
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

    public function feeStructures(): HasMany
    {
        return $this->hasMany(FeeStructure::class);
    }
}