<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClientType extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'status',
        'created_by'
    ];

    /**
     * Get the user who created the client type.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the clients assigned to this type.
     */
    public function clients()
    {
        return $this->hasMany(Client::class);
    }
}