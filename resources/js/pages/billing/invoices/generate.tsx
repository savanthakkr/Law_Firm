import { usePage, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

export default function InvoiceGenerate() {
    const { t } = useTranslation();
    const { invoice, companyProfile, timeEntries, invoiceItems, clientBillingInfo, currencies } = usePage().props as any;

    const handlePayment = () => {
        router.get(route('billing.payments.index', { 
            invoice_id: invoice.id,
            invoice_number: invoice.invoice_number,
            amount: invoice.total_amount,
            auto_open: 'true'
        }));
    };

    const formatCurrency = (amount: number | string) => {
        // Get formatted currency using client billing info
        if (invoice.client_id && clientBillingInfo?.[invoice.client_id]?.currency && currencies) {
            const currencyCode = clientBillingInfo[invoice.client_id].currency;
            const currency = currencies.find(c => c.code === currencyCode);
            if (currency) {
                return `${currency.symbol}${parseFloat(amount.toString()).toFixed(2)}`;
            }
        }
        return window.appSettings?.formatCurrency ? window.appSettings.formatCurrency(amount) : `$${parseFloat(amount.toString()).toFixed(2)}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
                {/* Header */}
                <div className="bg-blue-600 text-white p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold">INVOICE</h1>
                            <p className="text-blue-100 mt-1">#{invoice.invoice_number}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-blue-100">
                                <p>{t('Invoice Date')}: {window.appSettings?.formatDate(invoice.invoice_date) || new Date(invoice.invoice_date).toLocaleDateString()}</p>
                                <p>{t('Due Date')}: {window.appSettings?.formatDate(invoice.due_date) || new Date(invoice.due_date).toLocaleDateString()}</p>
                                {invoice.currency && (
                                    <p>{t('Currency')}: {invoice.currency.code}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    {/* Company & Client Info */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('From')}:</h3>
                            <div className="text-gray-700">
                                <p className="font-semibold">{companyProfile?.name || 'Law Firm'}</p>
                                {companyProfile?.address && <p>{companyProfile.address}</p>}
                                {companyProfile?.phone && <p>Phone: {companyProfile.phone}</p>}
                                {companyProfile?.email && <p>Email: {companyProfile.email}</p>}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('Bill To')}:</h3>
                            <div className="text-gray-700">
                                <p className="font-semibold">{invoice.client?.name || ''}</p>
                                {invoice.client?.address && <p>{invoice.client.address}</p>}
                                {invoice.client?.phone && <p>Phone: {invoice.client.phone}</p>}
                                {invoice.client?.email && <p>Email: {invoice.client.email}</p>}
                            </div>
                        </div>
                    </div>
                    
                    {/* Case Information */}
                    {invoice.case && (
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-semibold text-gray-900 mb-2">{t('Case Information')}:</h4>
                            <p className="text-gray-700">{invoice.case.case_id ? `${invoice.case.case_id} - ${invoice.case.title}` : invoice.case.title}</p>
                        </div>
                    )}

                    {/* Invoice Details Table */}
                    <div className="mb-8">
                        <table className="w-full border border-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">{t('Description')}</th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 border-b">{t('Qty')}</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 border-b">{t('Rate')}</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 border-b">{t('Amount')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoiceItems && invoiceItems.length > 0 ? (
                                    invoiceItems.map((item, index) => (
                                        <tr key={index} className={`border-b ${item.type === 'expense' ? 'bg-orange-50' : ''}`}>
                                            <td className="px-4 py-4 text-sm text-gray-900">
                                                <div className="space-y-1">
                                                    <div>{item.description}</div>
                                                    {item.type === 'expense' && (
                                                        <div className="text-xs text-orange-600 flex items-center">
                                                            <span className="bg-orange-100 px-2 py-1 rounded text-orange-700 font-medium">Expense</span>
                                                            {item.expense_date && <span className="ml-2">{window.appSettings?.formatDate(item.expense_date) || new Date(item.expense_date).toLocaleDateString()}</span>}
                                                        </div>
                                                    )}
                                                    {item.type === 'time' && (
                                                        <div className="text-xs text-blue-600 flex items-center">
                                                            <span className="bg-blue-100 px-2 py-1 rounded text-blue-700 font-medium">Time Entry</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-900 text-center">{item.quantity}</td>
                                            <td className="px-4 py-4 text-sm text-gray-900 text-right">{formatCurrency(item.rate)}</td>
                                            <td className="px-4 py-4 text-sm text-gray-900 text-right">{formatCurrency(item.amount)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-4 text-center text-gray-500">
                                            {t('No items found')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end mb-8">
                        <div className="w-64">
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-700">{t('Subtotal')}:</span>
                                <span className="text-gray-900">{formatCurrency(invoice.subtotal)}</span>
                            </div>
                            {invoice.tax_amount > 0 && (
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-gray-700">{t('Tax')}:</span>
                                    <span className="text-gray-900">{formatCurrency(invoice.tax_amount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between py-3 border-b-2 border-gray-300 font-bold text-lg">
                                <span className="text-gray-900">{t('Total')}:</span>
                                <span className="text-gray-900">{formatCurrency(invoice.total_amount)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Status */}
                    <div className="mb-8">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-600">{t('Payment Status')}:</p>
                                    <p className={`font-semibold ${
                                        invoice.status === 'paid' ? 'text-green-600' : 
                                        invoice.status === 'overdue' ? 'text-red-600' : 'text-yellow-600'
                                    }`}>
                                        {t(invoice.status?.charAt(0).toUpperCase() + invoice.status?.slice(1))}
                                    </p>
                                </div>
                                {invoice.status !== 'paid' && (
                                    <button
                                        onClick={handlePayment}
                                        className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 print:hidden"
                                    >
                                        {t('Make Payment')}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {invoice.notes && (
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('Notes')}:</h3>
                            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{invoice.notes}</p>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="border-t pt-6">
                        <div className="flex justify-between items-center">
                            <button 
                                onClick={() => window.print()} 
                                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 print:hidden"
                            >
                                {t('Print Invoice')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}