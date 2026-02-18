<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HearingNotification extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'hearing_id',
        'user_id',
        'type',
        'minutes_before',
        'status',
        'scheduled_at',
        'sent_at'
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'sent_at' => 'datetime',
    ];

    public function hearing()
    {
        return $this->belongsTo(Hearing::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}