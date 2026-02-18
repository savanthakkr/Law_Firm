import { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { usePage, router } from '@inertiajs/react';
import { Plus, Database, ExternalLink } from 'lucide-react';
import { hasPermission } from '@/utils/authorization';
import { CrudTable } from '@/components/CrudTable';
import { CrudFormModal } from '@/components/CrudFormModal';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { toast } from '@/components/custom-toast';
import { useTranslation } from 'react-i18next';
import { Pagination } from '@/components/ui/pagination';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';

export default function ResearchSources() {
  const { t } = useTranslation();
  const { auth, sources, filters: pageFilters = {} } = usePage().props as any;
  const permissions = auth?.permissions || [];

  const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
  const [selectedType, setSelectedType] = useState(pageFilters.source_type || 'all');
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
    router.get(route('legal-research.sources.index'), {
      page: 1,
      search: searchTerm || undefined,
      source_type: selectedType !== 'all' ? selectedType : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const handleSort = (field: string) => {
    const direction = pageFilters.sort_field === field && pageFilters.sort_direction === 'asc' ? 'desc' : 'asc';
    router.get(route('legal-research.sources.index'), {
      sort_field: field,
      sort_direction: direction,
      page: 1,
      search: searchTerm || undefined,
      source_type: selectedType !== 'all' ? selectedType : undefined,
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

  const handleToggleStatus = (source: any) => {
    const newStatus = source.status === 'active' ? 'inactive' : 'active';
    toast.loading(`${newStatus === 'active' ? t('Activating') : t('Deactivating')} source...`);

    router.put(route('legal-research.sources.toggle-status', source.id), {}, {
      onSuccess: (page) => {
        toast.dismiss();
        if (page.props.flash.success) {
          toast.success(page.props.flash.success);
        }
      },
      onError: (errors) => {
        toast.dismiss();
        toast.error(`Failed to update source status: ${Object.values(errors).join(', ')}`);
      }
    });
  };

  const handleFormSubmit = (formData: any) => {
    const action = formMode === 'create' ? 'store' : 'update';
    const route_name = formMode === 'create' 
      ? 'legal-research.sources.store' 
      : 'legal-research.sources.update';
    
    toast.loading(t(`${formMode === 'create' ? 'Creating' : 'Updating'} research source...`));

    const method = formMode === 'create' ? 'post' : 'put';
    const url = formMode === 'create' 
      ? route(route_name) 
      : route(route_name, currentItem.id);

    router[method](url, formData, {
      onSuccess: (page) => {
        setIsFormModalOpen(false);
        toast.dismiss();
        if (page.props.flash.success) {
          toast.success(page.props.flash.success);
        }
      },
      onError: (errors) => {
        toast.dismiss();
        toast.error(`Failed to ${action} research source: ${Object.values(errors).join(', ')}`);
      }
    });
  };

  const handleDeleteConfirm = () => {
    toast.loading(t('Deleting research source...'));
    router.delete(route('legal-research.sources.destroy', currentItem.id), {
      onSuccess: (page) => {
        setIsDeleteModalOpen(false);
        toast.dismiss();
        if (page.props.flash.success) {
          toast.success(page.props.flash.success);
        }
      },
      onError: (errors) => {
        toast.dismiss();
        toast.error(`Failed to delete research source: ${Object.values(errors).join(', ')}`);
      }
    });
  };

  const pageActions = [];
  if (hasPermission(permissions, 'create-research-sources')) {
    pageActions.push({
      label: t('Add Research Source'),
      icon: <Plus className="h-4 w-4 mr-2" />,
      variant: 'default',
      onClick: () => handleAddNew()
    });
  }

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Legal Research') },
    { title: t('Research Sources') }
  ];

  const columns = [
    {
      key: 'source_name',
      label: t('Source Name'),
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'source_type',
      label: t('Type'),
      render: (value: string) => {
        const typeColors = {
          database: 'bg-blue-50 text-blue-700 ring-blue-600/20',
          case_law: 'bg-green-50 text-green-700 ring-green-600/20',
          statutory: 'bg-orange-50 text-orange-700 ring-orange-600/20',
          regulatory: 'bg-purple-50 text-purple-700 ring-purple-600/20',
          secondary: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
          custom: 'bg-gray-50 text-gray-700 ring-gray-600/20'
        };
        
        return (
          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${typeColors[value as keyof typeof typeColors] || typeColors.custom}`}>
            {t(value.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()))}
          </span>
        );
      }
    },
    {
      key: 'url',
      label: t('URL'),
      render: (value: string) => (
        <div className="flex items-center gap-2">
          {value ? (
            <>
              <ExternalLink className="h-4 w-4 text-gray-500" />
              <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 truncate max-w-xs">
                {value}
              </a>
            </>
          ) : (
            <span className="text-gray-500">-</span>
          )}
        </div>
      )
    },
    {
      key: 'description',
      label: t('Description'),
      render: (value: string) => (
        <div className="max-w-md truncate" title={value}>
          {value || '-'}
        </div>
      )
    },
    {
      key: 'status',
      label: t('Status'),
      render: (value: string) => (
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${value === 'active'
          ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
          : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
        }`}>
          {value === 'active' ? t('Active') : t('Inactive')}
        </span>
      )
    }
  ];

  const actions = [
    {
      label: t('View'),
      icon: 'Eye',
      action: 'view',
      className: 'text-blue-500',
      requiredPermission: 'view-research-sources'
    },
    {
      label: t('Edit'),
      icon: 'Edit',
      action: 'edit',
      className: 'text-amber-500',
      requiredPermission: 'edit-research-sources'
    },
    {
      label: t('Toggle Status'),
      icon: 'ToggleLeft',
      action: 'toggle-status',
      className: 'text-green-500',
      requiredPermission: 'edit-research-sources'
    },
    {
      label: t('Delete'),
      icon: 'Trash2',
      action: 'delete',
      className: 'text-red-500',
      requiredPermission: 'delete-research-sources'
    }
  ];

  return (
    <PageTemplate
      title={t("Research Sources")}
      url="/legal-research/sources"
      actions={pageActions}
      breadcrumbs={breadcrumbs}
      noPadding
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow mb-4 p-4">
        <SearchAndFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearch={handleSearch}
          filters={[
            {
              name: 'source_type',
              label: t('Source Type'),
              type: 'select',
              value: selectedType,
              onChange: setSelectedType,
              options: [
                { value: 'all', label: t('All Types') },
                { value: 'database', label: t('Database') },
                { value: 'case_law', label: t('Case Law') },
                { value: 'statutory', label: t('Statutory') },
                { value: 'regulatory', label: t('Regulatory') },
                { value: 'secondary', label: t('Secondary') },
                { value: 'custom', label: t('Custom') }
              ]
            },
            {
              name: 'status',
              label: t('Status'),
              type: 'select',
              value: selectedStatus,
              onChange: setSelectedStatus,
              options: [
                { value: 'all', label: t('All Statuses') },
                { value: 'active', label: t('Active') },
                { value: 'inactive', label: t('Inactive') }
              ]
            }
          ]}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          hasActiveFilters={() => searchTerm !== '' || selectedType !== 'all' || selectedStatus !== 'all'}
          activeFilterCount={() => (searchTerm ? 1 : 0) + (selectedType !== 'all' ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0)}
          onResetFilters={() => {
            setSearchTerm('');
            setSelectedType('all');
            setSelectedStatus('all');
            setShowFilters(false);
            router.get(route('legal-research.sources.index'), { page: 1, per_page: pageFilters.per_page });
          }}
          onApplyFilters={applyFilters}
          currentPerPage={pageFilters.per_page?.toString() || "10"}
          onPerPageChange={(value) => {
            router.get(route('legal-research.sources.index'), {
              page: 1,
              per_page: parseInt(value),
              search: searchTerm || undefined,
              source_type: selectedType !== 'all' ? selectedType : undefined,
              status: selectedStatus !== 'all' ? selectedStatus : undefined
            });
          }}
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        <CrudTable
          columns={columns}
          actions={actions}
          data={sources?.data || []}
          from={sources?.from || 1}
          onAction={handleAction}
          sortField={pageFilters.sort_field}
          sortDirection={pageFilters.sort_direction}
          onSort={handleSort}
          permissions={permissions}
          entityPermissions={{
            view: 'view-research-sources',
            create: 'create-research-sources',
            edit: 'edit-research-sources',
            delete: 'delete-research-sources'
          }}
        />

        <Pagination
          from={sources?.from || 0}
          to={sources?.to || 0}
          total={sources?.total || 0}
          links={sources?.links}
          entityName={t("research sources")}
          onPageChange={(url) => router.get(url)}
        />
      </div>

      <CrudFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        formConfig={{
          fields: [
            { name: 'source_name', label: t('Source Name'), type: 'text', required: true },
            {
              name: 'source_type',
              label: t('Source Type'),
              type: 'select',
              required: true,
              options: [
                { value: 'database', label: t('Database') },
                { value: 'case_law', label: t('Case Law') },
                { value: 'statutory', label: t('Statutory') },
                { value: 'regulatory', label: t('Regulatory') },
                { value: 'secondary', label: t('Secondary') },
                { value: 'custom', label: t('Custom') }
              ]
            },
            { name: 'description', label: t('Description'), type: 'textarea', rows: 3 },
            { name: 'url', label: t('URL'), type: 'text' },
            { name: 'access_info', label: t('Access Information'), type: 'textarea', rows: 2 },
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
            ? t('Add New Research Source')
            : formMode === 'edit'
              ? t('Edit Research Source')
              : t('View Research Source')
        }
        mode={formMode}
      />

      <CrudDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={currentItem?.source_name || ''}
        entityName="research source"
      />
    </PageTemplate>
  );
}