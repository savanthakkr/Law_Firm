<?php

namespace App\Models;

use App\Traits\AutoApplyPermissionCheck;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaskStatus extends BaseModel
{
    use HasFactory, AutoApplyPermissionCheck;

    protected $fillable = [
        'name',
        'color',
        'is_completed',
        'status',
        'created_by'
    ];

    protected $casts = [
        'sort_order' => 'integer',
        'is_completed' => 'boolean',
    ];

    /**
     * Get the user who created the task status.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the tasks for this task status.
     */
    public function tasks()
    {
        return $this->hasMany(Task::class);
    }
}