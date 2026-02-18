<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HearingType extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'type_id',
        'name',
        'description',
        'duration_estimate',
        'status',
        'requirements',
        'notes',
        'created_by'
    ];

    protected $casts = [
        'requirements' => 'array',
    ];

    /**
     * Boot method to auto-generate type ID
     */
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($hearingType) {
            if (!$hearingType->type_id) {
                $hearingType->type_id = 'HT' . str_pad(
                    (HearingType::max('id') ?? 0) + 1, 
                    6, 
                    '0', 
                    STR_PAD_LEFT
                );
            }
        });
    }

    /**
     * Get the user who created the hearing type.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the hearings of this type.
     */
    public function hearings()
    {
        return $this->hasMany(Hearing::class);
    }
}