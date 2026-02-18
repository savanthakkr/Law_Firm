import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Calendar, User, Building2, Clock, Shield } from 'lucide-react';
import { PaymentGatewaySelection } from '@/components/payment-gateway-selection';
import { StripePaymentModal } from '@/components/payment-modals/stripe-payment-modal';
import { BankPaymentModal } from '@/components/payment-modals/bank-payment-modal';
import { PayPalPaymentModal } from '@/components/payment-modals/paypal-payment-modal';
import { RazorpayPaymentModal } from '@/components/payment-modals/razorpay-payment-modal';

export default function InvoicePayment() {
  const { invoice, enabledGateways, remainingAmount, clientBillingInfo, currencies } = usePage().props as any;
  const [selectedGateway, setSelectedGateway] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Get formatted currency using client billing info
  const formatAmount = (amount) => {
    if (invoice.client_id && clientBillingInfo?.[invoice.client_id]?.currency && currencies) {
      const currencyCode = clientBillingInfo[invoice.client_id].currency;
      const currency = currencies.find(c => c.code === currencyCode);
      if (currency) {
        return `${currency.symbol}${parseFloat(amount).toFixed(2)}`;
      }
    }
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const isOverdue = new Date(invoice.due_date) < new Date();
  
  const handleGatewaySelect = (gatewayId: string) => {
    setSelectedGateway(gatewayId);
    setShowPaymentModal(true);
  };
  
  const closeModal = () => {
    setShowPaymentModal(false);
    setSelectedGateway(null);
  };
  
  const renderPaymentModal = () => {
    if (!selectedGateway || !showPaymentModal) return null;
    
    const modalProps = {
      isOpen: showPaymentModal,
      onClose: closeModal,
      invoice,
      amount: Number(remainingAmount || invoice.total_amount || 0)
    };
    
    switch (selectedGateway) {
      case 'stripe':
        return <StripePaymentModal {...modalProps} />;
      case 'bank':
        return <BankPaymentModal {...modalProps} />;
      case 'paypal':
        return <PayPalPaymentModal {...modalProps} />;
      case 'razorpay':
        return <RazorpayPaymentModal {...modalProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-xl shadow-lg">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Invoice #{invoice.invoice_number}</h1>
                <p className="text-gray-600 text-sm sm:text-base flex items-center mt-1">
                  <Shield className="h-4 w-4 mr-1" />
                  Secure Payment Portal
                </p>
              </div>
            </div>
            <Badge variant={isOverdue ? 'destructive' : 'secondary'} className="text-xs sm:text-sm px-3 py-1.5 font-medium">
              {isOverdue ? 'Overdue' : 'Due'} {new Date(invoice.due_date).toLocaleDateString()}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Invoice Details - Left Side */}
          <div className="xl:col-span-3 space-y-6">
            {/* Client & Invoice Info */}
            <Card className="shadow-xl border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Building2 className="h-5 w-5" />
                  <span>Invoice Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Bill To</p>
                        <p className="text-xl font-bold text-gray-900 mt-1">{invoice.client?.name}</p>
                        {invoice.client?.email && (
                          <p className="text-sm text-gray-600 mt-1">{invoice.client.email}</p>
                        )}
                      </div>
                    </div>
                    {invoice.case && (
                      <div className="flex items-start space-x-4">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <FileText className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Case</p>
                          <p className="text-lg font-semibold text-gray-900 mt-1">{invoice.case.title}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <Calendar className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Invoice Date</p>
                        <p className="text-lg font-semibold text-gray-900 mt-1">{new Date(invoice.invoice_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className={`p-2 rounded-lg ${isOverdue ? 'bg-red-100' : 'bg-orange-100'}`}>
                        <Clock className={`h-5 w-5 ${isOverdue ? 'text-red-600' : 'text-orange-600'}`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Due Date</p>
                        <p className={`text-lg font-semibold mt-1 ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                          {new Date(invoice.due_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Invoice Items */}
            {invoice.line_items && invoice.line_items.length > 0 && (
              <Card className="shadow-xl border-0 overflow-hidden">
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle className="text-lg text-gray-900">Invoice Items</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Description</th>
                          <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider">Qty</th>
                          <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">Rate</th>
                          <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {invoice.line_items.map((item: any, index: number) => (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.description}</td>
                            <td className="px-6 py-4 text-sm text-gray-700 text-center font-medium">{item.quantity}</td>
                            <td className="px-6 py-4 text-sm text-gray-700 text-right font-medium">{formatAmount(item.rate)}</td>
                            <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">{formatAmount(item.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-6 border-t">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 font-medium">Subtotal</span>
                        <span className="font-semibold text-gray-900">{formatAmount(invoice.subtotal)}</span>
                      </div>
                      {invoice.tax_amount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 font-medium">Tax</span>
                          <span className="font-semibold text-gray-900">{formatAmount(invoice.tax_amount)}</span>
                        </div>
                      )}
                      <Separator className="my-3" />
                      <div className="flex justify-between text-xl font-bold">
                        <span className="text-gray-900">Total</span>
                        <span className="text-blue-600">{formatAmount(invoice.total_amount)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {invoice.notes && (
              <Card className="shadow-xl border-0">
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle className="text-lg text-gray-900">Additional Notes</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-700 leading-relaxed text-base">{invoice.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Payment Section - Right Side */}
          <div className="xl:col-span-2 space-y-6">
            {/* Payment Summary */}
            <Card className="shadow-xl border-0 overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <CardTitle className="text-lg font-bold">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-700 font-medium">Invoice Total</span>
                    <span className="text-xl font-bold text-gray-900">{formatAmount(invoice.total_amount)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-700 font-medium">Amount Due</span>
                    <span className="text-2xl font-bold text-red-600">{formatAmount(remainingAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Gateway Selection */}
            <Card className="shadow-xl border-0 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <CardTitle className="flex items-center space-x-2 text-lg font-bold">
                  <Shield className="h-5 w-5" />
                  <span>Secure Payment</span>
                </CardTitle>
                <CardDescription className="text-green-100 mt-1">Choose your preferred payment method</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <PaymentGatewaySelection 
                  enabledGateways={enabledGateways || []}
                  onGatewaySelect={handleGatewaySelect}
                  invoice={invoice}
                  amount={Number(remainingAmount || invoice.total_amount || 0)}
                />
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className="shadow-xl border-0 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-green-800 text-base">256-bit SSL Encryption</h4>
                    <p className="text-sm text-green-700 mt-1 leading-relaxed">
                      Your payment information is protected with bank-level security and encrypted end-to-end.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Payment Modals */}
      {renderPaymentModal()}
    </div>
  );
}