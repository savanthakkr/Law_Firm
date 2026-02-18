<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CourtType extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'color',
        'status',
        'created_by'
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function courts()
    {
        return $this->hasMany(Court::class);
    }
}