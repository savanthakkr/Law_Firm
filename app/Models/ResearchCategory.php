<?php

namespace App\Models;

use App\Traits\AutoApplyPermissionCheck;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResearchCategory extends BaseModel
{
    use HasFactory, AutoApplyPermissionCheck;

    protected $fillable = [
        'name',
        'description',
        'color',
        'practice_area_id',
        'status',
        'created_by'
    ];

    public function practiceArea()
    {
        return $this->belongsTo(PracticeArea::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // public function scopeWithPermissionCheck($query)
    // {
    //     return $query->where('created_by', createdBy());
    // }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}