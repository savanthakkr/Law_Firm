<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompanyProfile extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'name',
        'registration_number',
        'address',
        'phone',
        'email',
        'website',
        'logo',
        'establishment_date',
        'company_size',
        'business_type',
        'status',
        'description',
        'created_by',
        // Advocate-specific fields
        'advocate_name',
        'bar_registration_number',
        'years_of_experience',
        'law_degree',
        'university',
        'specialization',
        'court_jurisdictions',
        'languages_spoken',
        'consultation_fees',
        'office_hours',
        'success_rate',
        'services_offered',
        'notable_cases'
    ];

    protected $casts = [
        'establishment_date' => 'date',
    ];

    /**
     * Boot method to auto-generate company ID
     */
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($profile) {
            if (!$profile->company_id) {
                $profile->company_id = 'CP' . str_pad(
                    (CompanyProfile::max('id') ?? 0) + 1, 
                    6, 
                    '0', 
                    STR_PAD_LEFT
                );
            }
        });
    }

    /**
     * Get the user who created the company profile.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the practice areas for this company.
     */
    public function practiceAreas()
    {
        return $this->hasMany(PracticeArea::class, 'company_profile_id');
    }
}