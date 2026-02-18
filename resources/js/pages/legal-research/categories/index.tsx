import { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { usePage, router } from '@inertiajs/react';
import { Plus, Tag } from 'lucide-react';
import { hasPermission } from '@/utils/authorization';
import { CrudTable } from '@/components/CrudTable';
import { CrudFormModal } from '@/components/CrudFormModal';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { toast } from '@/components/custom-toast';
import { useTranslation } from 'react-i18next';
import { Pagination } from '@/components/ui/pagination';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';

export default function ResearchCategories() {
  const { t } = useTranslation();
  const { auth, categories, practiceAreas, filters: pageFilters = {} } = usePage().props as any;
  const permissions = auth?.permissions || [];

  const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
  const [selectedPracticeArea, setSelectedPracticeArea] = useState(pageFilters.practice_area_id || 'all');
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
    router.get(route('legal-research.categories.index'), {
      page: 1,
      search: searchTerm || undefined,
      practice_area_id: selectedPracticeArea !== 'all' ? selectedPracticeArea : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const handleSort = (field: string) => {
    const direction = pageFilters.sort_field === field && pageFilters.sort_direction === 'asc' ? 'desc' : 'asc';
    router.get(route('legal-research.categories.index'), {
      sort_field: field,
      sort_direction: direction,
      page: 1,
      search: searchTerm || undefined,
      practice_area_id: selectedPracticeArea !== 'all' ? selectedPracticeArea : undefined,
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

  const handleToggleStatus = (category: any) => {
    const newStatus = category.status === 'active' ? 'inactive' : 'active';
    toast.loading(`${newStatus === 'active' ? t('Activating') : t('Deactivating')} category...`);

    router.put(route('legal-research.categories.toggle-status', category.id), {}, {
      onSuccess: (page) => {
        toast.dismiss();
        if (page.props.flash.success) {
          toast.success(page.props.flash.success);
        }
      },
      onError: (errors) => {
        toast.dismiss();
        toast.error(`Failed to update category status: ${Object.values(errors).join(', ')}`);
      }
    });
  };

  const handleFormSubmit = (formData: any) => {
    const action = formMode === 'create' ? 'store' : 'update';
    const route_name = formMode === 'create' 
      ? 'legal-research.categories.store' 
      : 'legal-research.categories.update';
    
    toast.loading(t(`${formMode === 'create' ? 'Creating' : 'Updating'} research category...`));

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
        toast.error(`Failed to ${action} research category: ${Object.values(errors).join(', ')}`);
      }
    });
  };

  const handleDeleteConfirm = () => {
    toast.loading(t('Deleting research category...'));
    router.delete(route('legal-research.categories.destroy', currentItem.id), {
      onSuccess: (page) => {
        setIsDeleteModalOpen(false);
        toast.dismiss();
        if (page.props.flash.success) {
          toast.success(page.props.flash.success);
        }
      },
      onError: (errors) => {
        toast.dismiss();
        toast.error(`Failed to delete research category: ${Object.values(errors).join(', ')}`);
      }
    });
  };

  const pageActions = [];
  if (hasPermission(permissions, 'create-research-categories')) {
    pageActions.push({
      label: t('Add Research Category'),
      icon: <Plus className="h-4 w-4 mr-2" />,
      variant: 'default',
      onClick: () => handleAddNew()
    });
  }

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Legal Research') },
    { title: t('Research Categories') }
  ];

  const columns = [
    {
      key: 'name',
      label: t('Name'),
      sortable: true,
      render: (value: string, item: any) => (
        <div className="flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded-full border border-gray-300"
            style={{ backgroundColor: item.color }}
          />
          <Tag className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'practice_area',
      label: t('Practice Area'),
      render: (value: any) => value?.name || '-'
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
      requiredPermission: 'view-research-categories'
    },
    {
      label: t('Edit'),
      icon: 'Edit',
      action: 'edit',
      className: 'text-amber-500',
      requiredPermission: 'edit-research-categories'
    },
    {
      label: t('Toggle Status'),
      icon: 'ToggleLeft',
      action: 'toggle-status',
      className: 'text-green-500',
      requiredPermission: 'edit-research-categories'
    },
    {
      label: t('Delete'),
      icon: 'Trash2',
      action: 'delete',
      className: 'text-red-500',
      requiredPermission: 'delete-research-categories'
    }
  ];

  const practiceAreaOptions = [
    { value: 'all', label: t('All Practice Areas') },
    ...(practiceAreas || []).map((area: any) => ({ value: area.id.toString(), label: area.name }))
  ];

  return (
    <PageTemplate
      title={t("Research Categories")}
      url="/legal-research/categories"
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
              name: 'practice_area_id',
              label: t('Practice Area'),
              type: 'select',
              value: selectedPracticeArea,
              onChange: setSelectedPracticeArea,
              options: practiceAreaOptions
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
          hasActiveFilters={() => searchTerm !== '' || selectedPracticeArea !== 'all' || selectedStatus !== 'all'}
          activeFilterCount={() => (searchTerm ? 1 : 0) + (selectedPracticeArea !== 'all' ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0)}
          onResetFilters={() => {
            setSearchTerm('');
            setSelectedPracticeArea('all');
            setSelectedStatus('all');
            setShowFilters(false);
            router.get(route('legal-research.categories.index'), { page: 1, per_page: pageFilters.per_page });
          }}
          onApplyFilters={applyFilters}
          currentPerPage={pageFilters.per_page?.toString() || "10"}
          onPerPageChange={(value) => {
            router.get(route('legal-research.categories.index'), {
              page: 1,
              per_page: parseInt(value),
              search: searchTerm || undefined,
              practice_area_id: selectedPracticeArea !== 'all' ? selectedPracticeArea : undefined,
              status: selectedStatus !== 'all' ? selectedStatus : undefined
            });
          }}
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        <CrudTable
          columns={columns}
          actions={actions}
          data={categories?.data || []}
          from={categories?.from || 1}
          onAction={handleAction}
          sortField={pageFilters.sort_field}
          sortDirection={pageFilters.sort_direction}
          onSort={handleSort}
          permissions={permissions}
          entityPermissions={{
            view: 'view-research-categories',
            create: 'create-research-categories',
            edit: 'edit-research-categories',
            delete: 'delete-research-categories'
          }}
        />

        <Pagination
          from={categories?.from || 0}
          to={categories?.to || 0}
          total={categories?.total || 0}
          links={categories?.links}
          entityName={t("research categories")}
          onPageChange={(url) => router.get(url)}
        />
      </div>

      {/* Create/Edit Modal */}
      <CrudFormModal
        isOpen={isFormModalOpen && formMode !== 'view'}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        formConfig={{
          fields: [
            { name: 'name', label: t('Name'), type: 'text', required: true },
            { name: 'description', label: t('Description'), type: 'textarea', rows: 3 },
            { name: 'color', label: t('Color'), type: 'color', defaultValue: '#3b82f6' },
            { 
              name: 'practice_area_id', 
              label: t('Practice Area'), 
              type: 'select',
              options: [
                ...(practiceAreas || []).map((area: any) => ({ value: area.id, label: area.name }))
              ]
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
          modalSize: 'lg'
        }}
        initialData={currentItem}
        title={
          formMode === 'create'
            ? t('Add New Research Category')
            : t('Edit Research Category')
        }
        mode={formMode}
      />

      {/* View Modal */}
      <CrudFormModal
        isOpen={isFormModalOpen && formMode === 'view'}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={() => {}}
        formConfig={{
          fields: [
            { name: 'name', label: t('Name'), type: 'text' },
            { name: 'description', label: t('Description'), type: 'textarea' },
            { name: 'color', label: t('Color'), type: 'color' },
            {
              name: 'practice_area',
              label: t('Practice Area'),
              type: 'text',
              render: () => (
                <div className="rounded-md border bg-gray-50 p-2">
                  {currentItem?.practice_area?.name || t('No Practice Area')}
                </div>
              )
            },
            {
              name: 'status',
              label: t('Status'),
              type: 'text',
              render: () => (
                <div className="rounded-md border bg-gray-50 p-2">
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                    currentItem?.status === 'active'
                      ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
                      : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
                  }`}>
                    {currentItem?.status === 'active' ? t('Active') : t('Inactive')}
                  </span>
                </div>
              )
            },
            { name: 'created_at', label: t('Created At'), type: 'text' },
            { name: 'updated_at', label: t('Updated At'), type: 'text' }
          ],
          modalSize: 'lg'
        }}
        initialData={currentItem}
        title={t('View Research Category')}
        mode="view"
      />

      <CrudDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={currentItem?.name || ''}
        entityName="research category"
      />
    </PageTemplate>
  );
}