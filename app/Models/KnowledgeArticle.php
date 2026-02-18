<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\AutoApplyPermissionCheck;

class KnowledgeArticle extends BaseModel
{
    use HasFactory, AutoApplyPermissionCheck;

    protected $fillable = [
        'title',
        'content',
        'category_id',
        'tags',
        'is_public',
        'status',
        'created_by'
    ];

    protected $casts = [
        'tags' => 'array',
        'is_public' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(ResearchCategory::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }



    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }
}