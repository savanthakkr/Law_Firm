import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { router } from '@inertiajs/react';
import { toast } from '@/components/custom-toast';

interface BankPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any;
  amount: number;
}

export function BankPaymentModal({ isOpen, onClose, invoice, amount }: BankPaymentModalProps) {
  const { t } = useTranslation();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = () => {
    setProcessing(true);

    router.post(route('invoice.payment.process', invoice.payment_token), {
      payment_method: 'bank',
      invoice_token: invoice.payment_token,
      amount: amount
    }, {
      onSuccess: () => {
        toast.success(t('Payment request submitted successfully'));
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
          <DialogTitle>{t('Bank Transfer Payment')}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">{t('Payment Instructions')}</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>{t('Amount')}:</strong> ${amount.toFixed(2)}</p>
              <p><strong>{t('Invoice')}:</strong> #{invoice.invoice_number}</p>
              <p><strong>{t('Reference')}:</strong> {invoice.payment_token}</p>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-800">
              {t('Your payment request will be submitted for manual verification. Please contact support for bank transfer details.')}
            </p>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              {t('Cancel')}
            </Button>
            <Button onClick={handleSubmit} disabled={processing} className="flex-1">
              {processing ? t('Submitting...') : t('Submit Request')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}