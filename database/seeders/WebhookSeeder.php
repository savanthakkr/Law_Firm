<?php

namespace Database\Seeders;

use App\Models\Webhook;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class WebhookSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::where('type', 'company')->take(3)->get();

        if ($users->isEmpty()) {
            $this->command->warn('No company users found. Please seed users first.');
            return;
        }

        $webhooks = [
            [
                'user_id' => $users->first()->id,
                'module' => 'New User',
                'method' => 'POST',
                'url' => 'https://example.com/webhooks/new-user'
            ],
            [
                'user_id' => $users->first()->id,
                'module' => 'New Appointment',
                'method' => 'POST',
                'url' => 'https://example.com/webhooks/new-appointment'
            ],
            [
                'user_id' => $users->skip(1)->first()->id,
                'module' => 'New User',
                'method' => 'GET',
                'url' => 'https://company2.com/api/user-created'
            ],
            [
                'user_id' => $users->last()->id,
                'module' => 'New Appointment',
                'method' => 'POST',
                'url' => 'https://company3.com/webhooks/appointments'
            ]
        ];

        foreach ($webhooks as $webhookData) {
            Webhook::create($webhookData);
        }

        $this->command->info('Webhooks seeded successfully!');
    }
}