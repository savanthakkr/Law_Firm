import { useState } from 'react';
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
import LineItemsBuilder from '@/components/LineItemsBuilder';
import { formatCurrency } from '@/utils/helpers';

export default function Invoices() {
  const { t } = useTranslation();
  const { auth, invoices, clients, filters: pageFilters = {} } = usePage().props as any;
  const permissions = auth?.permissions || [];

  // State
  const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
  const [selectedClient, setSelectedClient] = useState(pageFilters.client_id || 'all');
  const [selectedStatus, setSelectedStatus] = useState(pageFilters.status || 'all');
  const [showFilters, setShowFilters] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [sortField, setSortField] = useState(pageFilters.sort_field || '');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(pageFilters.sort_direction || 'asc');

  // Check if any filters are active
  const hasActiveFilters = () => {
    return searchTerm !== '' || selectedClient !== 'all' || selectedStatus !== 'all';
  };

  // Count active filters
  const activeFilterCount = () => {
    return (searchTerm ? 1 : 0) + (selectedClient !== 'all' ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const applyFilters = () => {
    router.get(route('billing.invoices.index'), {
      page: 1,
      search: searchTerm || undefined,
      client_id: selectedClient !== 'all' ? selectedClient : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      sort_field: sortField || undefined,
      sort_direction: sortDirection || undefined,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const handleAction = (action: string, item: any) => {
    setCurrentItem(item);

    switch (action) {
      case 'view':
        router.get(route('billing.invoices.show', item.id));
        break;
      case 'generate':
        window.open(route('billing.invoices.generate', item.id), '_blank');
        break;
      case 'edit':
        router.get(route('billing.invoices.edit', item.id));
        break;
      case 'delete':
        setIsDeleteModalOpen(true);
        break;
      case 'send':
        handleSend(item);
        break;
      case 'payment_link':
        handleCopyPaymentLink(item);
        break;
    }
  };

  const handleAddNew = () => {
    router.get(route('billing.invoices.create'));
  };

  const handleFormSubmit = (formData: any) => {
    if (formMode === 'create') {
      toast.loading(t('Creating invoice...'));

      router.post(route('billing.invoices.store'), formData, {
        onSuccess: (page) => {
          setIsFormModalOpen(false);
          toast.dismiss();
          if (page.props.flash.success) {
            toast.success(page.props.flash.success);
          }
        },
        onError: (errors) => {
          toast.dismiss();
          toast.error(`Failed to create invoice: ${Object.values(errors).join(', ')}`);
        }
      });
    } else if (formMode === 'edit') {
      toast.loading(t('Updating invoice...'));

      router.put(route('billing.invoices.update', currentItem.id), formData, {
        onSuccess: (page) => {
          setIsFormModalOpen(false);
          toast.dismiss();
          if (page.props.flash.success) {
            toast.success(page.props.flash.success);
          }
        },
        onError: (errors) => {
          toast.dismiss();
          toast.error(`Failed to update invoice: ${Object.values(errors).join(', ')}`);
        }
      });
    }
  };

  const handleDeleteConfirm = () => {
    toast.loading(t('Deleting invoice...'));

    router.delete(route('billing.invoices.destroy', currentItem.id), {
      onSuccess: (page) => {
        setIsDeleteModalOpen(false);
        toast.dismiss();
        if (page.props.flash.success) {
          toast.success(page.props.flash.success);
        }
      },
      onError: (errors) => {
        toast.dismiss();
        toast.error(`Failed to delete invoice: ${Object.values(errors).join(', ')}`);
      }
    });
  };

  const handleSend = (invoice: any) => {
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

  const handleCopyPaymentLink = (invoice: any) => {
    const paymentUrl = route('invoice.payment', invoice.payment_token);
    navigator.clipboard.writeText(paymentUrl).then(() => {
      toast.success(t('Payment link copied to clipboard'));
    }).catch(() => {
      toast.error(t('Failed to copy payment link'));
    });
  };

  const handleSort = (field: string) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    
    router.get(route('billing.invoices.index'), {
      page: 1,
      search: searchTerm || undefined,
      client_id: selectedClient !== 'all' ? selectedClient : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      sort_field: field,
      sort_direction: newDirection,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedClient('all');
    setSelectedStatus('all');
    setSortField('');
    setSortDirection('asc');
    setShowFilters(false);

    router.get(route('billing.invoices.index'), {
      page: 1,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  // Define page actions
  const pageActions = [];

  if (hasPermission(permissions, 'create-invoices')) {
    pageActions.push({
      label: t('Create Invoice'),
      icon: <Plus className="h-4 w-4 mr-2" />,
      variant: 'default',
      onClick: () => router.get(route('billing.invoices.create'))
    });
  }

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Billing & Invoicing'), href: route('billing.time-entries.index') },
    { title: t('Invoices') }
  ];

  // Define table columns
  const columns = [
    {
      key: 'invoice_number',
      label: t('Invoice #'),
      sortable: true
    },
    {
      key: 'client',
      label: t('Client'),
      render: (value: any) => value?.name || '-'
    },
    {
      key: 'total_amount',
      label: t('Total'),
      render: (value: any) => {
        const amount = parseFloat(value);
        return isNaN(amount) ? `${formatCurrency(0.00)}` : `${formatCurrency(amount)}`;
      }
    },
    {
      key: 'invoice_date',
      label: t('Invoice Date'),
      render: (value: string) => window.appSettings?.formatDate(value) || new Date(value).toLocaleDateString()
    },
    {
      key: 'due_date',
      label: t('Due Date'),
      render: (value: string) => window.appSettings?.formatDate(value) || new Date(value).toLocaleDateString()
    },
    {
      key: 'status',
      label: t('Status'),
      render: (value: string) => {
        const statusColors = {
          draft: 'bg-gray-50 text-gray-700 ring-gray-600/20',
          sent: 'bg-blue-50 text-blue-700 ring-blue-600/20',
          paid: 'bg-green-50 text-green-700 ring-green-600/20',
          overdue: 'bg-red-50 text-red-700 ring-red-600/20',
          cancelled: 'bg-gray-50 text-gray-700 ring-gray-600/20'
        };
        
        return (
          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${statusColors[value as keyof typeof statusColors] || statusColors.draft}`}>
            {t(value?.charAt(0).toUpperCase() + value?.slice(1))}
          </span>
        );
      }
    }
  ];

  // Define table actions
  const actions = [
    {
      label: t('View'),
      icon: 'Eye',
      action: 'view',
      className: 'text-blue-500',
      requiredPermission: 'view-invoices'
    },
    {
      label: t('Generate Invoice'),
      icon: 'FileText',
      action: 'generate',
      className: 'text-purple-500',
      requiredPermission: 'view-invoices'
    },
    {
      label: t('Edit'),
      icon: 'Edit',
      action: 'edit',
      className: 'text-amber-500',
      requiredPermission: 'edit-invoices',
      condition: (row: any) => row.status === 'draft'
    },
    {
      label: t('Send'),
      icon: 'Send',
      action: 'send',
      className: 'text-green-500',
      requiredPermission: 'send-invoices',
      condition: (row: any) => row.status === 'draft'
    },
    {
      label: t('Copy Payment Link'),
      icon: 'Link',
      action: 'payment_link',
      className: 'text-blue-500',
      requiredPermission: 'view-invoices',
      condition: (row: any) => row.status !== 'paid'
    },
    {
      label: t('Delete'),
      icon: 'Trash2',
      action: 'delete',
      className: 'text-red-500',
      requiredPermission: 'delete-invoices'
    }
  ];

  // Prepare filter options
  const clientOptions = [
    { value: 'all', label: t('All Clients') },
    ...(clients || []).map((client: any) => ({
      value: client.id.toString(),
      label: client.name
    }))
  ];

  const statusOptions = [
    { value: 'all', label: t('All Status') },
    { value: 'draft', label: t('Draft') },
    { value: 'sent', label: t('Sent') },
    { value: 'paid', label: t('Paid') },
    { value: 'overdue', label: t('Overdue') },
    { value: 'cancelled', label: t('Cancelled') }
  ];

  return (
    <PageTemplate
      title={t("Invoices")}
      url="/billing/invoices"
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
              name: 'client_id',
              label: t('Client'),
              type: 'select',
              value: selectedClient,
              onChange: setSelectedClient,
              options: clientOptions
            },
            {
              name: 'status',
              label: t('Status'),
              type: 'select',
              value: selectedStatus,
              onChange: setSelectedStatus,
              options: statusOptions
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
            router.get(route('billing.invoices.index'), {
              page: 1,
              per_page: parseInt(value),
              search: searchTerm || undefined,
              client_id: selectedClient !== 'all' ? selectedClient : undefined,
              status: selectedStatus !== 'all' ? selectedStatus : undefined,
              sort_field: sortField || undefined,
              sort_direction: sortDirection || undefined
            }, { preserveState: true, preserveScroll: true });
          }}
        />
      </div>

      {/* Content section */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        <CrudTable
          columns={columns}
          actions={actions}
          data={invoices?.data || []}
          from={invoices?.from || 1}
          onAction={handleAction}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          permissions={permissions}
          entityPermissions={{
            view: 'view-invoices',
            create: 'create-invoices',
            edit: 'edit-invoices',
            delete: 'delete-invoices'
          }}
        />

        {/* Pagination section */}
        <Pagination
          from={invoices?.from || 0}
          to={invoices?.to || 0}
          total={invoices?.total || 0}
          links={invoices?.links}
          entityName={t("invoices")}
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
              name: 'client_id',
              label: t('Client'),
              type: 'select',
              required: true,
              options: (clients || []).map((client: any) => ({
                value: client.id.toString(),
                label: client.name
              }))
            },
            {
              name: 'line_items',
              label: t('Invoice Items'),
              type: 'custom',
              render: (field, formData, handleChange) => (
                <LineItemsBuilder
                  items={formData.line_items || []}
                  onChange={(items) => {
                    handleChange('line_items', items);
                    const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
                    handleChange('subtotal', subtotal);
                    handleChange('total_amount', subtotal + (formData.tax_amount || 0));
                  }}
                />
              )
            },
            { name: 'tax_amount', label: t('Tax Amount'), type: 'number', step: '0.01', min: '0' },
            { name: 'invoice_date', label: t('Invoice Date'), type: 'date', required: true },
            { name: 'due_date', label: t('Due Date'), type: 'date', required: true },
            { name: 'notes', label: t('Notes'), type: 'textarea' }
          ],
          modalSize: 'lg'
        }}
        initialData={currentItem}
        title={
          formMode === 'create'
            ? t('Create New Invoice')
            : formMode === 'edit'
              ? t('Edit Invoice')
              : t('View Invoice')
        }
        mode={formMode}
      />

      {/* Delete Modal */}
      <CrudDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={currentItem?.invoice_number || ''}
        entityName="invoice"
      />
    </PageTemplate>
  );
}