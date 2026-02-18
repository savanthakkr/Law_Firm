<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\EmailTemplateService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Console\Command;

class CheckPlanExpiry extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:check-plan-expiry';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check company plan and trial expiry, send reminders, and enforce access rules';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking company plan and trial expiry...');

        $today = Carbon::today();

        // 1) Send reminder on day 13 of a 15-day trial (2 days before expiry)
        $reminderDate = $today->copy()->addDays(2);

        $usersForReminder = User::where('type', 'company')
            ->where('is_trial', 1)
            ->whereNotNull('trial_expire_date')
            ->whereDate('trial_expire_date', $reminderDate)
            ->get();

        foreach ($usersForReminder as $user) {
            try {
                $emailService = new EmailTemplateService();

                $variables = [
                    '{user_email}' => $user->email,
                    '{user_name}' => $user->name,
                    '{trial_end_date}' => $user->trial_expire_date?->format('Y-m-d'),
                    '{app_name}' => config('app.name'),
                    '{app_url}' => config('app.url'),
                ];

                // Configure an email template named 'Trial Expiry Reminder'
                $emailService->sendTemplateEmailWithLanguage(
                    templateName: 'Trial Expiry Reminder',
                    variables: $variables,
                    toEmail: $user->email,
                    toName: $user->name,
                    language: $user->lang ?? 'en'
                );

                $this->info("Sent trial reminder email to user ID {$user->id}");
            } catch (\Throwable $e) {
                Log::error('Failed to send trial reminder email', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $this->info('Check completed.');
    }
}
