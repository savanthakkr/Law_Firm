<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResearchNote extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'research_project_id',
        'title',
        'note_content',
        'source_reference',
        'tags',
        'is_private',
        'created_by'
    ];

    protected $casts = [
        'tags' => 'array',
        'is_private' => 'boolean',
    ];

    public function researchProject()
    {
        return $this->belongsTo(ResearchProject::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeWithPermissionCheck($query)
    {
        return $query->whereHas('researchProject', function ($q) {
            $q->where('created_by', createdBy());
        });
    }
}