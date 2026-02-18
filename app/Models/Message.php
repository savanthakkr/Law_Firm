<?php

namespace App\Models;

use App\Traits\AutoApplyPermissionCheck;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends BaseModel
{
    use AutoApplyPermissionCheck;
    
    protected $fillable = [
        'message_id',
        'company_id',
        'sender_id',
        'recipient_id',
        'conversation_id',
        'subject',
        'content',
        'message_type',
        'priority',
        'is_read',
        'read_at',
        'attachments',
        'case_id',
        'status',
        'created_by'
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'read_at' => 'datetime',
        'attachments' => 'array'
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            if (empty($model->message_id)) {
                $model->message_id = 'MSG-' . strtoupper(uniqid());
            }
        });
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function recipient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recipient_id');
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    public function case(): BelongsTo
    {
        return $this->belongsTo(CaseModel::class, 'case_id');
    }

    public function markAsRead()
    {
        $this->update([
            'is_read' => true,
            'read_at' => now()
        ]);
    }
}