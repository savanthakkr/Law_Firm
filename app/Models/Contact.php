<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Contact extends BaseModel
{
    protected $fillable = [
        'name',
        'email',
        'subject',
        'message'
    ];
}