<?php

namespace App\Models;

use App\Traits\AutoApplyPermissionCheck;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class LegalPrecedent extends BaseModel
{
    use HasFactory, AutoApplyPermissionCheck;

    protected $fillable = [
        'case_name',
        'citation',
        'jurisdiction',
        'summary',
        'category_id',
        'relevance_score',
        'decision_date',
        'court_level',
        'key_points',
        'status',
        'created_by'
    ];

    protected $casts = [
        'key_points' => 'array',
        'decision_date' => 'date',
        'relevance_score' => 'integer',
    ];

    public function category()
    {
        return $this->belongsTo(ResearchCategory::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}