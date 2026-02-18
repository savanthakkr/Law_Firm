import { useState, useEffect } from 'react';
import { PageTemplate } from '@/components/page-template';
import { usePage, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { hasPermission } from '@/utils/authorization';
import { CrudTable } from '@/components/CrudTable';
import { CrudFormModal } from '@/components/CrudFormModal';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { toast } from '@/components/custom-toast';
import { useTranslation } from 'react-i18next';
import { Pagination } from '@/components/ui/pagination';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';
import { capitalize, formatCurrency } from '@/utils/helpers';

export default function Payments() {
  const { t } = useTranslation();
  const { auth, payments, invoices, filters: pageFilters = {} } = usePage().props as any;
  const permissions = auth?.permissions || [];

  // State
  const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
  const [selectedInvoice, setSelectedInvoice] = useState(pageFilters.invoice_id || 'all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(pageFilters.payment_method || 'all');
  const [showFilters, setShowFilters] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');

  // Auto-open modal from invoice page
  const [isAutoOpen, setIsAutoOpen] = useState(false);
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auto_open') === 'true') {
      const invoiceNumber = urlParams.get('invoice_number');
      const amount = urlParams.get('amount');
      const invoiceId = urlParams.get('invoice_id');
      
      setIsAutoOpen(true);
      setCurrentItem({
        invoice_id: invoiceId,
        amount: amount,
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash'
      });
      setFormMode('create');
      setIsFormModalOpen(true);
      
      // Clean URL
      window.history.replaceState({}, '', route('billing.payments.index'));
    }
  }, []);

  // Check if any filters are active
  const hasActiveFilters = () => {
    return searchTerm !== '' || selectedInvoice !== 'all' || selectedPaymentMethod !== 'all';
  };

  // Count active filters
  const activeFilterCount = () => {
    return (searchTerm ? 1 : 0) + (selectedInvoice !== 'all' ? 1 : 0) + (selectedPaymentMethod !== 'all' ? 1 : 0);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const applyFilters = () => {
    router.get(route('billing.payments.index'), {
      page: 1,
      search: searchTerm || undefined,
      invoice_id: selectedInvoice !== 'all' ? selectedInvoice : undefined,
      payment_method: selectedPaymentMethod !== 'all' ? selectedPaymentMethod : undefined,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const handleAction = (action: string, item: any) => {
    setCurrentItem(item);

    switch (action) {
      case 'view':
        setFormMode('view');
        setIsFormModalOpen(true);
        break;
      case 'edit':
        setFormMode('edit');
        setIsFormModalOpen(true);
        break;
      case 'delete':
        setIsDeleteModalOpen(true);
        break;
    }
  };

  const handleAddNew = () => {
    setCurrentItem(null);
    setFormMode('create');
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = (formData: any) => {
    if (formMode === 'create') {
      toast.loading(t('Recording payment...'));

      router.post(route('billing.payments.store'), formData, {
        onSuccess: (page) => {
          setIsFormModalOpen(false);
          toast.dismiss();
          if (page.props.flash.success) {
            toast.success(page.props.flash.success);
          }
        },
        onError: (errors) => {
          toast.dismiss();
          toast.error(`Failed to record payment: ${Object.values(errors).join(', ')}`);
        }
      });
    } else if (formMode === 'edit') {
      toast.loading(t('Updating payment...'));

      router.put(route('billing.payments.update', currentItem.id), formData, {
        onSuccess: (page) => {
          setIsFormModalOpen(false);
          toast.dismiss();
          if (page.props.flash.success) {
            toast.success(page.props.flash.success);
          }
        },
        onError: (errors) => {
          toast.dismiss();
          toast.error(`Failed to update payment: ${Object.values(errors).join(', ')}`);
        }
      });
    }
  };

  const handleDeleteConfirm = () => {
    toast.loading(t('Deleting payment...'));

    router.delete(route('billing.payments.destroy', currentItem.id), {
      onSuccess: (page) => {
        setIsDeleteModalOpen(false);
        toast.dismiss();
        if (page.props.flash.success) {
          toast.success(page.props.flash.success);
        }
      },
      onError: (errors) => {
        toast.dismiss();
        toast.error(`Failed to delete payment: ${Object.values(errors).join(', ')}`);
      }
    });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedInvoice('all');
    setSelectedPaymentMethod('all');
    setShowFilters(false);

    router.get(route('billing.payments.index'), {
      page: 1,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  // Define page actions
  const pageActions = [];

  if (hasPermission(permissions, 'create-payments')) {
    pageActions.push({
      label: t('Record Payment'),
      icon: <Plus className="h-4 w-4 mr-2" />,
      variant: 'default',
      onClick: () => handleAddNew()
    });
  }

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Billing & Invoicing'), href: route('billing.time-entries.index') },
    { title: t('Payments') }
  ];

  // Define table columns
  const columns = [
    {
      key: 'invoice',
      label: t('Invoice #'),
      render: (value: any) => value?.invoice_number || '-'
    },
    {
      key: 'client',
      label: t('Client'),
      render: (value: any, row: any) => row.invoice?.client?.name || '-'
    },
    {
      key: 'amount',
      label: t('Amount'),
      render: (value: any) => {
        const amount = parseFloat(value);
        return isNaN(amount) ? formatCurrency(0.00) : formatCurrency(amount.toFixed(2));
      }
    },
    {
      key: 'payment_method',
      label: t('Method'),
      render: (value: string) => (
        <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
          {t(capitalize(value))}
        </span>
      )
    },
    {
      key: 'payment_date',
      label: t('Date'),
      render: (value: string) => window.appSettings?.formatDate(value) || new Date(value).toLocaleDateString()
    },

  ];

  // Define table actions
  const actions = [
    {
      label: t('View'),
      icon: 'Eye',
      action: 'view',
      className: 'text-blue-500',
      requiredPermission: 'view-payments'
    },
    {
      label: t('Edit'),
      icon: 'Edit',
      action: 'edit',
      className: 'text-amber-500',
      requiredPermission: 'edit-payments'
    },
    {
      label: t('Delete'),
      icon: 'Trash2',
      action: 'delete',
      className: 'text-red-500',
      requiredPermission: 'delete-payments'
    }
  ];

  // Prepare filter options
  const invoiceOptions = [
    { value: 'all', label: t('All Invoices') },
    ...(invoices || []).map((invoice: any) => ({
      value: invoice.id.toString(),
      label: `${invoice.invoice_number} - ${invoice.client?.name}`
    }))
  ];

  const paymentMethodOptions = [
    { value: 'all', label: t('All Methods') },
    { value: 'cash', label: t('Cash') },
    { value: 'check', label: t('Check') },
    { value: 'credit_card', label: t('Credit Card') },
    { value: 'bank_transfer', label: t('Bank Transfer') },
    { value: 'online', label: t('Online Payment') }
  ];

  return (
    <PageTemplate
      title={t("Payments")}
      url="/billing/payments"
      actions={pageActions}
      breadcrumbs={breadcrumbs}
      noPadding
    >
      {/* Search and filters section */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow mb-4 p-4">
        <SearchAndFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearch={handleSearch}
          filters={[
            {
              name: 'invoice_id',
              label: t('Invoice'),
              type: 'select',
              value: selectedInvoice,
              onChange: setSelectedInvoice,
              options: invoiceOptions
            },
            {
              name: 'payment_method',
              label: t('Payment Method'),
              type: 'select',
              value: selectedPaymentMethod,
              onChange: setSelectedPaymentMethod,
              options: paymentMethodOptions
            }
          ]}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          hasActiveFilters={hasActiveFilters}
          activeFilterCount={activeFilterCount}
          onResetFilters={handleResetFilters}
          onApplyFilters={applyFilters}
          currentPerPage={pageFilters.per_page?.toString() || "10"}
          onPerPageChange={(value) => {
            router.get(route('billing.payments.index'), {
              page: 1,
              per_page: parseInt(value),
              search: searchTerm || undefined,
              invoice_id: selectedInvoice !== 'all' ? selectedInvoice : undefined,
              payment_method: selectedPaymentMethod !== 'all' ? selectedPaymentMethod : undefined
            }, { preserveState: true, preserveScroll: true });
          }}
        />
      </div>

      {/* Content section */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        <CrudTable
          columns={columns}
          actions={actions}
          data={payments?.data || []}
          from={payments?.from || 1}
          onAction={handleAction}
          permissions={permissions}
          entityPermissions={{
            view: 'view-payments',
            create: 'create-payments',
            edit: 'edit-payments',
            delete: 'delete-payments'
          }}
        />

        {/* Pagination section */}
        <Pagination
          from={payments?.from || 0}
          to={payments?.to || 0}
          total={payments?.total || 0}
          links={payments?.links}
          entityName={t("payments")}
          onPageChange={(url) => router.get(url)}
        />
      </div>

      {/* Form Modal */}
      <CrudFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        formConfig={{
          fields: [
            {
              name: 'invoice_id',
              label: t('Invoice'),
              type: 'select',
              required: true,
              disabled: isAutoOpen,
              options: (invoices || []).map((invoice: any) => ({
                value: invoice.id.toString(),
                label: `${invoice.invoice_number} - ${invoice.client?.name}`
              }))
            },
            {
              name: 'payment_method',
              label: t('Payment Method'),
              type: 'select',
              required: true,
              options: [
                { value: 'cash', label: t('Cash') },
                { value: 'check', label: t('Check') },
                { value: 'credit_card', label: t('Credit Card') },
                { value: 'bank_transfer', label: t('Bank Transfer') },
                { value: 'online', label: t('Online Payment') }
              ]
            },
            { name: 'amount', label: t('Amount'), type: 'number', step: '0.01', required: true, min: '0', disabled: isAutoOpen },
            { name: 'payment_date', label: t('Payment Date'), type: 'date', required: true, disabled: isAutoOpen },

            { name: 'notes', label: t('Notes'), type: 'textarea' }
          ],
          modalSize: 'lg'
        }}
        initialData={currentItem}
        title={
          formMode === 'create'
            ? t('Record New Payment')
            : formMode === 'edit'
              ? t('Edit Payment')
              : t('View Payment')
        }
        mode={formMode}
      />

      {/* Delete Modal */}
      <CrudDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={`${currentItem?.invoice?.invoice_number} - $${currentItem?.amount ? parseFloat(currentItem.amount).toFixed(2) : '0.00'}`}
        entityName="payment"
      />
    </PageTemplate>
  );
}