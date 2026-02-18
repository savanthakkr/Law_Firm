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

export default function ClientBilling() {
  const { t } = useTranslation();
  const { auth, billingInfo, clients, currencies, filters: pageFilters = {} } = usePage().props as any;
  const permissions = auth?.permissions || [];

  // State
  const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
  const [selectedClient, setSelectedClient] = useState(pageFilters.client_id || 'all');
  const [selectedPaymentTerms, setSelectedPaymentTerms] = useState(pageFilters.payment_terms || 'all');
  const [selectedStatus, setSelectedStatus] = useState(pageFilters.status || 'all');
  const [showFilters, setShowFilters] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');

  // Check if any filters are active
  const hasActiveFilters = () => {
    return searchTerm !== '' || selectedClient !== 'all' || selectedPaymentTerms !== 'all' || selectedStatus !== 'all';
  };

  // Count active filters
  const activeFilterCount = () => {
    return (searchTerm ? 1 : 0) + (selectedClient !== 'all' ? 1 : 0) + (selectedPaymentTerms !== 'all' ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const applyFilters = () => {
    router.get(route('clients.billing.index'), {
      page: 1,
      search: searchTerm || undefined,
      client_id: selectedClient !== 'all' ? selectedClient : undefined,
      payment_terms: selectedPaymentTerms !== 'all' ? selectedPaymentTerms : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const handleSort = (field: string) => {
    const direction = pageFilters.sort_field === field && pageFilters.sort_direction === 'asc' ? 'desc' : 'asc';

    router.get(route('clients.billing.index'), {
      sort_field: field,
      sort_direction: direction,
      page: 1,
      search: searchTerm || undefined,
      client_id: selectedClient !== 'all' ? selectedClient : undefined,
      payment_terms: selectedPaymentTerms !== 'all' ? selectedPaymentTerms : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const handleAction = (action: string, item: any) => {
    setCurrentItem(item);

    switch (action) {
      case 'view':
        setFormMode('view');
        setIsViewModalOpen(true);
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
      toast.loading(t('Creating billing information...'));

      router.post(route('clients.billing.store'), formData, {
        onSuccess: (page) => {
          setIsFormModalOpen(false);
          toast.dismiss();
          if (page.props.flash.success) {
            toast.success(page.props.flash.success);
          } else if (page.props.flash.error) {
            toast.error(page.props.flash.error);
          }
        },
        onError: (errors) => {
          toast.dismiss();
          if (typeof errors === 'string') {
            toast.error(errors);
          } else {
            toast.error(`Failed to create billing information: ${Object.values(errors).join(', ')}`);
          }
        }
      });
    } else if (formMode === 'edit') {
      toast.loading(t('Updating billing information...'));

      router.put(route('clients.billing.update', currentItem.id), formData, {
        onSuccess: (page) => {
          setIsFormModalOpen(false);
          toast.dismiss();
          if (page.props.flash.success) {
            toast.success(page.props.flash.success);
          } else if (page.props.flash.error) {
            toast.error(page.props.flash.error);
          }
        },
        onError: (errors) => {
          toast.dismiss();
          if (typeof errors === 'string') {
            toast.error(errors);
          } else {
            toast.error(`Failed to update billing information: ${Object.values(errors).join(', ')}`);
          }
        }
      });
    }
  };

  const handleDeleteConfirm = () => {
    toast.loading(t('Deleting billing information...'));

    router.delete(route('clients.billing.destroy', currentItem.id), {
      onSuccess: (page) => {
        setIsDeleteModalOpen(false);
        toast.dismiss();
        if (page.props.flash.success) {
          toast.success(page.props.flash.success);
        } else if (page.props.flash.error) {
          toast.error(page.props.flash.error);
        }
      },
      onError: (errors) => {
        toast.dismiss();
        if (typeof errors === 'string') {
          toast.error(errors);
        } else {
          toast.error(`Failed to delete billing information: ${Object.values(errors).join(', ')}`);
        }
      }
    });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedClient('all');
    setSelectedPaymentTerms('all');
    setSelectedStatus('all');
    setShowFilters(false);

    router.get(route('clients.billing.index'), {
      page: 1,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  // Define page actions
  const pageActions = [];

  // Add the "Add Billing Info" button if user has permission
  if (hasPermission(permissions, 'create-client-billing')) {
    pageActions.push({
      label: t('Add Billing Info'),
      icon: <Plus className="h-4 w-4 mr-2" />,
      variant: 'default',
      onClick: () => handleAddNew()
    });
  }

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Client Management'), href: route('clients.index') },
    { title: t('Billing') }
  ];

  // Define table columns
  const columns = [
    {
      key: 'client',
      label: t('Client'),
      render: (value: any, row: any) => {
        return row.client?.name || '-';
      }
    },
    {
      key: 'billing_contact_name',
      label: t('Contact Name'),
      sortable: true,
      render: (value: string) => value || '-'
    },
    {
      key: 'billing_contact_email',
      label: t('Contact Email'),
      render: (value: string) => value || '-'
    },
    {
      key: 'payment_terms',
      label: t('Payment Terms'),
      render: (value: string, row: any) => {
        const terms = {
          net_15: 'Net 15 days',
          net_30: 'Net 30 days',
          net_45: 'Net 45 days',
          net_60: 'Net 60 days',
          due_on_receipt: 'Due on receipt',
          custom: row.custom_payment_terms || 'Custom terms'
        };
        return terms[value as keyof typeof terms] || value;
      }
    },

    {
      key: 'status',
      label: t('Status'),
      render: (value: string) => {
        const statusColors = {
          active: 'bg-green-50 text-green-700 ring-green-600/20',
          suspended: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
          closed: 'bg-red-50 text-red-700 ring-red-600/20'
        };
        return (
          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${statusColors[value as keyof typeof statusColors] || 'bg-gray-50 text-gray-700 ring-gray-600/20'}`}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
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
      requiredPermission: 'view-client-billing'
    },
    {
      label: t('Edit'),
      icon: 'Edit',
      action: 'edit',
      className: 'text-amber-500',
      requiredPermission: 'edit-client-billing'
    },
    {
      label: t('Delete'),
      icon: 'Trash2',
      action: 'delete',
      className: 'text-red-500',
      requiredPermission: 'delete-client-billing'
    }
  ];

  // Prepare options for filters and form
  const clientOptions = [
    { value: 'all', label: t('All Clients') },
    ...(clients || []).map((client: any) => ({
      value: client.id.toString(),
      label: client.name
    }))
  ];

  const paymentTermsOptions = [
    { value: 'all', label: t('All Payment Terms') },
    { value: 'net_15', label: 'Net 15 days' },
    { value: 'net_30', label: 'Net 30 days' },
    { value: 'net_45', label: 'Net 45 days' },
    { value: 'net_60', label: 'Net 60 days' },
    { value: 'due_on_receipt', label: 'Due on receipt' },
    { value: 'custom', label: 'Custom terms' }
  ];

  const statusOptions = [
    { value: 'all', label: t('All Statuses') },
    { value: 'active', label: t('Active') },
    { value: 'suspended', label: t('Suspended') },
    { value: 'closed', label: t('Closed') }
  ];

  return (
    <PageTemplate
      title={t("Client Billing")}
      url="/clients/billing"
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
              name: 'payment_terms',
              label: t('Payment Terms'),
              type: 'select',
              value: selectedPaymentTerms,
              onChange: setSelectedPaymentTerms,
              options: paymentTermsOptions
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
            router.get(route('clients.billing.index'), {
              page: 1,
              per_page: parseInt(value),
              search: searchTerm || undefined,
              client_id: selectedClient !== 'all' ? selectedClient : undefined,
              payment_terms: selectedPaymentTerms !== 'all' ? selectedPaymentTerms : undefined,
              status: selectedStatus !== 'all' ? selectedStatus : undefined
            }, { preserveState: true, preserveScroll: true });
          }}
        />
      </div>

      {/* Content section */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        <CrudTable
          columns={columns}
          actions={actions}
          data={billingInfo?.data || []}
          from={billingInfo?.from || 1}
          onAction={handleAction}
          sortField={pageFilters.sort_field}
          sortDirection={pageFilters.sort_direction}
          onSort={handleSort}
          permissions={permissions}
          entityPermissions={{
            view: 'view-client-billing',
            create: 'create-client-billing',
            edit: 'edit-client-billing',
            delete: 'delete-client-billing'
          }}
        />

        {/* Pagination section */}
        <Pagination
          from={billingInfo?.from || 0}
          to={billingInfo?.to || 0}
          total={billingInfo?.total || 0}
          links={billingInfo?.links}
          entityName={t("billing records")}
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
              options: clients ? clients.map((client: any) => ({
                value: client.id.toString(),
                label: client.name
              })) : []
            },
            { name: 'billing_contact_name', label: t('Billing Contact Name'), type: 'text' },
            { name: 'billing_contact_email', label: t('Billing Contact Email'), type: 'email' },
            { name: 'billing_contact_phone', label: t('Billing Contact Phone'), type: 'text' },
            { name: 'billing_address', label: t('Billing Address'), type: 'textarea' },
            {
              name: 'payment_terms',
              label: t('Payment Terms'),
              type: 'select',
              required: true,
              options: [
                { value: 'net_15', label: 'Net 15 days' },
                { value: 'net_30', label: 'Net 30 days' },
                { value: 'net_45', label: 'Net 45 days' },
                { value: 'net_60', label: 'Net 60 days' },
                { value: 'due_on_receipt', label: 'Due on receipt' },
                { value: 'custom', label: 'Custom terms' }
              ]
            },
            { name: 'custom_payment_terms', label: t('Custom Payment Terms'), type: 'text' },

            { 
              name: 'currency', 
              label: t('Currency'), 
              type: 'select',
              options: currencies ? currencies.map((currency: any) => ({
                value: currency.code,
                label: `${currency.name} (${currency.code}) ${currency.symbol}`
              })) : [],
              defaultValue: currencies?.find((c: any) => c.is_default)?.code || 'USD'
            },
            { name: 'billing_notes', label: t('Billing Notes'), type: 'textarea' },
            {
              name: 'status',
              label: t('Status'),
              type: 'select',
              options: [
                { value: 'active', label: t('Active') },
                { value: 'suspended', label: t('Suspended') },
                { value: 'closed', label: t('Closed') }
              ],
              defaultValue: 'active'
            }
          ],
          modalSize: 'xl'
        }}
        initialData={currentItem}
        title={
          formMode === 'create'
            ? t('Add Billing Information')
            : t('Edit Billing Information')
        }
        mode={formMode}
      />

      {/* View Modal */}
      <CrudFormModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        onSubmit={() => {}}
        formConfig={{
          fields: [
            {
              name: 'client_id',
              label: t('Client'),
              type: 'select',
              options: clients ? clients.map((client: any) => ({
                value: client.id.toString(),
                label: client.name
              })) : []
            },
            { name: 'billing_contact_name', label: t('Billing Contact Name'), type: 'text' },
            { name: 'billing_contact_email', label: t('Billing Contact Email'), type: 'email' },
            { name: 'billing_contact_phone', label: t('Billing Contact Phone'), type: 'text' },
            { name: 'billing_address', label: t('Billing Address'), type: 'textarea' },
            {
              name: 'payment_terms',
              label: t('Payment Terms'),
              type: 'select',
              options: [
                { value: 'net_15', label: 'Net 15 days' },
                { value: 'net_30', label: 'Net 30 days' },
                { value: 'net_45', label: 'Net 45 days' },
                { value: 'net_60', label: 'Net 60 days' },
                { value: 'due_on_receipt', label: 'Due on receipt' },
                { value: 'custom', label: 'Custom terms' }
              ]
            },
            { name: 'custom_payment_terms', label: t('Custom Payment Terms'), type: 'text' },

            { name: 'currency', label: t('Currency'), type: 'text' },
            { name: 'billing_notes', label: t('Billing Notes'), type: 'textarea' },
            {
              name: 'status',
              label: t('Status'),
              type: 'select',
              options: [
                { value: 'active', label: t('Active') },
                { value: 'suspended', label: t('Suspended') },
                { value: 'closed', label: t('Closed') }
              ]
            },
            { name: 'created_at', label: t('Created Date'), type: 'text' }
          ],
          modalSize: 'xl'
        }}
        initialData={{
          ...currentItem,
          client_id: currentItem?.client?.name || '',
          created_at: currentItem?.created_at ? (window.appSettings?.formatDate(currentItem.created_at) || new Date(currentItem.created_at).toLocaleDateString()) : ''
        }}
        title={t('View Billing Information')}
        mode="view"
      />

      {/* Delete Modal */}
      <CrudDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={currentItem?.client?.name || ''}
        entityName="billing information"
      />
    </PageTemplate>
  );
}