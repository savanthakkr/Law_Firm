import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { router } from '@inertiajs/react';
import { toast } from '@/components/custom-toast';

interface PayPalPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any;
  amount: number;
}

export function PayPalPaymentModal({ isOpen, onClose, invoice, amount }: PayPalPaymentModalProps) {
  const { t } = useTranslation();
  const [processing, setProcessing] = useState(false);

  const handlePayPalPayment = () => {
    setProcessing(true);

    router.post(route('invoice.payment.process', invoice.payment_token), {
      payment_method: 'paypal',
      invoice_token: invoice.payment_token,
      amount: amount,
      order_id: 'ORDER_' + Date.now(),
      payment_id: 'PAY_' + Date.now()
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
          <DialogTitle>{t('PayPal Payment')}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center p-6">
            <div className="text-6xl mb-4">🅿️</div>
            <h3 className="text-lg font-semibold mb-2">{t('Pay with PayPal')}</h3>
            <p className="text-2xl font-bold text-blue-600">${amount.toFixed(2)}</p>
            <p className="text-sm text-gray-600 mt-2">
              {t('You will be redirected to PayPal to complete your payment')}
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              {t('Cancel')}
            </Button>
            <Button onClick={handlePayPalPayment} disabled={processing} className="flex-1 bg-blue-600 hover:bg-blue-700">
              {processing ? t('Processing...') : t('Pay with PayPal')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}