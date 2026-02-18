<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = Payment::withPermissionCheck()->with(['invoice.client', 'creator']);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->whereHas('invoice', function ($invoiceQuery) use ($request) {
                      $invoiceQuery->where('invoice_number', 'like', '%' . $request->search . '%')
                          ->orWhereHas('client', function ($clientQuery) use ($request) {
                              $clientQuery->where('name', 'like', '%' . $request->search . '%');
                          });
                  });
            });
        }

        if ($request->payment_method) {
            $query->where('payment_method', $request->payment_method);
        }

        if ($request->invoice_id) {
            $query->where('invoice_id', $request->invoice_id);
        }

        $payments = $query->orderBy('payment_date', 'desc')->paginate(10);
        $invoices = Invoice::withPermissionCheck()->with('client')->select('id', 'invoice_number', 'client_id')->get();

        return Inertia::render('billing/payments/index', [
            'payments' => $payments,
            'invoices' => $invoices,
            'filters' => $request->only(['search', 'payment_method', 'invoice_id']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
            'payment_method' => 'required|in:cash,check,credit_card,bank_transfer,online',
            'amount' => 'required|numeric|min:0.01',
            'payment_date' => 'required|date',
            'notes' => 'nullable|string|max:1000',
        ]);

        Payment::create([
            'created_by' => createdBy(),
            'invoice_id' => $request->invoice_id,
            'payment_method' => $request->payment_method,
            'amount' => $request->amount,
            'payment_date' => $request->payment_date,
            'notes' => $request->notes,
        ]);

        return redirect()->back()->with('success', 'Payment recorded successfully.');
    }

    public function update(Request $request, Payment $payment)
    {
        $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
            'payment_method' => 'required|in:cash,check,credit_card,bank_transfer,online',
            'amount' => 'required|numeric|min:0.01',
            'payment_date' => 'required|date',
            'notes' => 'nullable|string|max:1000',
        ]);

        $payment->update([
            'invoice_id' => $request->invoice_id,
            'payment_method' => $request->payment_method,
            'amount' => $request->amount,
            'payment_date' => $request->payment_date,
            'notes' => $request->notes,
        ]);

        return redirect()->back()->with('success', 'Payment updated successfully.');
    }

    public function destroy(Payment $payment)
    {
        $payment->delete();
        return redirect()->back()->with('success', 'Payment deleted successfully.');
    }
}