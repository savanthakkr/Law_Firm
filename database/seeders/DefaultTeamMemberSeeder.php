<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class DefaultTeamMemberSeeder extends Seeder
{
    public function run(): void
    {
        // Get first company user if no auth user
        $companyUser = auth()->check() && auth()->user()->type === 'company' 
            ? auth()->user() 
            : User::where('type', 'company')->first();
            
        if (!$companyUser) {
            throw new \Exception('No company user found');
        }

        $companyId = $companyUser->id;

        // Check if team_member role exists for this company
        $teamRole = Role::where('name', 'team_member')
            ->where('created_by', $companyId)
            ->first();

        if (!$teamRole) {
            throw new \Exception('Team member role not found. Please run TeamMemberRoleSeeder first.');
        }

        // Create default team member user
        $teamMember = User::firstOrCreate([
            'email' => 'teammember@company.com',
            'created_by' => $companyId
        ], [
            'name' => 'John Doe',
            'password' => Hash::make('password'),
            'type' => 'team_member',
            'lang' => $companyUser->lang ?? 'en',
            'status' => 'active'
        ]);

        // Assign team member role
        $teamMember->assignRole($teamRole);
    }
}