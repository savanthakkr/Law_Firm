import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

interface PaymentGateway {
  id: string;
  name: string;
  icon: string;
}

interface PaymentGatewaySelectionProps {
  enabledGateways: PaymentGateway[];
  onGatewaySelect: (gatewayId: string) => void;
  invoice: any;
  amount: number;
}

export function PaymentGatewaySelection({ 
  enabledGateways, 
  onGatewaySelect, 
  invoice, 
  amount 
}: PaymentGatewaySelectionProps) {
  const { t } = useTranslation();

  if (enabledGateways.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600">{t('No payment methods available')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900">
          {t('Invoice')} #{invoice.invoice_number}
        </h3>
        <p className="text-2xl font-bold text-blue-900 mt-2">
          ${amount.toFixed(2)}
        </p>
        <p className="text-sm text-blue-700 mt-1">
          {t('Amount Due')}
        </p>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">{t('Select Payment Method')}</h4>
        
        {enabledGateways.map((gateway) => (
          <Card 
            key={gateway.id}
            className="cursor-pointer transition-all duration-200 hover:border-blue-400 hover:shadow-md"
            onClick={() => onGatewaySelect(gateway.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{gateway.icon}</span>
                  <div>
                    <span className="font-medium text-gray-900">{gateway.name}</span>
                    <p className="text-sm text-gray-500">
                      {t('Pay')} ${amount.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="text-blue-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center text-sm text-gray-500 mt-6">
        <p>{t('Secure payment processing')}</p>
      </div>
    </div>
  );
}