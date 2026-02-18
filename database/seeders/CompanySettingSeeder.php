<?php

namespace Database\Seeders;

use App\Models\CompanySetting;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CompanySettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {        
        // Get company users
        $companyUsers = User::where('type', 'company')->get();
        
        foreach ($companyUsers as $companyUser) {
            // Create default company settings
            $settings = [
                // General Settings
                ['setting_key' => 'timezone', 'setting_value' => 'UTC', 'setting_type' => 'text', 'category' => 'general', 'description' => 'Company timezone'],
                ['setting_key' => 'date_format', 'setting_value' => 'Y-m-d', 'setting_type' => 'text', 'category' => 'general', 'description' => 'Date format preference'],
                ['setting_key' => 'time_format', 'setting_value' => '24', 'setting_type' => 'text', 'category' => 'general', 'description' => 'Time format (12/24 hour)'],
                ['setting_key' => 'currency', 'setting_value' => 'USD', 'setting_type' => 'text', 'category' => 'general', 'description' => 'Default currency'],
                
                // Billing Settings
                ['setting_key' => 'default_hourly_rate', 'setting_value' => '150.00', 'setting_type' => 'number', 'category' => 'billing', 'description' => 'Default hourly billing rate'],
                ['setting_key' => 'invoice_prefix', 'setting_value' => 'INV-', 'setting_type' => 'text', 'category' => 'billing', 'description' => 'Invoice number prefix'],
                ['setting_key' => 'payment_terms', 'setting_value' => 'net_30', 'setting_type' => 'text', 'category' => 'billing', 'description' => 'Default payment terms'],
                
                // Notification Settings
                ['setting_key' => 'email_notifications', 'setting_value' => '1', 'setting_type' => 'boolean', 'category' => 'notifications', 'description' => 'Enable email notifications'],
                ['setting_key' => 'sms_notifications', 'setting_value' => '0', 'setting_type' => 'boolean', 'category' => 'notifications', 'description' => 'Enable SMS notifications'],
                ['setting_key' => 'case_reminders', 'setting_value' => '1', 'setting_type' => 'boolean', 'category' => 'notifications', 'description' => 'Enable case deadline reminders'],
                
                // Security Settings
                ['setting_key' => 'two_factor_auth', 'setting_value' => '0', 'setting_type' => 'boolean', 'category' => 'security', 'description' => 'Require two-factor authentication'],
                ['setting_key' => 'session_timeout', 'setting_value' => '120', 'setting_type' => 'number', 'category' => 'security', 'description' => 'Session timeout in minutes'],
                ['setting_key' => 'password_expiry', 'setting_value' => '90', 'setting_type' => 'number', 'category' => 'security', 'description' => 'Password expiry in days'],
            ];
            
            foreach ($settings as $settingData) {
                // Check if setting already exists
                $exists = CompanySetting::where('setting_key', $settingData['setting_key'])
                    ->where('created_by', $companyUser->id)
                    ->exists();
                    
                if (!$exists) {
                    CompanySetting::create([
                        ...$settingData,
                        'created_by' => $companyUser->id,
                    ]);
                }
            }
        }
    }
}