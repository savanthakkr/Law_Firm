<?php

namespace Database\Seeders;

use App\Models\NewsletterSubscription;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NewsletterSeeder extends Seeder
{
    public function run(): void
    {
        $newsletters = [
            [
                'email' => 'sarah@mitchelllaw.com',
                'subscribed_at' => now()->subDays(5),
                'unsubscribed_at' => null,
            ],
            [
                'email' => 'michael@legalgroup.com',
                'subscribed_at' => now()->subDays(10),
                'unsubscribed_at' => null,
            ],
            [
                'email' => 'jennifer@corporatelaw.com',
                'subscribed_at' => now()->subDays(3),
                'unsubscribed_at' => null,
            ],
            [
                'email' => 'david@familylaw.com',
                'subscribed_at' => now()->subDays(15),
                'unsubscribed_at' => now()->subDays(10),
            ],
            [
                'email' => 'lisa@criminaldefense.com',
                'subscribed_at' => now()->subDays(1),
                'unsubscribed_at' => null,
            ],
            [
                'email' => 'robert@businesslaw.com',
                'subscribed_at' => now()->subDays(7),
                'unsubscribed_at' => null,
            ],
            [
                'email' => 'maria@immigrationlaw.com',
                'subscribed_at' => now()->subDays(12),
                'unsubscribed_at' => null,
            ],
            [
                'email' => 'john@personalinjury.com',
                'subscribed_at' => now()->subDays(20),
                'unsubscribed_at' => now()->subDays(15),
            ],
            [
                'email' => 'amanda@estateplanning.com',
                'subscribed_at' => now()->subDays(8),
                'unsubscribed_at' => now()->subDays(3),
            ],
            [
                'email' => 'carlos@taxlaw.com',
                'subscribed_at' => now()->subDays(25),
                'unsubscribed_at' => now()->subDays(20),
            ]
        ];

        foreach ($newsletters as $newsletterData) {
            NewsletterSubscription::create($newsletterData);
        }

    }
}