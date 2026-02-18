<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CompanyProfile;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CompanyProfileSeeder extends Seeder
{
    public function run(): void
    {
        $companyUsers = User::where('type', 'company')->get();
        
        if ($companyUsers->isEmpty()) {
            $this->command->info('No company users found. Please create company users first.');
            return;
        }

        $advocateNames = [
            'Rajesh Kumar Patel', 'Sarah Williams Johnson', 'Michael Davis Brown', 
            'Emily Rodriguez Garcia', 'David Wilson Martinez', 'Jennifer Taylor Anderson'
        ];
        
        $specializations = [
            'Corporate Law, Contract Law, Intellectual Property Rights',
            'Family Law, Divorce, Child Custody, Domestic Relations',
            'Criminal Defense, White Collar Crime, Appeals',
            'Personal Injury, Medical Malpractice, Insurance Claims',
            'Real Estate, Property Law, Commercial Transactions',
            'Employment Law, Labor Relations, Workplace Disputes'
        ];
        
        $universities = [
            'Harvard Law School', 'Yale Law School', 'Stanford Law School',
            'Columbia Law School', 'NYU School of Law', 'Georgetown University Law Center'
        ];
        
        foreach ($companyUsers as $index => $companyUser) {
            $establishmentYear = rand(2010, 2020);
            $experience = date('Y') - $establishmentYear;
            
            CompanyProfile::firstOrCreate([
                'created_by' => $companyUser->id
            ], [
                // Personal Details
                'advocate_name' => $advocateNames[$index % count($advocateNames)],
                'bar_registration_number' => 'BAR/' . $establishmentYear . '/' . str_pad($companyUser->id, 5, '0', STR_PAD_LEFT),
                'years_of_experience' => $experience,
                
                // Contact Details
                'email' => $companyUser->email,
                'phone' => '+1-555-' . str_pad($companyUser->id, 4, '0', STR_PAD_LEFT),
                'website' => 'https://' . strtolower(str_replace(' ', '', $companyUser->name)) . '.com',
                'address' => ($index + 1) . '00 Legal Plaza, Suite ' . ($index + 1) . '0, New York, NY 1000' . ($index + 1),
                
                // Professional Details
                'law_degree' => 'JD, LLM (' . explode(',', $specializations[$index % count($specializations)])[0] . ')',
                'university' => $universities[$index % count($universities)],
                'specialization' => $specializations[$index % count($specializations)],
                
                // Court & Jurisdiction
                'court_jurisdictions' => 'New York State Courts, Federal District Court, Court of Appeals',
                'languages_spoken' => 'English, Spanish',
                
                // Business Details
                'consultation_fees' => rand(200, 500),
                'office_hours' => 'Monday to Friday: 9:00 AM - 6:00 PM, Saturday: 10:00 AM - 2:00 PM',
                'success_rate' => rand(75, 95),
                
                // Company Details
                'name' => $companyUser->name,
                'registration_number' => 'NY/LAW/' . $establishmentYear . '/' . str_pad($companyUser->id, 3, '0', STR_PAD_LEFT),
                'establishment_date' => $establishmentYear . '-' . str_pad(rand(1, 12), 2, '0', STR_PAD_LEFT) . '-' . str_pad(rand(1, 28), 2, '0', STR_PAD_LEFT),
                'company_size' => ['small', 'medium', 'large'][rand(0, 2)],
                'business_type' => 'law_firm',
                
                // Services
                'services_offered' => 'Legal Consultation, Contract Drafting, Legal Advisory, Litigation Support, Court Representation, Legal Documentation',
                'notable_cases' => 'Successfully handled major cases in ' . ($establishmentYear + 2) . ', ' . ($establishmentYear + 4) . ', and ' . ($establishmentYear + 6) . '. Recognized for excellence in legal practice.',
                'description' => $companyUser->name . ' is a professional law firm specializing in ' . explode(',', $specializations[$index % count($specializations)])[0] . '. With ' . $experience . ' years of experience, we provide comprehensive legal solutions.',
                'status' => 'active',
                'created_by' => $companyUser->id
            ]);
        }
    }
}