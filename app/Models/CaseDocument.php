<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class CaseDocument extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'document_id',
        'case_id',
        'document_name',
        'file_path',
        'document_type_id',
        'description',
        'confidentiality',
        'document_date',
        'status',
        'created_by'
    ];

    protected $casts = [
        'document_date' => 'date',
    ];

    /**
     * Boot method to auto-generate document ID
     */
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($document) {
            if (!$document->document_id) {
                $document->document_id = 'DOC' . str_pad(
                    (CaseDocument::max('id') ?? 0) + 1, 
                    6, 
                    '0', 
                    STR_PAD_LEFT
                );
            }
        });
    }

    /**
     * Get the user who created the document.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the case this document belongs to.
     */
    public function case()
    {
        return $this->belongsTo(CaseModel::class, 'case_id');
    }

    /**
     * Get the document type.
     */
    public function documentType()
    {
        return $this->belongsTo(DocumentType::class, 'document_type_id');
    }


}