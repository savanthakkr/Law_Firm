<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompanySetting extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'setting_key',
        'setting_value',
        'setting_type',
        'category',
        'description',
        'created_by'
    ];

    /**
     * Get the user who created the setting.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get formatted setting value based on type
     */
    public function getFormattedValueAttribute()
    {
        switch ($this->setting_type) {
            case 'boolean':
                return (bool) $this->setting_value;
            case 'number':
                return (float) $this->setting_value;
            case 'json':
                return json_decode($this->setting_value, true);
            default:
                return $this->setting_value;
        }
    }
}