<?php

namespace App\Models;

use App\Traits\AutoApplyPermissionCheck;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Conversation extends BaseModel
{
    use AutoApplyPermissionCheck;
    
    protected $fillable = [
        'company_id',
        'title',
        'type',
        'participants',
        'case_id',
        'last_message_at',
        'status',
        'created_by'
    ];

    protected $casts = [
        'participants' => 'array',
        'last_message_at' => 'datetime'
    ];

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class)->orderBy('created_at', 'desc');
    }

    public function latestMessage(): HasMany
    {
        return $this->hasMany(Message::class)->latest()->limit(1);
    }

    public function case(): BelongsTo
    {
        return $this->belongsTo(CaseModel::class, 'case_id');
    }

    public function getParticipantUsersAttribute()
    {
        return User::whereIn('id', $this->participants ?? [])->get();
    }

    public function getUnreadCountForUser($userId)
    {
        return $this->messages()
            ->where('recipient_id', $userId)
            ->where('is_read', false)
            ->count();
    }
}