<?php

namespace App\Models;

use App\Traits\AutoApplyPermissionCheck;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClientDocument extends BaseModel
{
    use HasFactory, AutoApplyPermissionCheck;

    protected $fillable = [
        'client_id',
        'document_name',
        'file_path',
        'document_type_id',
        'description',
        'status',
        'created_by'
    ];

    /**
     * Get the client that owns the document.
     */
    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Get the user who created the document.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the document type.
     */
    public function documentType()
    {
        return $this->belongsTo(DocumentType::class, 'document_type_id');
    }


}