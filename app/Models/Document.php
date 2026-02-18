<?php

namespace App\Models;

use App\Traits\AutoApplyPermissionCheck;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Document extends BaseModel
{
    use HasFactory, AutoApplyPermissionCheck;

    protected $fillable = [
        'name',
        'description',
        'category_id',
        'folder_id',
        'file_path',
        'status',
        'confidentiality',
        'tags',
        'created_by'
    ];

    protected $casts = [
        'tags' => 'array',
    ];

    public function category()
    {
        return $this->belongsTo(DocumentCategory::class);
    }

    public function folder()
    {
        return $this->belongsTo(DocumentFolder::class);
    }

    public function versions()
    {
        return $this->hasMany(DocumentVersion::class);
    }

    public function currentVersion()
    {
        return $this->hasOne(DocumentVersion::class)->where('is_current', true);
    }

    public function comments()
    {
        return $this->hasMany(DocumentComment::class);
    }

    public function permissions()
    {
        return $this->hasMany(DocumentPermission::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeWithPermissionCheck($query)
    {
        return $this->applyPermissionScope($query, 'documents');
    }


}