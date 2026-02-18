<?php

namespace App\Models;

use App\Traits\AutoApplyPermissionCheck;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class DocumentComment extends BaseModel
{
    use HasFactory, AutoApplyPermissionCheck;

    protected $fillable = [
        'document_id',
        'comment_text',
        'is_resolved',
        'created_by'
    ];

    protected $casts = [
        'is_resolved' => 'boolean',
    ];

    public function document()
    {
        return $this->belongsTo(Document::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeWithPermissionCheck($query)
    {
        return $this->applyPermissionScope($query, 'document-comments');
    }
}