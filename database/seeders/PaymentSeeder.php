<?php

namespace Database\Seeders;

use App\Models\Payment;
use App\Models\Invoice;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PaymentSeeder extends Seeder
{
    public function run(): void
    {
        $companies = User::where('type', 'company')->get();

        foreach ($companies as $company) {
            $invoices = Invoice::where('created_by', $company->id)->get();

            if ($invoices->count() > 0) {
                // Create 2-3 payments per company
                $paymentCount = rand(8, 10);
                $paymentMethods = ['cash', 'check', 'credit_card', 'bank_transfer', 'online'];
                $noteTemplates = [
                    'Payment received for invoice services',
                    'Client payment for legal consultation',
                    'Retainer payment received',
                    'Partial payment for ongoing case',
                    'Full settlement payment received'
                ];
                
                for ($i = 1; $i <= $paymentCount; $i++) {
                    $invoice = $invoices->random();
                    $maxAmount = $invoice->total_amount;
                    
                    // Calculate existing payments for this invoice
                    $existingPayments = Payment::where('invoice_id', $invoice->id)->sum('amount');
                    $remainingAmount = $maxAmount - $existingPayments;
                    
                    if ($remainingAmount > 0) {
                        $paymentAmount = rand(1, 10) > 7 
                            ? $remainingAmount // 30% chance full payment
                            : rand(min(100, $remainingAmount), $remainingAmount); // Partial payment
                        
                        $paymentDate = $invoice->invoice_date->copy()->addDays(rand(1, 45));
                        
                        $paymentData = [
                            'created_by' => $company->id,
                            'invoice_id' => $invoice->id,
                            'payment_method' => $paymentMethods[rand(0, count($paymentMethods) - 1)],
                            'amount' => $paymentAmount,
                            'payment_date' => $paymentDate,
                            'notes' => $noteTemplates[($company->id + $i - 1) % count($noteTemplates)] . ' for ' . $company->name . '.',
                        ];
                        
                        Payment::firstOrCreate([
                            'invoice_id' => $paymentData['invoice_id'],
                            'payment_date' => $paymentData['payment_date'],
                            'created_by' => $company->id
                        ], $paymentData);
                    }
                }
            }
        }
    }
}