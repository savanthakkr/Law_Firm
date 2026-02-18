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

export default function FeeStructures() {
  const { t } = useTranslation();
  const { auth, feeStructures, clients, feeTypes, filters: pageFilters = {} } = usePage().props as any;
  const permissions = auth?.permissions || [];

  // State
  const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
  const [selectedClient, setSelectedClient] = useState(pageFilters.client_id || 'all');
  const [selectedFeeType, setSelectedFeeType] = useState(pageFilters.fee_type_id || 'all');
  const [selectedStatus, setSelectedStatus] = useState(pageFilters.is_active || 'all');
  const [showFilters, setShowFilters] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [sortField, setSortField] = useState(pageFilters.sort_field || '');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(pageFilters.sort_direction || 'asc');

  // Check if any filters are active
  const hasActiveFilters = () => {
    return searchTerm !== '' || selectedClient !== 'all' || selectedFeeType !== 'all' || selectedStatus !== 'all';
  };

  // Count active filters
  const activeFilterCount = () => {
    return (searchTerm ? 1 : 0) + (selectedClient !== 'all' ? 1 : 0) + (selectedFeeType !== 'all' ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const applyFilters = () => {
    router.get(route('billing.fee-structures.index'), {
      page: 1,
      search: searchTerm || undefined,
      client_id: selectedClient !== 'all' ? selectedClient : undefined,
      fee_type_id: selectedFeeType !== 'all' ? selectedFeeType : undefined,
      is_active: selectedStatus !== 'all' ? selectedStatus : undefined,
      sort_field: sortField || undefined,
      sort_direction: sortDirection || undefined,
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
      case 'toggle-status':
        handleToggleStatus(item);
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
      toast.loading(t('Creating fee structure...'));

      router.post(route('billing.fee-structures.store'), formData, {
        onSuccess: (page) => {
          setIsFormModalOpen(false);
          toast.dismiss();
          if (page.props.flash.success) {
            toast.success(page.props.flash.success);
          }
        },
        onError: (errors) => {
          toast.dismiss();
          toast.error(`Failed to create fee structure: ${Object.values(errors).join(', ')}`);
        }
      });
    } else if (formMode === 'edit') {
      toast.loading(t('Updating fee structure...'));

      router.put(route('billing.fee-structures.update', currentItem.id), formData, {
        onSuccess: (page) => {
          setIsFormModalOpen(false);
          toast.dismiss();
          if (page.props.flash.success) {
            toast.success(page.props.flash.success);
          }
        },
        onError: (errors) => {
          toast.dismiss();
          toast.error(`Failed to update fee structure: ${Object.values(errors).join(', ')}`);
        }
      });
    }
  };

  const handleDeleteConfirm = () => {
    toast.loading(t('Deleting fee structure...'));

    router.delete(route('billing.fee-structures.destroy', currentItem.id), {
      onSuccess: (page) => {
        setIsDeleteModalOpen(false);
        toast.dismiss();
        if (page.props.flash.success) {
          toast.success(page.props.flash.success);
        }
      },
      onError: (errors) => {
        toast.dismiss();
        toast.error(`Failed to delete fee structure: ${Object.values(errors).join(', ')}`);
      }
    });
  };

  const handleToggleStatus = (feeStructure: any) => {
    const newStatus = feeStructure.is_active ? 'inactive' : 'active';
    toast.loading(`${newStatus === 'active' ? t('Activating') : t('Deactivating')} fee structure...`);

    router.put(route('billing.fee-structures.toggle-status', feeStructure.id), {}, {
      onSuccess: (page) => {
        toast.dismiss();
        if (page.props.flash.success) {
          toast.success(page.props.flash.success);
        }
      },
      onError: (errors) => {
        toast.dismiss();
        toast.error(`Failed to update fee structure status: ${Object.values(errors).join(', ')}`);
      }
    });
  };

  const handleSort = (field: string) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    
    router.get(route('billing.fee-structures.index'), {
      page: 1,
      search: searchTerm || undefined,
      client_id: selectedClient !== 'all' ? selectedClient : undefined,
      fee_type_id: selectedFeeType !== 'all' ? selectedFeeType : undefined,
      is_active: selectedStatus !== 'all' ? selectedStatus : undefined,
      sort_field: field,
      sort_direction: newDirection,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedClient('all');
    setSelectedFeeType('all');
    setSelectedStatus('all');
    setSortField('');
    setSortDirection('asc');
    setShowFilters(false);

    router.get(route('billing.fee-structures.index'), {
      page: 1,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  // Define page actions
  const pageActions = [];

  if (hasPermission(permissions, 'create-fee-structures')) {
    pageActions.push({
      label: t('Add Fee Structure'),
      icon: <Plus className="h-4 w-4 mr-2" />,
      variant: 'default',
      onClick: () => handleAddNew()
    });
  }

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Billing & Invoicing'), href: route('billing.time-entries.index') },
    { title: t('Setup'), href: route('billing.fee-structures.index') },
    { title: t('Fee Structures') }
  ];

  // Define table columns
  const columns = [
    {
      key: 'client',
      label: t('Client'),
      render: (value: any) => value?.name || t('All Clients')
    },
    {
      key: 'feeType',
      label: t('Fee Type'),
      render: (value: any, row: any) => {
        const feeType = (feeTypes || []).find((ft: any) => ft.id === row.fee_type_id);
        return feeType?.name || '-';
      }
    },
    {
      key: 'display_amount',
      label: t('Amount/Rate'),
      render: (value: any, row: any) => {
        if (row.amount) return `$${row.amount}`;
        if (row.percentage) return `${row.percentage}%`;
        if (row.hourly_rate) return `$${row.hourly_rate}/hr`;
        return '-';
      }
    },
    {
      key: 'effective_date',
      label: t('Effective Date'),
      render: (value: string) => window.appSettings?.formatDate(value) || new Date(value).toLocaleDateString()
    },
    {
      key: 'end_date',
      label: t('End Date'),
      render: (value: string) => value ? (window.appSettings?.formatDate(value) || new Date(value).toLocaleDateString()) : '-'
    },
    {
      key: 'is_active',
      label: t('Status'),
      render: (value: boolean) => (
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
          value 
            ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
            : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
        }`}>
          {value ? t('Active') : t('Inactive')}
        </span>
      )
    }
  ];

  // Define table actions
  const actions = [
    {
      label: t('View'),
      icon: 'Eye',
      action: 'view',
      className: 'text-blue-500',
      requiredPermission: 'view-fee-structures'
    },
    {
      label: t('Edit'),
      icon: 'Edit',
      action: 'edit',
      className: 'text-amber-500',
      requiredPermission: 'edit-fee-structures'
    },
    {
      label: t('Toggle Status'),
      icon: 'Lock',
      action: 'toggle-status',
      className: 'text-amber-500',
      requiredPermission: 'toggle-status-fee-structures'
    },
    {
      label: t('Delete'),
      icon: 'Trash2',
      action: 'delete',
      className: 'text-red-500',
      requiredPermission: 'delete-fee-structures'
    }
  ];

  // Prepare filter options
  const clientOptions = [
    { value: 'all', label: t('All Clients') },
    { value: 'null', label: t('All Clients (Default)') },
    ...(clients || []).map((client: any) => ({
      value: client.id.toString(),
      label: client.name
    }))
  ];

  const feeTypeOptions = [
    { value: 'all', label: t('All Fee Types') },
    ...(feeTypes || []).map((feeType: any) => ({
      value: feeType.id.toString(),
      label: feeType.name
    }))
  ];

  const statusOptions = [
    { value: 'all', label: t('All Statuses') },
    { value: '1', label: t('Active') },
    { value: '0', label: t('Inactive') }
  ];

  return (
    <PageTemplate
      title={t("Fee Structures")}
      url="/billing/fee-structures"
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
              name: 'fee_type_id',
              label: t('Fee Type'),
              type: 'select',
              value: selectedFeeType,
              onChange: setSelectedFeeType,
              options: feeTypeOptions
            },
            {
              name: 'is_active',
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
            router.get(route('billing.fee-structures.index'), {
              page: 1,
              per_page: parseInt(value),
              search: searchTerm || undefined,
              client_id: selectedClient !== 'all' ? selectedClient : undefined,
              fee_type_id: selectedFeeType !== 'all' ? selectedFeeType : undefined,
              is_active: selectedStatus !== 'all' ? selectedStatus : undefined,
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
          data={feeStructures?.data || []}
          from={feeStructures?.from || 1}
          onAction={handleAction}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          permissions={permissions}
          entityPermissions={{
            view: 'view-fee-structures',
            create: 'create-fee-structures',
            edit: 'edit-fee-structures',
            delete: 'delete-fee-structures'
          }}
        />

        {/* Pagination section */}
        <Pagination
          from={feeStructures?.from || 0}
          to={feeStructures?.to || 0}
          total={feeStructures?.total || 0}
          links={feeStructures?.links}
          entityName={t("fee structures")}
          onPageChange={(url) => router.get(url)}
        />
      </div>

      {/* Form Modal */}
      <CrudFormModal
        isOpen={isFormModalOpen && formMode !== 'view'}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        formConfig={{
          fields: [
            {
              name: 'client_id',
              label: t('Client'),
              type: 'select',
              options: [
                { value: null, label: t('All Clients') },
                ...(clients || []).map((client: any) => ({
                  value: client.id.toString(),
                  label: client.name
                }))
              ]
            },
            {
              name: 'fee_type_id',
              label: t('Fee Type'),
              type: 'select',
              required: true,
              options: (feeTypes || []).filter(feeType => feeType.id && feeType.name).map((feeType: any) => ({
                value: feeType.id.toString(),
                label: feeType.name
              }))
            },
            { name: 'amount', label: t('Amount'), type: 'number', step: '0.01', min: '0' },
            { name: 'percentage', label: t('Percentage'), type: 'number', step: '0.01', min: '0', max: '100' },
            { name: 'hourly_rate', label: t('Hourly Rate'), type: 'number', step: '0.01', min: '0' },
            { name: 'description', label: t('Description'), type: 'textarea' },
            { name: 'effective_date', label: t('Effective Date'), type: 'date', required: true },
            { name: 'end_date', label: t('End Date'), type: 'date' },
            {
              name: 'is_active',
              label: t('Status'),
              type: 'select',
              options: [
                { value: true, label: t('Active') },
                { value: false, label: t('Inactive') }
              ],
              defaultValue: true
            }
          ],
          modalSize: 'xl'
        }}
        initialData={currentItem}
        title={
          formMode === 'create'
            ? t('Add New Fee Structure')
            : t('Edit Fee Structure')
        }
        mode={formMode !== 'view' ? formMode : 'create'}
      />

      {/* View Modal */}
      <CrudFormModal
        isOpen={isFormModalOpen && formMode === 'view'}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={() => {}}
        formConfig={{
          fields: [
            {
              name: 'client',
              label: t('Client'),
              type: 'text',
              render: () => {
                return <div className="rounded-md border bg-gray-50 p-2">
                  {currentItem?.client?.name || t('All Clients')}
                </div>;
              }
            },
            {
              name: 'fee_type',
              label: t('Fee Type'),
              type: 'text',
              render: () => {
                const feeType = (feeTypes || []).find((ft: any) => ft.id === currentItem?.fee_type_id);
                return <div className="rounded-md border bg-gray-50 p-2">
                  {feeType?.name || '-'}
                </div>;
              }
            },
            {
              name: 'amount_display',
              label: t('Amount/Rate'),
              type: 'text',
              render: () => {
                const item = currentItem;
                let displayAmount = '-';
                if (item) {
                  if (item.amount) displayAmount = `$${item.amount}`;
                  else if (item.percentage) displayAmount = `${item.percentage}%`;
                  else if (item.hourly_rate) displayAmount = `$${item.hourly_rate}/hr`;
                }
                return <div className="rounded-md border bg-gray-50 p-2">{displayAmount}</div>;
              }
            },
            { name: 'description', label: t('Description'), type: 'textarea' },
            { name: 'effective_date', label: t('Effective Date'), type: 'text' },
            { name: 'end_date', label: t('End Date'), type: 'text' },
            {
              name: 'is_active',
              label: t('Status'),
              type: 'text',
              render: () => {
                const isActive = currentItem?.is_active;
                return <div className="rounded-md border bg-gray-50 p-2">
                  {isActive ? t('Active') : t('Inactive')}
                </div>;
              }
            }
          ],
          modalSize: 'xl'
        }}
        initialData={currentItem}
        title={t('View Fee Structure')}
        mode="view"
      />

      {/* Delete Modal */}
      <CrudDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={`${currentItem?.client?.name || 'All Clients'} - ${currentItem?.feeType?.name}`}
        entityName="fee structure"
      />
    </PageTemplate>
  );
}