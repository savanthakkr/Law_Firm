<?php

namespace App\Models;

use App\Traits\AutoApplyPermissionCheck;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PracticeArea extends BaseModel
{
    use HasFactory, AutoApplyPermissionCheck;

    protected $fillable = [
        'area_id',
        'name',
        'description',
        'expertise_level',
        'is_primary',
        'certifications',
        'status',
        'created_by'
    ];

    protected $casts = [
        'is_primary' => 'boolean',
    ];

    /**
     * Boot method to auto-generate area ID
     */
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($area) {
            if (!$area->area_id) {
                $area->area_id = 'PA' . str_pad(
                    (PracticeArea::max('id') ?? 0) + 1, 
                    6, 
                    '0', 
                    STR_PAD_LEFT
                );
            }
        });
    }

    /**
     * Get the user who created the practice area.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}