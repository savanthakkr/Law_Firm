<?php

namespace Database\Seeders;

use App\Models\CleTracking;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CleTrackingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        
        // Get company users
        $companyUsers = User::where('type', 'company')->get();
        
        foreach ($companyUsers as $companyUser) {
            $staffUsers = User::where('created_by', $companyUser->id)->get();
            $allUsers = $staffUsers->push($companyUser); // Include company user
            
            // Create 2-3 CLE tracking records per company
            $cleCount = rand(8, 10);
            $courseNames = [
                'Legal Ethics and Professional Responsibility',
                'Advanced Civil Litigation',
                'Technology in Legal Practice',
                'Contract Law Updates',
                'Criminal Defense Strategies',
                'Family Law Practice',
                'Real Estate Law Fundamentals',
                'Employment Law Compliance'
            ];
            
            $providers = [
                'State Bar Association',
                'Legal Education Institute',
                'Digital Law Academy',
                'Professional Legal Training',
                'Continuing Education Center',
                'Law Practice Institute'
            ];
            
            $descriptions = [
                'Mandatory ethics training for legal professionals',
                'Advanced techniques in civil litigation practice',
                'Using technology tools in modern legal practice',
                'Latest updates in contract law and practice',
                'Strategic approaches to criminal defense',
                'Comprehensive family law practice training',
                'Fundamentals of real estate legal practice',
                'Employment law compliance and best practices'
            ];
            
            $statuses = ['completed', 'in_progress', 'expired'];
            
            for ($i = 1; $i <= $cleCount; $i++) {
                $completionDate = now()->subMonths(rand(1, 12));
                $expiryDate = $completionDate->copy()->addYears(rand(1, 3));
                $creditsEarned = rand(10, 50) / 10; // 1.0 to 5.0 credits
                $creditsRequired = $creditsEarned - rand(0, 5) / 10; // Slightly less or equal
                
                $cleData = [
                    'user_id' => $allUsers->random()->id,
                    'course_name' => $courseNames[($companyUser->id + $i - 1) % count($courseNames)],
                    'provider' => $providers[rand(0, count($providers) - 1)],
                    'credits_earned' => $creditsEarned,
                    'credits_required' => max($creditsRequired, 1.0), // Minimum 1.0 credit
                    'completion_date' => $completionDate,
                    'expiry_date' => $expiryDate,
                    'certificate_number' => 'CLE-' . $companyUser->id . str_pad($i, 3, '0', STR_PAD_LEFT) . rand(100, 999),
                    'certificate_file' => null,
                    'status' => $statuses[rand(0, count($statuses) - 1)],
                    'description' => $descriptions[($companyUser->id + $i - 1) % count($descriptions)] . ' for ' . $companyUser->name . '.',
                    'created_by' => $companyUser->id,
                ];
                
                CleTracking::firstOrCreate([
                    'course_name' => $cleData['course_name'],
                    'user_id' => $cleData['user_id'],
                    'created_by' => $companyUser->id
                ], $cleData);
            }
        }
    }
}