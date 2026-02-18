import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import { router } from '@inertiajs/react';
import { toast } from '@/components/custom-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader2 } from 'lucide-react';

interface StripePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any;
  amount: number;
  stripeKey?: string;
}

interface StripeCheckoutFormProps {
  invoice: any;
  amount: number;
  onClose: () => void;
}

const StripeCheckoutForm = ({ invoice, amount, onClose }: StripeCheckoutFormProps) => {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const [cardholderName, setCardholderName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !cardholderName.trim()) {
      toast.error(t('Please fill in all required fields'));
      return;
    }

    setIsProcessing(true);
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setIsProcessing(false);
      return;
    }

    try {
      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: cardholderName,
        },
      });

      if (error) {
        console.log('Error creating payment method:', error);
        toast.error(error.message || t('Payment failed'));
        setIsProcessing(false);
        return;
      }

      // Send payment to backend
      const response = await fetch(route('invoice.payment.process', invoice.payment_token), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        },
        body: JSON.stringify({
          payment_method: 'stripe',
          invoice_token: invoice.payment_token,
          amount: amount,
          payment_method_id: paymentMethod.id,
          cardholder_name: cardholderName
        })
      });

      const result = await response.json();

      if (result.requires_action) {
        if (result.redirect_url) {
          // Handle redirect-based 3DS
          window.location.href = result.redirect_url;
          return;
        } else if (result.payment_intent) {
          // Handle client-side 3DS using confirmCardPayment
          const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
            result.payment_intent.client_secret,
            {
              payment_method: paymentMethod.id
            }
          );

          if (confirmError) {
            console.log('3DS confirmation error:', confirmError);
            toast.error(confirmError.message || t('Authentication failed'));
            setIsProcessing(false);
            return;
          }

          if (paymentIntent.status === 'succeeded') {
            toast.success(t('Payment successful'));
            onClose();
            return;
          }
        }
      }

      if (result.success) {
        toast.success(t('Payment successful'));
        onClose();
      } else {
        toast.error(result.message || t('Payment failed'));
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      toast.error(err.message || t('Payment processing failed'));
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cardholder-name">{t('Name on card')}</Label>
        <Input
          id="cardholder-name"
          type="text"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          placeholder={t('Enter cardholder name')}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>{t('Card details')}</Label>
        <div className="p-3 border rounded-md">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isProcessing}
          className="flex-1"
        >
          {t('Cancel')}
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t('Processing...')}
            </>
          ) : (
            `${t('Pay')} $${amount.toFixed(2)}`
          )}
        </Button>
      </div>
    </form>
  );
};

export function StripePaymentModal({ isOpen, onClose, invoice, amount, stripeKey }: StripePaymentModalProps) {
  const { t } = useTranslation();
  const [stripePromise, setStripePromise] = useState<any>(null);

  useEffect(() => {
    // Try to get Stripe key from various sources
    const getStripeKey = () => {
      if (stripeKey && stripeKey.startsWith('pk_')) {
        return stripeKey;
      }
      
      // Try to get from window/global object if available
      if (typeof window !== 'undefined' && (window as any).stripePublishableKey) {
        return (window as any).stripePublishableKey;
      }
      
      // Try to get from meta tag
      const metaStripe = document.querySelector('meta[name="stripe-key"]');
      if (metaStripe) {
        return metaStripe.getAttribute('content');
      }
      
      return null;
    };

    const key = getStripeKey();
    if (key && key.startsWith('pk_')) {
      setStripePromise(loadStripe(key));
    }
  }, [stripeKey]);

  if (!stripePromise) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('Credit Card Payment')}</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center text-red-500">
            {t('Stripe not configured properly')}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('Credit Card Payment')}</DialogTitle>
        </DialogHeader>
        
        <Elements stripe={stripePromise}>
          <StripeCheckoutForm
            invoice={invoice}
            amount={amount}
            onClose={onClose}
          />
        </Elements>
      </DialogContent>
    </Dialog>
  );
}