<?php

namespace App\Models;

use App\Traits\AutoApplyPermissionCheck;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentCategory extends BaseModel
{
    use HasFactory, AutoApplyPermissionCheck;

    protected $fillable = [
        'category_id',
        'name',
        'description',
        'color',
        'status',
        'created_by'
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($category) {
            if (!$category->category_id) {
                $category->category_id = 'DCAT' . str_pad(
                    (self::max('id') ?? 0) + 1, 
                    6, 
                    '0', 
                    STR_PAD_LEFT
                );
            }
        });
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function documents()
    {
        return $this->hasMany(Document::class, 'category_id');
    }

    // public function scopeWithPermissionCheck($query)
    // {
    //     return $query->where('created_by', createdBy());
    // }
}