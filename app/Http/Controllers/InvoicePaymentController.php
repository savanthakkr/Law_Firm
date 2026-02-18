<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Payment;
use App\Models\PaymentSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InvoicePaymentController extends Controller
{
    public function show($token)
    {
        $invoice = Invoice::where('payment_token', $token)
            ->with(['client', 'case'])
            ->firstOrFail();
            
        if ($invoice->status === 'paid' || $invoice->remaining_amount <= 0) {
            return Inertia::render('invoice/payment-complete', [
                'invoice' => array_merge($invoice->toArray(), [
                    'from_name' => getSetting('email_from_name') ?: config('app.name')
                ])
            ]);
        }
        
        $enabledGateways = $this->getEnabledPaymentGateways();
        
        // Load client billing info and currencies (no permission check for public payment page)
        $clientBillingInfo = \App\Models\ClientBillingInfo::select('client_id', 'currency')
            ->get()
            ->keyBy('client_id');
        $currencies = \App\Models\ClientBillingCurrency::where('status', true)
            ->select('id', 'name', 'code', 'symbol')
            ->get();
        
        return Inertia::render('invoice/payment', [
            'invoice' => $invoice,
            'enabledGateways' => $enabledGateways,
            'remainingAmount' => $invoice->remaining_amount,
            'clientBillingInfo' => $clientBillingInfo,
            'currencies' => $currencies
        ]);
    }
    
    public function processPayment(Request $request, $token)
    {
        $invoice = Invoice::where('payment_token', $token)->firstOrFail();
        
        $request->validate([
            'payment_method' => 'required|string',
            'amount' => 'required|numeric|min:0.01|max:' . ($invoice->remaining_amount ?: $invoice->total_amount)
        ]);
        
        // Add invoice context to request
        $request->merge([
            'invoice_id' => $invoice->id,
            'invoice_token' => $token,
            'type' => 'invoice'
        ]);
        
        $paymentMethod = $request->payment_method;
        
        // Call specific invoice payment methods
        $controllerMap = [
            'bank' => '\App\Http\Controllers\BankPaymentController',
            'stripe' => '\App\Http\Controllers\StripePaymentController',
            'paypal' => '\App\Http\Controllers\PayPalPaymentController',
            'razorpay' => '\App\Http\Controllers\RazorpayController',
            'paystack' => '\App\Http\Controllers\PaystackPaymentController',
            'flutterwave' => '\App\Http\Controllers\FlutterwavePaymentController',
            'mercadopago' => '\App\Http\Controllers\MercadoPagoController',
            'cashfree' => '\App\Http\Controllers\CashfreeController',
            'khalti' => '\App\Http\Controllers\KhaltiPaymentController'
        ];
        
        if (!isset($controllerMap[$paymentMethod])) {
            return back()->withErrors(['error' => 'Payment method not supported']);
        }
        
        try {
            $controller = app($controllerMap[$paymentMethod]);
            return $controller->processInvoicePayment($request);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Payment processing failed: ' . $e->getMessage()]);
        }
    }
    

    
    public function success($token)
    {
        $invoice = Invoice::where('payment_token', $token)
            ->with(['client', 'payments'])
            ->firstOrFail();
            
        return Inertia::render('invoice/payment-success', [
            'invoice' => $invoice
        ]);
    }
    
    private function getEnabledPaymentGateways()
    {
        $superAdminId = \App\Models\User::where('type', 'superadmin')->first()?->id;
        if (!$superAdminId) {
            return [];
        }
        
        $settings = PaymentSetting::getUserSettings($superAdminId);
        $gateways = [];
        
        $paymentGateways = [
            'stripe' => ['name' => 'Credit Card (Stripe)', 'icon' => '💳'],
            'paypal' => ['name' => 'PayPal', 'icon' => '🅿️'],
            'razorpay' => ['name' => 'Razorpay', 'icon' => '💰'],
            'paystack' => ['name' => 'Paystack', 'icon' => '💳'],
            'flutterwave' => ['name' => 'Flutterwave', 'icon' => '💳'],
            'mercadopago' => ['name' => 'Mercado Pago', 'icon' => '💳'],
            'cashfree' => ['name' => 'Cashfree', 'icon' => '💳'],
            'khalti' => ['name' => 'Khalti', 'icon' => '💳'],
            'bank' => ['name' => 'Bank Transfer', 'icon' => '🏦']
        ];
        
        foreach ($paymentGateways as $key => $config) {
            if ($settings["is_{$key}_enabled"] ?? false) {
                $gateways[] = [
                    'id' => $key,
                    'name' => $config['name'],
                    'icon' => $config['icon']
                ];
            }
        }
        
        return $gateways;
    }
}