import { usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, FileText, Calendar, DollarSign } from 'lucide-react';

export default function PaymentComplete() {
  const { invoice } = usePage().props as any;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Complete!</h1>
          <p className="text-gray-600">This invoice has been fully paid</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Invoice #{invoice.invoice_number}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <FileText className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Client</p>
                    <p className="text-lg font-semibold text-gray-900">{invoice.client?.name}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Calendar className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Invoice Date</p>
                    <p className="text-base font-medium text-gray-900">
                      {new Date(invoice.invoice_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Amount</p>
                    <p className="text-lg font-semibold text-gray-900">
                      ${parseFloat(invoice.total_amount).toFixed(2)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="text-base font-semibold text-green-600">Paid in Full</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Payment Completed</span>
              </div>
              <p className="text-green-600 text-sm mt-1">
                This invoice has been paid in full. Thank you for your payment!
              </p>
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                If you have any questions about this invoice, please contact us.
              </p>
              <p className="text-gray-800 font-medium mt-2">
                {invoice.from_name || 'Company Name'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}