<?php

namespace App\Providers;

use App\Models\User;
use App\Models\Plan;
use App\Observers\UserObserver;
use App\Observers\PlanObserver;
use App\Providers\AssetServiceProvider;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(\App\Services\WebhookService::class);

        // Register our AssetServiceProvider
        $this->app->register(AssetServiceProvider::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (app()->environment('production')) {
            app('request')->server->set('HTTPS', true);
            URL::forceScheme('https');
        }

        User::observe(UserObserver::class);
        Plan::observe(PlanObserver::class);

        try {
            \App\Services\DynamicStorageService::configureDynamicDisks();
        } catch (\Exception $e) {
            // ignore
        }
    }
}
