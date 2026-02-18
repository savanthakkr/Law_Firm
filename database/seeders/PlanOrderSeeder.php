<?php

namespace Database\Seeders;

use App\Models\PlanOrder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PlanOrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $companies = \App\Models\User::where('type', 'company')->get();
        $plans = \App\Models\Plan::all();
        $coupons = \App\Models\Coupon::where('status', 1)->get();

        if ($companies->isEmpty() || $plans->isEmpty()) {
            return;
        }

        $statuses = ['pending', 'approved', 'rejected', 'cancelled'];
        $paymentMethods = ['stripe', 'paypal', 'razorpay', 'bank_transfer', 'credit_card'];
        $billingCycles = ['monthly', 'yearly'];
        
        foreach ($companies->take(4) as $index => $company) {
            // Skip if not a company type user
            if ($company->type !== 'company') {
                continue;
            }
            
            $plan = $plans->random();
            $billingCycle = $billingCycles[array_rand($billingCycles)];
            $originalPrice = $billingCycle === 'yearly' ? ($plan->yearly_price ?? $plan->price * 12) : $plan->price;
            
            // Randomly apply coupon (30% chance)
            $coupon = null;
            $discountAmount = 0;
            if ($coupons->count() > 0 && rand(1, 100) <= 30) {
                $coupon = $coupons->random();
                if ($coupon->type === 'percentage') {
                    $discountAmount = ($originalPrice * $coupon->discount_amount) / 100;
                } else {
                    $discountAmount = min($coupon->discount_amount, $originalPrice);
                }
            }
            
            $finalPrice = $originalPrice - $discountAmount;
            $status = $statuses[$index % count($statuses)];
            $orderedAt = now()->subDays(rand(1, 60));
            
            $orderData = [
                'user_id' => $company->id,
                'plan_id' => $plan->id,
                'coupon_id' => $coupon ? $coupon->id : null,
                'billing_cycle' => $billingCycle,
                'original_price' => $originalPrice,
                'discount_amount' => $discountAmount,
                'final_price' => $finalPrice,
                'coupon_code' => $coupon ? $coupon->code : null,
                'payment_method' => $paymentMethods[array_rand($paymentMethods)],
                'payment_id' => 'pay_' . strtoupper(\Str::random(12)),
                'status' => $status,
                'ordered_at' => $orderedAt,
            ];
            
            // Add processing data for non-pending orders
            if ($status !== 'pending') {
                $orderData['processed_at'] = $orderedAt->addDays(rand(1, 5));
                $orderData['processed_by'] = 1; // Super admin
                
                if ($status === 'rejected' || $status === 'cancelled') {
                    $notes = [
                        'Payment verification failed',
                        'Invalid payment method',
                        'User requested cancellation',
                        'Duplicate order detected'
                    ];
                    $orderData['notes'] = $notes[array_rand($notes)];
                }
            }
            
            PlanOrder::create($orderData);
        }
    }
}
