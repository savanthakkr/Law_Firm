<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\User;
use App\Models\Setting;
use App\Models\PlanOrder;
use App\Models\PaymentSetting;
use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Http\Request;

class BankPaymentController extends Controller
{
    public function processPayment(Request $request)
    {
        $validated = validatePaymentRequest($request, [
            'amount' => 'required|numeric|min:0',
        ]);

        try {
            $plan = Plan::findOrFail($validated['plan_id']);
            
            createPlanOrder([
                'user_id' => auth()->id(),
                'plan_id' => $plan->id,
                'billing_cycle' => $validated['billing_cycle'],
                'payment_method' => 'bank',
                'coupon_code' => $validated['coupon_code'] ?? null,
                'payment_id' => 'BANK_' . strtoupper(uniqid()),
                'status' => 'pending',
            ]);

            return back()->with('success', __('Payment request submitted. Your plan will be activated after payment verification.'));

        } catch (\Exception $e) {
            return handlePaymentError($e, 'bank');
        }
    }
    
    public function processInvoicePayment(Request $request)
    {
        $request->validate([
            'invoice_token' => 'required|string',
            'amount' => 'required|numeric|min:0'
        ]);
        
        try {
            $invoice = Invoice::where('payment_token', $request->invoice_token)->firstOrFail();
            
            Payment::create([
                'invoice_id' => $invoice->id,
                'amount' => $request->amount,
                'payment_method' => 'bank',
                'payment_id' => 'BANK_' . strtoupper(uniqid()),
                'status' => 'pending',
                'payment_date' => now(),
                'created_by' => $invoice->created_by
            ]);
            
            return back()->with('success', __('Payment request submitted. Invoice will be marked as paid after payment verification.'));
            
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Payment processing failed: ' . $e->getMessage()]);
        }
    }
}