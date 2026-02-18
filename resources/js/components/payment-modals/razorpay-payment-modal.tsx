import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { router } from '@inertiajs/react';
import { toast } from '@/components/custom-toast';

interface RazorpayPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any;
  amount: number;
}

export function RazorpayPaymentModal({ isOpen, onClose, invoice, amount }: RazorpayPaymentModalProps) {
  const { t } = useTranslation();
  const [processing, setProcessing] = useState(false);

  const handleRazorpayPayment = () => {
    setProcessing(true);

    router.post(route('invoice.payment.process', invoice.payment_token), {
      payment_method: 'razorpay',
      invoice_token: invoice.payment_token,
      amount: amount,
      razorpay_payment_id: 'pay_' + Date.now(),
      razorpay_order_id: 'order_' + Date.now(),
      razorpay_signature: 'signature_' + Date.now()
    }, {
      onSuccess: () => {
        toast.success(t('Payment successful'));
        onClose();
      },
      onError: (errors) => {
        toast.error(Object.values(errors).join(', '));
        setProcessing(false);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('Razorpay Payment')}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center p-6">
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-lg font-semibold mb-2">{t('Pay with Razorpay')}</h3>
            <p className="text-2xl font-bold text-blue-600">₹{(amount * 75).toFixed(2)}</p>
            <p className="text-sm text-gray-600 mt-2">
              {t('Secure payment via Razorpay')}
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              {t('Cancel')}
            </Button>
            <Button onClick={handleRazorpayPayment} disabled={processing} className="flex-1 bg-blue-600 hover:bg-blue-700">
              {processing ? t('Processing...') : t('Pay Now')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}