import { PageTemplate } from '@/components/page-template';
import { usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, FileText, Send } from 'lucide-react';
import { toast } from '@/components/custom-toast';
import { useTranslation } from 'react-i18next';
import { hasPermission } from '@/utils/authorization';
import { formatCurrency } from '@/utils/helpers';

export default function ShowInvoice() {
  const { t } = useTranslation();
  const { invoice, auth, timeEntries, invoiceItems, clientBillingInfo, currencies } = usePage().props as any;
  const permissions = auth?.permissions || [];
  
  // Get formatted currency using client billing info
  const formatAmount = (amount) => {
    if (invoice.client_id && clientBillingInfo?.[invoice.client_id]?.currency && currencies) {
      const currencyCode = clientBillingInfo[invoice.client_id].currency;
      const currency = currencies.find(c => c.code === currencyCode);
      if (currency) {
        return `${currency.symbol}${amount}`;
      }
    }
    return formatCurrency(amount);
  };

  const handleSend = () => {
    toast.loading(t('Sending invoice...'));

    router.put(route('billing.invoices.send', invoice.id), {}, {
      onSuccess: (page) => {
        toast.dismiss();
        if (page.props.flash.success) {
          toast.success(page.props.flash.success);
        }
      },
      onError: (errors) => {
        toast.dismiss();
        toast.error(`Failed to send invoice: ${Object.values(errors).join(', ')}`);
      }
    });
  };

  const getStatusColor = (status: string) => {
    const statusColors = {
      draft: 'bg-gray-50 text-gray-700 ring-gray-600/20',
      sent: 'bg-blue-50 text-blue-700 ring-blue-600/20',
      paid: 'bg-green-50 text-green-700 ring-green-600/20',
      overdue: 'bg-red-50 text-red-700 ring-red-600/20',
      cancelled: 'bg-gray-50 text-gray-700 ring-gray-600/20'
    };
    return statusColors[status as keyof typeof statusColors] || statusColors.draft;
  };

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Billing & Invoicing'), href: route('billing.invoices.index') },
    { title: t('Invoices'), href: route('billing.invoices.index') },
    { title: t('View Invoice') }
  ];

  const pageActions = [
    {
      label: t('Back to Invoices'),
      icon: <ArrowLeft className="h-4 w-4 mr-2" />,
      variant: 'outline',
      onClick: () => router.get(route('billing.invoices.index'))
    }
  ];

  if (hasPermission(permissions, 'edit-invoices')) {
    pageActions.push({
      label: t('Edit Invoice'),
      icon: <Edit className="h-4 w-4 mr-2" />,
      variant: 'default',
      onClick: () => router.get(route('billing.invoices.edit', invoice.id))
    });
  }

  if (hasPermission(permissions, 'view-invoices')) {
    pageActions.push({
      label: t('Generate PDF'),
      icon: <FileText className="h-4 w-4 mr-2" />,
      variant: 'outline',
      onClick: () => window.open(route('billing.invoices.generate', invoice.id), '_blank')
    });
  }

  if (hasPermission(permissions, 'send-invoices') && invoice.status === 'draft') {
    pageActions.push({
      label: t('Send Invoice'),
      icon: <Send className="h-4 w-4 mr-2" />,
      variant: 'default',
      onClick: handleSend
    });
  }


  

  return (
    <PageTemplate
      title={`${t('Invoice')} #${invoice.invoice_number || invoice.id}`}
      breadcrumbs={breadcrumbs}
      actions={pageActions}
      noPadding
    >
      <div className="space-y-6">
        {/* Invoice Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {t('Invoice')} #{invoice.invoice_number || invoice.id}
              </h2>
              <p className="text-gray-600 mt-1">
                {t('Created on')} {window.appSettings?.formatDate(invoice.created_at) || new Date(invoice.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center rounded-md px-3 py-1 text-sm font-medium ring-1 ring-inset ${getStatusColor(invoice.status)}`}>
                {t(invoice.status?.charAt(0).toUpperCase() + invoice.status?.slice(1))}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">{t('Client Information')}</h3>
              <div className="space-y-2">
                <p><strong>{t('Name')}:</strong> {invoice.client?.name || '-'}</p>
                <p><strong>{t('Email')}:</strong> {invoice.client?.email || '-'}</p>
                <p><strong>{t('Phone')}:</strong> {invoice.client?.phone || '-'}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">{t('Invoice Details')}</h3>
              <div className="space-y-2">
                <p><strong>{t('Invoice Date')}:</strong> {window.appSettings?.formatDate(invoice.invoice_date) || new Date(invoice.invoice_date).toLocaleDateString()}</p>
                <p><strong>{t('Due Date')}:</strong> {window.appSettings?.formatDate(invoice.due_date) || new Date(invoice.due_date).toLocaleDateString()}</p>
                {invoice.case && (
                  <p><strong>{t('Case')}:</strong> {invoice.case.case_id ? `${invoice.case.case_id} - ${invoice.case.title}` : invoice.case.title}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">{t('Invoice Items')}</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Description')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Quantity')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Rate')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Amount')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoiceItems?.map((item: any, index: number) => (
                  <tr key={index} className={item.type === 'expense' ? 'bg-orange-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="space-y-1">
                        <div>{item.description}</div>
                        {item.type === 'expense' && (
                          <div className="text-xs text-orange-600 flex items-center">
                            <span className="bg-orange-100 px-2 py-1 rounded text-orange-700 font-medium">{t('Expense')}</span>
                            {item.expense_date && <span className="ml-2">{window.appSettings?.formatDate(item.expense_date) || new Date(item.expense_date).toLocaleDateString()}</span>}
                          </div>
                        )}
                        {item.type === 'time' && (
                          <div className="text-xs text-blue-600 flex items-center">
                            <span className="bg-blue-100 px-2 py-1 rounded text-blue-700 font-medium">{t('Time Entry')}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatAmount(parseFloat(item.rate || 0).toFixed(2))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatAmount(parseFloat(item.amount || 0).toFixed(2))}
                    </td>
                  </tr>
                ))}
                
                {(!invoiceItems || invoiceItems.length === 0) && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      {t('No items found')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invoice Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-end">
            <div className="w-full max-w-sm space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('Subtotal')}:</span>
                <span className="font-medium">{formatAmount(parseFloat(invoice.subtotal || 0).toFixed(2))}</span>
              </div>
              
              {invoice.tax_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('Tax')}:</span>
                  <span className="font-medium">{formatAmount(parseFloat(invoice.tax_amount || 0).toFixed(2))}</span>
                </div>
              )}
              
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>{t('Total')}:</span>
                  <span>{formatAmount(parseFloat(invoice.total_amount || 0).toFixed(2))}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">{t('Notes')}</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}
      </div>
    </PageTemplate>
  );
}