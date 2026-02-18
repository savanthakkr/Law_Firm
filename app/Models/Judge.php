<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class Judge extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'judge_id',
        'court_id',
        'name',
        'title',
        'email',
        'phone',
        'preferences',
        'contact_info',
        'status',
        'notes',
        'created_by'
    ];

    protected $casts = [
        'preferences' => 'array',
    ];

    /**
     * Boot method to auto-generate judge ID
     */
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($judge) {
            if (!$judge->judge_id) {
                $judge->judge_id = 'JG' . str_pad(
                    (Judge::max('id') ?? 0) + 1, 
                    6, 
                    '0', 
                    STR_PAD_LEFT
                );
            }
        });
    }

    /**
     * Get the court that owns the judge.
     */
    public function court()
    {
        return $this->belongsTo(Court::class);
    }

    /**
     * Get the user who created the judge.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the hearings assigned to this judge.
     */
    public function hearings()
    {
        return $this->hasMany(Hearing::class);
    }
}