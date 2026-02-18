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

export default function EditInvoice() {
  const { t } = useTranslation();
  const { clients, cases, invoice, clientBillingInfo, currencies } = usePage().props as any;
  
  // Get formatted currency using client billing info
  const formatAmount = (amount) => {
    if (formData.client_id && clientBillingInfo?.[formData.client_id]?.currency && currencies) {
      const currencyCode = clientBillingInfo[formData.client_id].currency;
      const currency = currencies.find(c => c.code === currencyCode);
      if (currency) {
        return `${currency.symbol}${amount}`;
      }
    }
    return `$${amount}`;
  };
  
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
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Initialize form data when invoice is loaded
  useEffect(() => {
    if (invoice && cases && clients) {
      // Set filtered cases first
      if (invoice.client_id) {
        const clientCases = cases.filter(c => parseInt(c.client_id) === parseInt(invoice.client_id)) || [];
        setFilteredCases(clientCases);
      }
      
      // Then set form data
      const newFormData = {
        client_id: invoice.client_id ? invoice.client_id.toString() : '',
        case_id: invoice.case_id ? invoice.case_id.toString() : '',
        invoice_date: invoice.invoice_date ? new Date(invoice.invoice_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        due_date: invoice.due_date ? new Date(invoice.due_date).toISOString().split('T')[0] : '',
        tax_rate: invoice.client?.tax_rate || 0,
        tax_amount: invoice.tax_amount || 0,
        notes: invoice.notes || '',
        line_items: invoice.line_items || [{ description: '', quantity: 1, rate: 0, amount: 0 }]
      };
      
      setFormData(newFormData);
      setIsInitialLoad(false);
    }
  }, [invoice, cases, clients]);

  useEffect(() => {
    if (formData.client_id && !isInitialLoad) {
      // Filter cases from existing data first
      const clientCases = cases?.filter(c => parseInt(c.client_id) === parseInt(formData.client_id)) || [];
      setFilteredCases(clientCases);
      
      // Reset case selection and clear line items when client changes
      if (invoice && formData.client_id !== invoice.client_id?.toString()) {
        setFormData(prev => ({
          ...prev,
          case_id: '',
          line_items: [{ description: '', quantity: 1, rate: 0, amount: 0 }]
        }));
      }
      
      // Set client's tax rate
      const selectedClient = clients?.find(c => parseInt(c.id) === parseInt(formData.client_id));
      if (selectedClient) {
        setFormData(prev => ({
          ...prev,
          tax_rate: selectedClient?.tax_rate || 0
        }));
      }
    } else if (formData.client_id === '') {
      setFilteredCases([]);
      setUnbilledTimeEntries([]);
    }
  }, [formData.client_id, isInitialLoad, cases, clients, invoice]);

  // Load time entries when case is selected
  useEffect(() => {
    if (formData.case_id && !isInitialLoad) {
      fetch(route('api.cases.time-entries', formData.case_id))
        .then(response => response.json())
        .then(response => {
          const data = response.data || response;
          if (Array.isArray(data) && data.length > 0) {
            setUnbilledTimeEntries(data);
            setFormData(prev => ({
              ...prev,
              line_items: data
            }));
          } else {
            setUnbilledTimeEntries([]);
          }
        })
        .catch(err => {
          console.error('Error fetching time entries:', err);
          setUnbilledTimeEntries([]);
        });
    } else {
      setUnbilledTimeEntries([]);
    }
  }, [formData.case_id, isInitialLoad]);

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Update tax rate when client changes
    if (field === 'client_id' && value) {
      const selectedClient = clients?.find(c => parseInt(c.id) === parseInt(value));
      if (selectedClient) {
        setFormData(prev => ({
          ...prev,
          [field]: value,
          tax_rate: selectedClient?.tax_rate || 0
        }));
      }
    }
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

    const submitData = {
      ...formData,
      subtotal: calculateSubtotal(),
      tax_amount: calculateTaxAmount(),
      total_amount: calculateTotal()
    };

    toast.loading('Updating invoice...');
    
    router.put(route('billing.invoices.update', invoice.id), submitData, {
      onSuccess: () => {
        toast.dismiss();
        toast.success('Invoice updated successfully');
        router.get(route('billing.invoices.index'));
      },
      onError: (errors) => {
        toast.dismiss();
        const errorMessages = Object.values(errors).flat().join(', ');
        toast.error(`Failed to update invoice: ${errorMessages}`);
      }
    });
  };

  // Get current client and case names for display
  const currentClient = clients?.find(c => parseInt(c.id) === parseInt(formData.client_id));
  const currentCase = filteredCases.find(c => parseInt(c.id) === parseInt(formData.case_id));

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Billing & Invoicing'), href: route('billing.invoices.index') },
    { title: t('Invoices'), href: route('billing.invoices.index') },
    { title: t('Edit Invoice') }
  ];

  return (
    <PageTemplate
      title={t('Edit Invoice')}
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
                   <div className="text-xs text-gray-500 mb-1">
                      Selected: {formData.client_id} | Current: {currentClient?.name || 'None'}
                    </div>
                    <Select key={`client-${formData.client_id}`} value={formData.client_id} onValueChange={(value) => updateFormData('client_id', value)}>
                      <SelectTrigger>
                       <SelectValue placeholder={currentClient?.name || t('Select Client')} />
                      </SelectTrigger>
                      <SelectContent>
                        {clients?.map(client => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="case_id">{t('Case')} *</Label>
                    <div className="text-xs text-gray-500 mb-1">
                      Selected: {formData.case_id} | Current: {currentCase?.title || 'None'} | Available: {filteredCases.length}
                    </div>
                    <Select key={`case-${formData.case_id}`} value={formData.case_id} onValueChange={(value) => updateFormData('case_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={currentCase?.title || t('Select Case')} />
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
                  <span>{formatAmount((calculateSubtotal() || 0).toFixed(2))}</span>
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
                  <span>{formatAmount((calculateTaxAmount() || 0).toFixed(2))}</span>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>{t('Total')}:</span>
                    <span>{formatAmount((calculateTotal() || 0).toFixed(2))}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-3">
                <Button type="submit" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  {t('Update Invoice')}
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