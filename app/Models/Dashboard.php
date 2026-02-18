<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Dashboard extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'dashboard_id',
        'name',
        'description',
        'layout_config',
        'dashboard_type',
        'is_default',
        'is_public',
        'status',
        'user_id',
        'created_by'
    ];

    protected $casts = [
        'layout_config' => 'array',
        'is_default' => 'boolean',
        'is_public' => 'boolean',
    ];

    /**
     * Boot method to auto-generate dashboard ID
     */
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($dashboard) {
            if (!$dashboard->dashboard_id) {
                $dashboard->dashboard_id = 'DSH' . str_pad(
                    (Dashboard::max('id') ?? 0) + 1, 
                    6, 
                    '0', 
                    STR_PAD_LEFT
                );
            }
        });
    }

    /**
     * Get the user who owns the dashboard.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the user who created the dashboard.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

}