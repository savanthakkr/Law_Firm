<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResearchCitation extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'research_project_id',
        'citation_text',
        'source_id',
        'page_number',
        'citation_type',
        'notes',
        'created_by'
    ];

    public function researchProject()
    {
        return $this->belongsTo(ResearchProject::class);
    }

    public function source()
    {
        return $this->belongsTo(ResearchSource::class);
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