<?php

namespace App\Models;

use App\Traits\AutoApplyPermissionCheck;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaskType extends BaseModel
{
    use HasFactory, AutoApplyPermissionCheck;

    protected $fillable = [
        'name',
        'description',
        'color',
        'default_duration',
        'status',
        'created_by'
    ];

    protected $casts = [
        'default_duration' => 'integer',
    ];

    /**
     * Get the user who created the task type.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the tasks for this task type.
     */
    public function tasks()
    {
        return $this->hasMany(Task::class);
    }
}