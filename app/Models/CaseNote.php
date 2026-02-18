<?php

namespace App\Models;

use App\Traits\AutoApplyPermissionCheck;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CaseNote extends BaseModel
{
    use HasFactory, AutoApplyPermissionCheck;

    protected $fillable = [
        'note_id',
        'title',
        'content',
        'note_type',
        'priority',
        'is_private',
        'note_date',
        'tags',
        'case_ids',
        'status',
        'created_by'
    ];

    protected $casts = [
        'note_date' => 'date',
        'is_private' => 'boolean',
        'tags' => 'array',
        'case_ids' => 'array',
    ];

    /**
     * Boot method to auto-generate note ID
     */
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($note) {
            if (!$note->note_id) {
                $note->note_id = 'NOTE' . str_pad(
                    (CaseNote::max('id') ?? 0) + 1, 
                    6, 
                    '0', 
                    STR_PAD_LEFT
                );
            }
        });
    }

    /**
     * Get the user who created the note.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the related cases.
     */
    public function cases()
    {
        return $this->belongsToMany(CaseModel::class, null, 'id', 'id')
            ->whereIn('cases.id', $this->case_ids ?? []);
    }

    /**
     * Get formatted content preview
     */
    public function getContentPreviewAttribute()
    {
        return strlen($this->content) > 100 
            ? substr($this->content, 0, 100) . '...' 
            : $this->content;
    }
}