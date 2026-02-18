<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class ResearchProject extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'research_id',
        'title',
        'description',
        'research_type_id',
        'case_id',
        'status',
        'priority',
        'due_date',
        'created_by'
    ];

    protected $casts = [
        'due_date' => 'date',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($project) {
            if (!$project->research_id) {
                $project->research_id = 'RES' . str_pad(
                    (self::max('id') ?? 0) + 1, 
                    6, 
                    '0', 
                    STR_PAD_LEFT
                );
            }
        });
    }

    public function case()
    {
        return $this->belongsTo(CaseModel::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function researchType()
    {
        return $this->belongsTo(ResearchType::class);
    }

    public function notes()
    {
        return $this->hasMany(ResearchNote::class);
    }

    public function citations()
    {
        return $this->hasMany(ResearchCitation::class);
    }


}