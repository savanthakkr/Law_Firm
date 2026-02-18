<?php

namespace Database\Seeders;

use App\Models\ClientBillingCurrency;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ClientBillingCurrencySeeder extends Seeder
{
    public function run(): void
    {
        $companyUsers = \App\Models\User::where('type', 'company')->get();
        
        foreach ($companyUsers as $companyUser) {
            // Create 3-7 currencies per company
            $currencyCount = rand(8, 10);
            $availableCurrencies = [
                ['name' => 'US Dollar', 'code' => 'USD', 'symbol' => '$', 'description' => 'United States Dollar', 'is_default' => true],
                ['name' => 'Euro', 'code' => 'EUR', 'symbol' => '€', 'description' => 'Euro', 'is_default' => false],
                ['name' => 'British Pound', 'code' => 'GBP', 'symbol' => '£', 'description' => 'British Pound Sterling', 'is_default' => false],
                ['name' => 'Japanese Yen', 'code' => 'JPY', 'symbol' => '¥', 'description' => 'Japanese Yen', 'is_default' => false],
                ['name' => 'Canadian Dollar', 'code' => 'CAD', 'symbol' => 'C$', 'description' => 'Canadian Dollar', 'is_default' => false],
                ['name' => 'Australian Dollar', 'code' => 'AUD', 'symbol' => 'A$', 'description' => 'Australian Dollar', 'is_default' => false],
                ['name' => 'Indian Rupee', 'code' => 'INR', 'symbol' => '₹', 'description' => 'Indian Rupee', 'is_default' => false],
                ['name' => 'Swiss Franc', 'code' => 'CHF', 'symbol' => 'Fr', 'description' => 'Swiss Franc', 'is_default' => false],
                ['name' => 'Chinese Yuan', 'code' => 'CNY', 'symbol' => '¥', 'description' => 'Chinese Yuan', 'is_default' => false],
                ['name' => 'South Korean Won', 'code' => 'KRW', 'symbol' => '₩', 'description' => 'South Korean Won', 'is_default' => false],
                ['name' => 'Singapore Dollar', 'code' => 'SGD', 'symbol' => 'S$', 'description' => 'Singapore Dollar', 'is_default' => false],
                ['name' => 'Mexican Peso', 'code' => 'MXN', 'symbol' => '$', 'description' => 'Mexican Peso', 'is_default' => false],
            ];

            // Randomly select currencies for this company
            $selectedCurrencies = collect($availableCurrencies)->random($currencyCount);
            
            foreach ($selectedCurrencies as $index => $currency) {
                ClientBillingCurrency::firstOrCreate(
                    ['code' => $currency['code'] . '_' . $companyUser->id, 'created_by' => $companyUser->id],
                    [
                        'name' => $currency['name'],
                        'symbol' => $currency['symbol'],
                        'description' => $currency['description'],
                        'is_default' => $index === 0, // First currency is default for this company
                        'status' => true,
                        'created_by' => $companyUser->id,
                    ]
                );
            }
        }
    }
}