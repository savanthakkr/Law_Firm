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

export default function RegulatoryBodies() {
  const { t } = useTranslation();
  const { auth, bodies, filters: pageFilters = {} } = usePage().props as any;
  const permissions = auth?.permissions || [];

  // State
  const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
  const [selectedStatus, setSelectedStatus] = useState(pageFilters.status || 'all');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState(pageFilters.jurisdiction || 'all');
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
    router.get(route('compliance.regulatory-bodies.index'), {
      page: 1,
      search: searchTerm || undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      jurisdiction: selectedJurisdiction !== 'all' ? selectedJurisdiction : undefined,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const handleSort = (field: string) => {
    const direction = pageFilters.sort_field === field && pageFilters.sort_direction === 'asc' ? 'desc' : 'asc';

    router.get(route('compliance.regulatory-bodies.index'), {
      sort_field: field,
      sort_direction: direction,
      page: 1,
      search: searchTerm || undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      jurisdiction: selectedJurisdiction !== 'all' ? selectedJurisdiction : undefined,
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
    router.put(route('compliance.regulatory-bodies.toggle-status', item.id), {}, {
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
      router.post(route('compliance.regulatory-bodies.store'), formData, {
        onSuccess: (page) => {
          setIsFormModalOpen(false);
          if (page.props.flash.success) {
            toast.success(page.props.flash.success);
          }
        },
        onError: (errors) => {
          toast.error('Failed to create regulatory body');
        }
      });
    } else if (formMode === 'edit') {
      router.put(route('compliance.regulatory-bodies.update', currentItem.id), formData, {
        onSuccess: (page) => {
          setIsFormModalOpen(false);
          if (page.props.flash.success) {
            toast.success(page.props.flash.success);
          }
        },
        onError: (errors) => {
          toast.error('Failed to update regulatory body');
        }
      });
    }
  };

  const handleDeleteConfirm = () => {
    router.delete(route('compliance.regulatory-bodies.destroy', currentItem.id), {
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
          toast.error('Failed to delete regulatory body');
        }
      }
    });
  };

  const pageActions = [];
  if (hasPermission(permissions, 'create-regulatory-bodies')) {
    pageActions.push({
      label: t('Add Regulatory Body'),
      icon: <Plus className="h-4 w-4 mr-2" />,
      variant: 'default',
      onClick: () => handleAddNew()
    });
  }

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Compliance & Regulatory'), href: route('compliance.requirements.index') },
    { title: t('Regulatory Bodies') }
  ];

  const columns = [
    {
      key: 'name',
      label: t('Name'),
      sortable: true
    },
    {
      key: 'jurisdiction',
      label: t('Jurisdiction'),
      sortable: true
    },
    {
      key: 'contact_email',
      label: t('Contact Email'),
      render: (value: string) => value || '-'
    },
    {
      key: 'contact_phone',
      label: t('Contact Phone'),
      render: (value: string) => value || '-'
    },
    {
      key: 'website',
      label: t('Website'),
      render: (value: string) => value ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          {value}
        </a>
      ) : '-'
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
    }
  ];

  const actions = [
    {
      label: t('View'),
      icon: 'Eye',
      action: 'view',
      className: 'text-blue-500',
      requiredPermission: 'view-regulatory-bodies'
    },
    {
      label: t('Edit'),
      icon: 'Edit',
      action: 'edit',
      className: 'text-amber-500',
      requiredPermission: 'edit-regulatory-bodies'
    },
    {
      label: t('Toggle Status'),
      icon: 'ToggleLeft',
      action: 'toggle-status',
      className: 'text-green-500',
      requiredPermission: 'toggle-status-regulatory-bodies'
    },
    {
      label: t('Delete'),
      icon: 'Trash2',
      action: 'delete',
      className: 'text-red-500',
      requiredPermission: 'delete-regulatory-bodies'
    }
  ];

  const statusOptions = [
    { value: 'all', label: t('All Statuses') },
    { value: 'active', label: t('Active') },
    { value: 'inactive', label: t('Inactive') }
  ];

  const jurisdictionOptions = [
    { value: 'all', label: t('All Jurisdictions') },
    { value: 'Federal', label: t('Federal') },
    { value: 'State', label: t('State') },
    { value: 'Local', label: t('Local') }
  ];

  return (
    <PageTemplate
      title={t("Regulatory Bodies")}
      url="/compliance/regulatory-bodies"
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
            },
            {
              name: 'jurisdiction',
              label: t('Jurisdiction'),
              type: 'select',
              value: selectedJurisdiction,
              onChange: setSelectedJurisdiction,
              options: jurisdictionOptions
            }
          ]}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          hasActiveFilters={() => searchTerm !== '' || selectedStatus !== 'all' || selectedJurisdiction !== 'all'}
          activeFilterCount={() => (searchTerm ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0) + (selectedJurisdiction !== 'all' ? 1 : 0)}
          onResetFilters={() => {
            setSearchTerm('');
            setSelectedStatus('all');
            setSelectedJurisdiction('all');
            setShowFilters(false);
            router.get(route('compliance.regulatory-bodies.index'), { page: 1, per_page: pageFilters.per_page });
          }}
          onApplyFilters={applyFilters}
          currentPerPage={pageFilters.per_page?.toString() || "10"}
          onPerPageChange={(value) => {
            router.get(route('compliance.regulatory-bodies.index'), {
              page: 1,
              per_page: parseInt(value),
              search: searchTerm || undefined,
              status: selectedStatus !== 'all' ? selectedStatus : undefined,
              jurisdiction: selectedJurisdiction !== 'all' ? selectedJurisdiction : undefined
            });
          }}
        />
      </div>

      {/* Content section */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        <CrudTable
          columns={columns}
          actions={actions}
          data={bodies?.data || []}
          from={bodies?.from || 1}
          onAction={handleAction}
          sortField={pageFilters.sort_field}
          sortDirection={pageFilters.sort_direction}
          onSort={handleSort}
          permissions={permissions}
          entityPermissions={{
            view: 'view-regulatory-bodies',
            create: 'create-regulatory-bodies',
            edit: 'edit-regulatory-bodies',
            delete: 'delete-regulatory-bodies'
          }}
        />

        <Pagination
          from={bodies?.from || 0}
          to={bodies?.to || 0}
          total={bodies?.total || 0}
          links={bodies?.links}
          entityName={t("regulatory bodies")}
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
            { name: 'jurisdiction', label: t('Jurisdiction'), type: 'text', required: true },
            { name: 'contact_email', label: t('Contact Email'), type: 'email' },
            { name: 'contact_phone', label: t('Contact Phone'), type: 'text' },
            { name: 'address', label: t('Address'), type: 'textarea' },
            { name: 'website', label: t('Website'), type: 'text' },
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
          modalSize: 'xl'
        }}
        initialData={currentItem}
        title={
          formMode === 'create'
            ? t('Add Regulatory Body')
            : formMode === 'edit'
              ? t('Edit Regulatory Body')
              : t('View Regulatory Body')
        }
        mode={formMode}
      />

      {/* Delete Modal */}
      <CrudDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={currentItem?.name || ''}
        entityName="regulatory body"
      />
    </PageTemplate>
  );
}