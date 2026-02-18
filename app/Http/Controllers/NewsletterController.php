<?php

namespace App\Http\Controllers;

use App\Models\NewsletterSubscription;
use App\Services\EmailTemplateService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NewsletterController extends Controller
{
    public function subscribe(Request $request)
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $subscription = NewsletterSubscription::updateOrCreate(
            ['email' => $request->email],
            ['subscribed_at' => now(), 'unsubscribed_at' => null]
        );

        return back()->with('success', 'Successfully subscribed to newsletter!');
    }

    public function index(Request $request)
    {
        $query = NewsletterSubscription::query();

        if ($request->has('search')) {
            $query->where('email', 'like', "%{$request->search}%");
        }
        
        if ($request->has('status') && $request->status !== 'all') {
            if ($request->status === 'subscribed') {
                $query->whereNull('unsubscribed_at');
            } elseif ($request->status === 'unsubscribed') {
                $query->whereNotNull('unsubscribed_at');
            }
        }

        $subscriptions = $query->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 10))
            ->withQueryString();

        return Inertia::render('newsletter/index', [
            'subscriptions' => $subscriptions,
            'filters' => $request->all(['search', 'status', 'per_page']),
        ]);
    }

    public function send(Request $request)
    {
        $activeSubscribers = NewsletterSubscription::whereNull('unsubscribed_at')->get();

        if ($activeSubscribers->count() === 0) {
            return redirect()->route('newsletter.index')->with('error', 'No active subscribers found.');
        }

        try {
            $emailService = new EmailTemplateService();

            foreach ($activeSubscribers as $subscriber) {
                // Extract name from email (part before @)
                $emailName = explode('@', $subscriber->email)[0];
                $friendlyName = ucfirst(str_replace(['.', '_', '-'], ' ', $emailName));
                
                $variables = [
                    '{subscriber_email}' => $subscriber->email,
                    '{app_name}' => config('app.name'),
                    '{app_url}' => config('app.url'),
                    '{user_name}' => $friendlyName,
                    '{unsubscribe_url}' => route('newsletter.unsubscribe', $subscriber->email)
                ];

                $emailService->sendTemplateEmailWithLanguage(
                    templateName: 'Newsletter',
                    variables: $variables,
                    toEmail: $subscriber->email,
                    toName: $friendlyName,
                    language: 'en'
                );
            }
            return redirect()->route('newsletter.index')->with('success', 'Newsletter sent to ' . $activeSubscribers->count() . ' subscribers!');
        } catch (\Exception $e) {
            return redirect()->route('newsletter.index')->with('error', 'Failed to send newsletter: ' . $e->getMessage());
        }
    }

    public function unsubscribe($email)
    {
        $subscription = NewsletterSubscription::where('email', $email)->first();
        
        if ($subscription) {
            $subscription->update(['unsubscribed_at' => now()]);
            return response('<h2>Successfully Unsubscribed</h2><p>You have been unsubscribed from our newsletter.</p>');
        }
        
        return response('<h2>Error</h2><p>Email not found in our subscription list.</p>');
    }
}
