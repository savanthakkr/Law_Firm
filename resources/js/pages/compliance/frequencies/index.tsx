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
import { capitalize } from '@/utils/helpers';

export default function ComplianceFrequencies() {
  const { t } = useTranslation();
  const { auth, frequencies, filters: pageFilters = {} } = usePage().props as any;
  const permissions = auth?.permissions || [];

  // State
  const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
  const [selectedStatus, setSelectedStatus] = useState(pageFilters.status || 'all');
  const [showFilters, setShowFilters] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const applyFilters = () => {
    router.get(route('compliance.frequencies.index'), {
      page: 1,
      search: searchTerm || undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const handleSort = (field: string) => {
    const direction = pageFilters.sort_field === field && pageFilters.sort_direction === 'asc' ? 'desc' : 'asc';

    router.get(route('compliance.frequencies.index'), {
      sort_field: field,
      sort_direction: direction,
      page: 1,
      search: searchTerm || undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
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

  const handleToggleStatus = (item: any) => {
    router.put(route('compliance.frequencies.toggle-status', item.id), {}, {
      onSuccess: (page) => {
        if (page.props.flash.success) {
          toast.success(page.props.flash.success);
        }
      },
      onError: (errors) => {
        toast.error('Failed to update status');
      }
    });
  };

  const handleFormSubmit = (formData: any) => {
    if (formMode === 'create') {
      router.post(route('compliance.frequencies.store'), formData, {
        onSuccess: (page) => {
          setIsFormModalOpen(false);
          if (page.props.flash.success) {
            toast.success(page.props.flash.success);
          }
        },
        onError: (errors) => {
          toast.error('Failed to create frequency');
        }
      });
    } else if (formMode === 'edit') {
      router.put(route('compliance.frequencies.update', currentItem.id), formData, {
        onSuccess: (page) => {
          setIsFormModalOpen(false);
          if (page.props.flash.success) {
            toast.success(page.props.flash.success);
          }
        },
        onError: (errors) => {
          toast.error('Failed to update frequency');
        }
      });
    }
  };

  const handleDeleteConfirm = () => {
    router.delete(route('compliance.frequencies.destroy', currentItem.id), {
      onSuccess: (page) => {
        setIsDeleteModalOpen(false);
        if (page.props.flash.success) {
          toast.success(page.props.flash.success);
        }
      },
      onError: (errors) => {
        if (typeof errors === 'string') {
          toast.error(errors);
        } else {
          toast.error('Failed to delete frequency');
        }
      }
    });
  };

  const pageActions = [];
  if (hasPermission(permissions, 'create-compliance-frequencies')) {
    pageActions.push({
      label: t('Add Frequency'),
      icon: <Plus className="h-4 w-4 mr-2" />,
      variant: 'default',
      onClick: () => handleAddNew()
    });
  }

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Compliance & Regulatory'), href: route('compliance.requirements.index') },
    { title: t('Frequencies') }
  ];

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
      key: 'days',
      label: t('Days'),
      sortable: true,
      render: (value: number) => {
        if (!value) return t('One Time');
        if (value === 1) return t('Daily');
        if (value === 7) return t('Weekly');
        if (value === 30) return t('Monthly');
        if (value === 90) return t('Quarterly');
        if (value === 180) return t('Semi-Annually');
        if (value === 365) return t('Annually');
        return `${value} ${t('days')}`;
      }
    },
    {
      key: 'status',
      label: t('Status'),
      render: (value: string) => {
        const statusColors = {
          active: 'bg-green-50 text-green-700 ring-green-600/20',
          inactive: 'bg-gray-50 text-gray-700 ring-gray-600/20'
        };
        return (
          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${statusColors[value as keyof typeof statusColors] || 'bg-gray-50 text-gray-700 ring-gray-600/20'}`}>
            {t(capitalize(value))}
          </span>
        );
      }
    },
    {
      key: 'created_at',
      label: t('Created'),
      sortable: true,
        type: 'date',
    }
  ];

  const actions = [
    {
      label: t('View'),
      icon: 'Eye',
      action: 'view',
      className: 'text-blue-500',
      requiredPermission: 'view-compliance-frequencies'
    },
    {
      label: t('Edit'),
      icon: 'Edit',
      action: 'edit',
      className: 'text-amber-500',
      requiredPermission: 'edit-compliance-frequencies'
    },
    {
      label: t('Toggle Status'),
      icon: 'ToggleLeft',
      action: 'toggle-status',
      className: 'text-green-500',
      requiredPermission: 'toggle-status-compliance-frequencies'
    },
    {
      label: t('Delete'),
      icon: 'Trash2',
      action: 'delete',
      className: 'text-red-500',
      requiredPermission: 'delete-compliance-frequencies'
    }
  ];

  const statusOptions = [
    { value: 'all', label: t('All Statuses') },
    { value: 'active', label: t('Active') },
    { value: 'inactive', label: t('Inactive') }
  ];

  return (
    <PageTemplate
      title={t("Compliance Frequencies")}
      url="/compliance/frequencies"
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
          hasActiveFilters={() => searchTerm !== '' || selectedStatus !== 'all'}
          activeFilterCount={() => (searchTerm ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0)}
          onResetFilters={() => {
            setSearchTerm('');
            setSelectedStatus('all');
            setShowFilters(false);
            router.get(route('compliance.frequencies.index'), { page: 1, per_page: pageFilters.per_page });
          }}
          onApplyFilters={applyFilters}
          currentPerPage={pageFilters.per_page?.toString() || "10"}
          onPerPageChange={(value) => {
            router.get(route('compliance.frequencies.index'), {
              page: 1,
              per_page: parseInt(value),
              search: searchTerm || undefined,
              status: selectedStatus !== 'all' ? selectedStatus : undefined
            });
          }}
        />
      </div>

      {/* Content section */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        <CrudTable
          columns={columns}
          actions={actions}
          data={frequencies?.data || []}
          from={frequencies?.from || 1}
          onAction={handleAction}
          sortField={pageFilters.sort_field}
          sortDirection={pageFilters.sort_direction}
          onSort={handleSort}
          permissions={permissions}
          entityPermissions={{
            view: 'view-compliance-frequencies',
            create: 'create-compliance-frequencies',
            edit: 'edit-compliance-frequencies',
            delete: 'delete-compliance-frequencies'
          }}
        />

        <Pagination
          from={frequencies?.from || 0}
          to={frequencies?.to || 0}
          total={frequencies?.total || 0}
          links={frequencies?.links}
          entityName={t("frequencies")}
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
              name: 'days', 
              label: t('Days'), 
              type: 'number', 
              placeholder: t('Leave empty for one-time frequency'),
              min: 1
            },
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
          modalSize: 'md'
        }}
        initialData={currentItem}
        title={
          formMode === 'create'
            ? t('Add Compliance Frequency')
            : formMode === 'edit'
              ? t('Edit Compliance Frequency')
              : t('View Compliance Frequency')
        }
        mode={formMode}
      />

      {/* Delete Modal */}
      <CrudDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={currentItem?.name || ''}
        entityName="compliance frequency"
      />
    </PageTemplate>
  );
}