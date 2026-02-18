<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NewsletterSubscription extends Model
{
    protected $fillable = [
        'email',
        'subscribed_at',
        'unsubscribed_at'
    ];
    
    protected $casts = [
        'subscribed_at' => 'datetime',
        'unsubscribed_at' => 'datetime'
    ];
}