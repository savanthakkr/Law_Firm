<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create default plans for legal practice
        $plans = [
            [
                'name' => 'Free',
                'price' => 0,
                'yearly_price' => 0,
                'duration' => 'monthly',
                'description' => 'Basic plan for solo practitioners just getting started.',
                'max_users' => 50,
                'max_cases' => 100,
                'max_clients' => 50,
                'enable_branding' => 'on',
                'enable_chatgpt' => 'off',
                'storage_limit' => 1,
                'is_trial' => null,
                'trial_day' => 0,
                'is_plan_enable' => 'on',
                'is_default' => true
            ],
            [
                'name' => 'Starter',
                'price' => 29.99,
                'yearly_price' => 287.90, // 20% discount for yearly
                'duration' => 'monthly',
                'description' => 'Perfect for small law firms looking to grow their practice.',
                'max_users' => 50,
                'max_cases' => 100,
                'max_clients' => 70,
                'enable_branding' => 'off',
                'enable_chatgpt' => 'off',
                'storage_limit' => 5,
                'is_trial' => 'on',
                'trial_day' => 7,
                'is_plan_enable' => 'on',
                'is_default' => false
            ],
            [
                'name' => 'Professional',
                'price' => 79.99,
                'yearly_price' => 767.90, // 20% discount for yearly
                'duration' => 'monthly',
                'description' => 'Ideal for growing law firms with multiple attorneys and advanced needs.',
                'max_users' => 70,
                'max_cases' => 200,
                'max_clients' => 100,
                'enable_branding' => 'off',
                'enable_chatgpt' => 'on',
                'storage_limit' => 50,
                'is_trial' => 'on',
                'trial_day' => 14,
                'is_plan_enable' => 'on',
                'is_default' => false
            ],
            [
                'name' => 'Enterprise',
                'price' => 149.99,
                'yearly_price' => 1439.90, // 20% discount for yearly
                'duration' => 'monthly',
                'description' => 'For large law firms with unlimited cases and premium features.',
                'max_users' => 100,
                'max_cases' => 300,
                'max_clients' => 150,
                'enable_branding' => 'off',
                'enable_chatgpt' => 'on',
                'storage_limit' => 70,
                'is_trial' => 'on',
                'trial_day' => 30,
                'is_plan_enable' => 'on',
                'is_default' => false
            ]
        ];
        
        foreach ($plans as $planData) {
            // Check if plan with this name already exists
            $existingPlan = Plan::where('name', $planData['name'])->first();
            
            if (!$existingPlan) {
                Plan::create($planData);
            }
        }
    }
}