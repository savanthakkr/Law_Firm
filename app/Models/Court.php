<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class Court extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'court_id',
        'name',
        'address',
        'phone',
        'email',
        'jurisdiction',
        'court_type_id',
        'status',
        'facilities',
        'filing_requirements',
        'local_rules',
        'notes',
        'created_by'
    ];

    protected $casts = [
        'facilities' => 'array',
    ];

    /**
     * Boot method to auto-generate court ID
     */
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($court) {
            if (!$court->court_id) {
                $court->court_id = 'CT' . str_pad(
                    (Court::max('id') ?? 0) + 1, 
                    6, 
                    '0', 
                    STR_PAD_LEFT
                );
            }
        });
    }

    /**
     * Get the user who created the court.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the court type.
     */
    public function courtType()
    {
        return $this->belongsTo(CourtType::class, 'court_type_id');
    }

    /**
     * Get the judges associated with this court.
     */
    public function judges()
    {
        return $this->hasMany(Judge::class);
    }

    /**
     * Get the hearings scheduled at this court.
     */
    public function hearings()
    {
        return $this->hasMany(Hearing::class);
    }
}