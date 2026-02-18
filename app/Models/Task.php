<?php

namespace App\Models;

use App\Traits\AutoApplyPermissionCheck;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Task extends BaseModel
{
    use HasFactory, AutoApplyPermissionCheck;

    protected $fillable = [
        'task_id',
        'title',
        'description',
        'priority',
        'status',
        'due_date',
        'estimated_duration',
        'case_id',
        'assigned_to',
        'task_type_id',
        'task_status_id',
        'notes',
        'created_by'
    ];

    protected $casts = [
        'due_date' => 'datetime',
        'estimated_duration' => 'integer',
    ];

    /**
     * Boot method to auto-generate task ID
     */
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($task) {
            if (!$task->task_id) {
                $task->task_id = 'TSK' . str_pad(
                    (Task::max('id') ?? 0) + 1, 
                    6, 
                    '0', 
                    STR_PAD_LEFT
                );
            }
        });
    }

    /**
     * Get the case that owns the task.
     */
    public function case()
    {
        return $this->belongsTo(CaseModel::class, 'case_id');
    }

    /**
     * Get the user assigned to the task.
     */
    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Get the task type that owns the task.
     */
    public function taskType()
    {
        return $this->belongsTo(TaskType::class);
    }

    /**
     * Get the task status that owns the task.
     */
    public function taskStatus()
    {
        return $this->belongsTo(TaskStatus::class);
    }

    /**
     * Get the user who created the task.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}