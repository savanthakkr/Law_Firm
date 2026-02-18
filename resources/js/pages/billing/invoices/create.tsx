import { useState, useEffect } from 'react';
import { PageTemplate } from '@/components/page-template';
import { usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus, Clock, FileText, ArrowLeft } from 'lucide-react';
import { toast } from '@/components/custom-toast';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/utils/helpers';

export default function CreateInvoice() {
  const { t } = useTranslation();
  const { clients, cases, timeEntries, clientBillingInfo, currencies } = usePage().props as any;
  
  const [formData, setFormData] = useState({
    client_id: '',
    case_id: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: '',
    tax_rate: 0,
    tax_amount: 0,
    notes: '',
    line_items: [{ description: '', quantity: 1, rate: 0, amount: 0 }]
  });

  const [filteredCases, setFilteredCases] = useState([]);
  const [unbilledTimeEntries, setUnbilledTimeEntries] = useState([]);
  
  // Get formatted currency using helper function
  const formatAmount = (amount) => {
    if (formData.client_id && clientBillingInfo?.[formData.client_id]?.currency && currencies) {
      const currencyCode = clientBillingInfo[formData.client_id].currency;
      const currency = currencies.find(c => c.code === currencyCode);
      if (currency) {
        // Use client's currency
        return `${currency.symbol}${amount.toFixed(2)}`;
      }
    }
    // Fallback to formatCurrency helper from settings
    return formatCurrency(amount);
  };

  useEffect(() => {
    if (formData.client_id) {
      // Fetch cases for selected client
      fetch(route('api.clients.cases', formData.client_id))
        .then(response => response.json())
        .then(response => {
          const data = response.data || response;
          setFilteredCases(Array.isArray(data) ? data : []);
          updateFormData('case_id', '');
        })
        .catch(err => {
          console.error('Error fetching cases:', err);
          setFilteredCases([]);
        });
      
      // Set client's tax rate and auto-calculate due date
      const selectedClient = clients?.find(c => c.id == formData.client_id);
      const billing = clientBillingInfo?.[formData.client_id];
      
      let dueDate = '';
      if (billing?.payment_terms && formData.invoice_date) {
        const invoiceDate = new Date(formData.invoice_date);
        switch(billing.payment_terms) {
          case 'net_15':
            dueDate = new Date(invoiceDate.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            break;
          case 'net_30':
            dueDate = new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            break;
          case 'net_45':
            dueDate = new Date(invoiceDate.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            break;
          case 'net_60':
            dueDate = new Date(invoiceDate.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            break;
          case 'due_on_receipt':
            dueDate = formData.invoice_date;
            break;
          default:
            dueDate = new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        }
      }
      
      setFormData(prev => ({
        ...prev,
        tax_rate: selectedClient?.tax_rate || 0,
        due_date: dueDate || prev.due_date,
        line_items: [{ description: '', quantity: 1, rate: 0, amount: 0 }]
      }));
      setUnbilledTimeEntries([]);
    } else {
      setFilteredCases([]);
      setUnbilledTimeEntries([]);
    }
  }, [formData.client_id]);

  // Load time entries when case is selected
  useEffect(() => {
    if (formData.case_id) {
      fetch(route('api.cases.time-entries', formData.case_id))
        .then(response => response.json())
        .then(response => {
          const data = response.data || response;
          if (Array.isArray(data) && data.length > 0) {
            setFormData(prev => ({
              ...prev,
              line_items: data
            }));
            setUnbilledTimeEntries(data);
          } else {
            setFormData(prev => ({
              ...prev,
              line_items: [{ description: '', quantity: 1, rate: 0, amount: 0 }]
            }));
            setUnbilledTimeEntries([]);
          }
        })
        .catch(err => {
          console.error('Error fetching time entries and expenses:', err);
          setFormData(prev => ({
            ...prev,
            line_items: [{ description: '', quantity: 1, rate: 0, amount: 0 }]
          }));
          setUnbilledTimeEntries([]);
        });
    } else {
      // Reset when no case selected
      setFormData(prev => ({
        ...prev,
        line_items: [{ description: '', quantity: 1, rate: 0, amount: 0 }]
      }));
      setUnbilledTimeEntries([]);
    }
  }, [formData.case_id]);



  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      line_items: [...prev.line_items, { description: '', quantity: 1, rate: 0, amount: 0 }]
    }));
  };

  const removeLineItem = (index) => {
    setFormData(prev => ({
      ...prev,
      line_items: prev.line_items.filter((_, i) => i !== index)
    }));
  };

  const updateLineItem = (index, field, value) => {
    const newItems = [...formData.line_items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    }
    
    setFormData(prev => ({ ...prev, line_items: newItems }));
  };

  const importTimeEntries = () => {
    const timeLineItems = unbilledTimeEntries.map(entry => ({
      description: entry.description,
      quantity: entry.hours,
      rate: entry.billable_rate,
      amount: entry.hours * entry.billable_rate
    }));
    
    setFormData(prev => ({
      ...prev,
      line_items: [...prev.line_items, ...timeLineItems]
    }));
  };

  const calculateSubtotal = () => {
    return formData.line_items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  };

  const calculateTaxAmount = () => {
    const subtotal = calculateSubtotal();
    return subtotal * (formData.tax_rate / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTaxAmount();
  };
  


  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.client_id) {
      toast.error('Please select a client');
      return;
    }
    
    if (!formData.case_id) {
      toast.error('Please select a case');
      return;
    }

    // Get currency ID from client billing info
    const clientBilling = clientBillingInfo?.[formData.client_id];
    let currency_id = null;
    
    if (clientBilling?.currency && currencies) {
      const currency = currencies.find(c => c.code === clientBilling.currency);
      currency_id = currency ? currency.id : null;
    }
    
    const submitData = {
      ...formData,
      currency_id: currency_id,
      subtotal: calculateSubtotal(),
      tax_amount: calculateTaxAmount(),
      total_amount: calculateTotal()
    };

    toast.loading('Creating invoice...');
    
    router.post(route('billing.invoices.store'), submitData, {
      onSuccess: () => {
        toast.dismiss();
        toast.success('Invoice created successfully');
        router.get(route('billing.invoices.index'));
      },
      onError: (errors) => {
        toast.dismiss();
        const errorMessages = Object.values(errors).flat().join(', ');
        toast.error(`Failed to create invoice: ${errorMessages}`);
      }
    });
  };

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Billing & Invoicing'), href: route('billing.invoices.index') },
    { title: t('Invoices'), href: route('billing.invoices.index') },
    { title: t('Create Invoice') }
  ];

  return (
    <PageTemplate
      title={t('Create Invoice')}
      breadcrumbs={breadcrumbs}
      actions={[
        {
          label: t('Back to Invoices'),
          icon: <ArrowLeft className="h-4 w-4 mr-2" />,
          variant: 'outline',
          onClick: () => router.get(route('billing.invoices.index'))
        }
      ]}
      noPadding
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Invoice Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client & Case Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">{t('Client & Case Information')}</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="client_id">{t('Client')} *</Label>
                    <Select value={formData.client_id} onValueChange={(value) => updateFormData('client_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('Select Client')} />
                      </SelectTrigger>
                      <SelectContent>
                        {clients && Array.isArray(clients) && clients.length > 0 ? (
                          clients.map(client => (
                            <SelectItem key={client.id} value={client.id.toString()}>
                              {client.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-clients" disabled>
                            {t('No clients available')}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="case_id">{t('Case')} *</Label>
                    <Select value={formData.case_id} onValueChange={(value) => updateFormData('case_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('Select Case')} />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredCases.length > 0 ? (
                          filteredCases.map(caseItem => (
                            <SelectItem key={caseItem.id} value={caseItem.id.toString()}>
                              {caseItem.case_id ? `${caseItem.case_id} - ${caseItem.title}` : caseItem.title}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-cases" disabled>
                            {t('No cases available')}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="invoice_date">{t('Invoice Date')} *</Label>
                    <Input
                      type="date"
                      value={formData.invoice_date}
                      onChange={(e) => updateFormData('invoice_date', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="due_date">{t('Due Date')} *</Label>
                    <Input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => updateFormData('due_date', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{t('Invoice Items')}</h3>
                <div className="flex gap-2">
                  {unbilledTimeEntries.length > 0 && (
                    <div className="text-sm text-green-600 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {unbilledTimeEntries.filter(item => item.type === 'time').length} {t('time entries')}, {unbilledTimeEntries.filter(item => item.type === 'expense').length} {t('expenses available')}
                    </div>
                  )}
                  <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('Add Item')}
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                {/* Header */}
                <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-700 border-b pb-2">
                  <div className="col-span-5">{t('Description')}</div>
                  <div className="col-span-2">{t('Quantity')}</div>
                  <div className="col-span-2">{t('Rate')}</div>
                  <div className="col-span-2">{t('Amount')}</div>
                  <div className="col-span-1"></div>
                </div>

                {/* Line Items */}
                {formData.line_items.map((item, index) => (
                  <div key={index} className={`grid grid-cols-12 gap-2 items-center p-2 rounded ${item.type === 'expense' ? 'bg-orange-50 border border-orange-200' : ''}`}>
                    <div className="col-span-5">
                      <div className="space-y-1">
                        <Input
                          value={item.description}
                          onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                          placeholder={t('Item description')}
                        />
                        {item.type === 'expense' && (
                          <div className="text-xs text-orange-600 flex items-center">
                            <span className="bg-orange-100 px-2 py-1 rounded text-orange-700 font-medium">Expense</span>
                            {item.expense_date && <span className="ml-2">{new Date(item.expense_date).toLocaleDateString()}</span>}
                          </div>
                        )}
                        {item.type === 'time' && (
                          <div className="text-xs text-blue-600 flex items-center">
                            <span className="bg-blue-100 px-2 py-1 rounded text-blue-700 font-medium">Time Entry</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        value={item.rate}
                        onChange={(e) => updateLineItem(index, 'rate', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        value={item.amount}
                        onChange={(e) => updateLineItem(index, 'amount', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-span-1">
                      {formData.line_items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLineItem(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">{t('Additional Notes')}</h3>
              <Textarea
                value={formData.notes}
                onChange={(e) => updateFormData('notes', e.target.value)}
                placeholder={t('Add any additional notes or terms...')}
                rows={4}
              />
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">{t('Invoice Summary')}</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>{t('Subtotal')}:</span>
                  <span>{formatAmount(calculateSubtotal() || 0)}</span>
                </div>
                
                <div>
                  <Label htmlFor="tax_rate">{t('Tax Rate')} (%)</Label>
                  <Input
                    type="number"
                    value={formData.tax_rate}
                    onChange={(e) => updateFormData('tax_rate', parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
                
                <div className="flex justify-between">
                  <span>{t('Tax Amount')}:</span>
                  <span>{formatAmount(calculateTaxAmount() || 0)}</span>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>{t('Total')}:</span>
                    <span>{formatAmount(calculateTotal() || 0)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-3">
                <Button type="submit" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  {t('Create Invoice')}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.get(route('billing.invoices.index'))}
                >
                  {t('Cancel')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </PageTemplate>
  );
}