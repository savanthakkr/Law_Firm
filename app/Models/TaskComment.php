<?php

namespace App\Models;

use App\Traits\AutoApplyPermissionCheck;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaskComment extends BaseModel
{
    use HasFactory, AutoApplyPermissionCheck;

    protected $fillable = [
        'task_id',
        'comment_text',
        'is_internal',
        'created_by'
    ];

    protected $casts = [
        'is_internal' => 'boolean',
    ];

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}