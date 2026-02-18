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

export default function FeeTypes() {
  const { t } = useTranslation();
  const { auth, feeTypes, filters: pageFilters = {} } = usePage().props as any;
  const permissions = auth?.permissions || [];

  // State
  const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
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
    return searchTerm !== '' || selectedStatus !== 'all';
  };

  // Count active filters
  const activeFilterCount = () => {
    return (searchTerm ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const applyFilters = () => {
    router.get(route('billing.fee-types.index'), {
      page: 1,
      search: searchTerm || undefined,
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
      toast.loading(t('Creating fee type...'));

      router.post(route('billing.fee-types.store'), formData, {
        onSuccess: (page) => {
          setIsFormModalOpen(false);
          toast.dismiss();
          if (page.props.flash.success) {
            toast.success(page.props.flash.success);
          }
        },
        onError: (errors) => {
          toast.dismiss();
          toast.error(`Failed to create fee type: ${Object.values(errors).join(', ')}`);
        }
      });
    } else if (formMode === 'edit') {
      toast.loading(t('Updating fee type...'));

      router.put(route('billing.fee-types.update', currentItem.id), formData, {
        onSuccess: (page) => {
          setIsFormModalOpen(false);
          toast.dismiss();
          if (page.props.flash.success) {
            toast.success(page.props.flash.success);
          }
        },
        onError: (errors) => {
          toast.dismiss();
          toast.error(`Failed to update fee type: ${Object.values(errors).join(', ')}`);
        }
      });
    }
  };

  const handleDeleteConfirm = () => {
    toast.loading(t('Deleting fee type...'));

    router.delete(route('billing.fee-types.destroy', currentItem.id), {
      onSuccess: (page) => {
        setIsDeleteModalOpen(false);
        toast.dismiss();
        if (page.props.flash.success) {
          toast.success(page.props.flash.success);
        }
      },
      onError: (errors) => {
        toast.dismiss();
        toast.error(`Failed to delete fee type: ${Object.values(errors).join(', ')}`);
      }
    });
  };

  const handleToggleStatus = (feeType: any) => {
    const newStatus = feeType.status === 'active' ? 'inactive' : 'active';
    toast.loading(`${newStatus === 'active' ? t('Activating') : t('Deactivating')} fee type...`);

    router.put(route('billing.fee-types.toggle-status', feeType.id), {}, {
      onSuccess: (page) => {
        toast.dismiss();
        if (page.props.flash.success) {
          toast.success(page.props.flash.success);
        }
      },
      onError: (errors) => {
        toast.dismiss();
        toast.error(`Failed to update fee type status: ${Object.values(errors).join(', ')}`);
      }
    });
  };

  const handleSort = (field: string) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    
    router.get(route('billing.fee-types.index'), {
      page: 1,
      search: searchTerm || undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      sort_field: field,
      sort_direction: newDirection,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setSortField('');
    setSortDirection('asc');
    setShowFilters(false);

    router.get(route('billing.fee-types.index'), {
      page: 1,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  // Define page actions
  const pageActions = [];

  if (hasPermission(permissions, 'create-fee-types')) {
    pageActions.push({
      label: t('Add Fee Type'),
      icon: <Plus className="h-4 w-4 mr-2" />,
      variant: 'default',
      onClick: () => handleAddNew()
    });
  }

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Billing & Invoicing'), href: route('billing.time-entries.index') },
    { title: t('Setup'), href: route('billing.fee-types.index') },
    { title: t('Fee Types') }
  ];

  // Define table columns
  const columns = [
    {
      key: 'name',
      label: t('Name'),
      sortable: true
    },
    {
      key: 'description',
      label: t('Description'),
      render: (value: string) => value || '-'
    },
    {
      key: 'status',
      label: t('Status'),
      render: (value: string) => (
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
          value === 'active'
            ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
            : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
        }`}>
          {value === 'active' ? t('Active') : t('Inactive')}
        </span>
      )
    },
    {
      key: 'created_at',
      label: t('Created'),
      sortable: true,
        type: 'date',
    }
  ];

  // Define table actions
  const actions = [
    {
      label: t('View'),
      icon: 'Eye',
      action: 'view',
      className: 'text-blue-500',
      requiredPermission: 'view-fee-types'
    },
    {
      label: t('Edit'),
      icon: 'Edit',
      action: 'edit',
      className: 'text-amber-500',
      requiredPermission: 'edit-fee-types'
    },
    {
      label: t('Toggle Status'),
      icon: 'Lock',
      action: 'toggle-status',
      className: 'text-amber-500',
      requiredPermission: 'edit-fee-types'
    },
    {
      label: t('Delete'),
      icon: 'Trash2',
      action: 'delete',
      className: 'text-red-500',
      requiredPermission: 'delete-fee-types'
    }
  ];

  // Prepare filter options
  const statusOptions = [
    { value: 'all', label: t('All Statuses') },
    { value: 'active', label: t('Active') },
    { value: 'inactive', label: t('Inactive') }
  ];

  return (
    <PageTemplate
      title={t("Fee Types")}
      url="/billing/fee-types"
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
            router.get(route('billing.fee-types.index'), {
              page: 1,
              per_page: parseInt(value),
              search: searchTerm || undefined,
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
          data={feeTypes?.data || []}
          from={feeTypes?.from || 1}
          onAction={handleAction}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          permissions={permissions}
          entityPermissions={{
            view: 'view-fee-types',
            create: 'create-fee-types',
            edit: 'edit-fee-types',
            delete: 'delete-fee-types'
          }}
        />

        {/* Pagination section */}
        <Pagination
          from={feeTypes?.from || 0}
          to={feeTypes?.to || 0}
          total={feeTypes?.total || 0}
          links={feeTypes?.links}
          entityName={t("fee types")}
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
            { name: 'name', label: t('Name'), type: 'text', required: true },
            { name: 'description', label: t('Description'), type: 'textarea' },
            {
              name: 'status',
              label: t('Status'),
              type: 'select',
              options: [
                { value: 'active', label: t('Active') },
                { value: 'inactive', label: t('Inactive') }
              ],
              defaultValue: 'active'
            }
          ],
          modalSize: 'lg'
        }}
        initialData={currentItem}
        title={
          formMode === 'create'
            ? t('Add New Fee Type')
            : formMode === 'edit'
              ? t('Edit Fee Type')
              : t('View Fee Type')
        }
        mode={formMode}
      />

      {/* Delete Modal */}
      <CrudDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={currentItem?.name || ''}
        entityName="fee type"
      />
    </PageTemplate>
  );
}