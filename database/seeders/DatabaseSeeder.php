<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            // Core system seeders
            PermissionSeeder::class,
            RoleSeeder::class,
            PlanSeeder::class,
            UserSeeder::class,
            CurrencySeeder::class,
            EmailTemplateSeeder::class,
            LandingPageCustomPageSeeder::class,
            
            // Application seeders
            ClientSeeder::class,
            CompanySettingSeeder::class,
            TeamMemberRoleSeeder::class,
        ]);
    }
}

