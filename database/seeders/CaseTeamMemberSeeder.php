<?php

namespace Database\Seeders;

use App\Models\CaseTeamMember;
use App\Models\CaseModel;
use App\Models\User;
use Illuminate\Database\Seeder;

class CaseTeamMemberSeeder extends Seeder
{
    public function run(): void
    {
        $companyUsers = User::where('type', 'company')->get();
        
        foreach ($companyUsers as $companyUser) {
            $cases = CaseModel::where('created_by', $companyUser->id)->get();
            $teamMembers = User::where('created_by', $companyUser->id)
                ->where('type', 'team_member')
                ->get();
            
            foreach ($cases as $case) {
                // Clear existing team members
                CaseTeamMember::where('case_id', $case->id)->delete();
                
                // Add company user as lead
                CaseTeamMember::create([
                    'case_id' => $case->id,
                    'user_id' => $companyUser->id,
                    'assigned_date' => now()->subDays(rand(20, 40)),
                    'status' => 'active',
                    'created_by' => $companyUser->id,
                ]);
                
                // Add 2-4 team members
                if ($teamMembers->isNotEmpty()) {
                    $count = min(rand(2, 4), $teamMembers->count());
                    $selected = $teamMembers->shuffle()->take($count);
                    
                    foreach ($selected as $member) {
                        CaseTeamMember::create([
                            'case_id' => $case->id,
                            'user_id' => $member->id,
                            'assigned_date' => now()->subDays(rand(1, 30)),
                            'status' => 'active',
                            'created_by' => $companyUser->id,
                        ]);
                    }
                }
            }
        }
    }
}