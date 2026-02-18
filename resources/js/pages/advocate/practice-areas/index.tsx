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

export default function PracticeAreas() {
  const { t } = useTranslation();
  const { auth, practiceAreas, filters: pageFilters = {} } = usePage().props as any;
  const permissions = auth?.permissions || [];

  const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
  const [selectedExpertise, setSelectedExpertise] = useState(pageFilters.expertise_level || 'all');
  const [selectedPrimary, setSelectedPrimary] = useState(pageFilters.is_primary || 'all');
  const [selectedStatus, setSelectedStatus] = useState(pageFilters.status || 'all');
  const [showFilters, setShowFilters] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');

  const hasActiveFilters = () => {
    return searchTerm !== '' || selectedExpertise !== 'all' || selectedPrimary !== 'all' || selectedStatus !== 'all';
  };

  const activeFilterCount = () => {
    return (searchTerm ? 1 : 0) + (selectedExpertise !== 'all' ? 1 : 0) + (selectedPrimary !== 'all' ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const applyFilters = () => {
    router.get(route('advocate.practice-areas.index'), {
      page: 1,
      search: searchTerm || undefined,
      expertise_level: selectedExpertise !== 'all' ? selectedExpertise : undefined,
      is_primary: selectedPrimary !== 'all' ? selectedPrimary : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const handleSort = (field: string) => {
    const direction = pageFilters.sort_field === field && pageFilters.sort_direction === 'asc' ? 'desc' : 'asc';
    router.get(route('advocate.practice-areas.index'), {
      sort_field: field,
      sort_direction: direction,
      page: 1,
      search: searchTerm || undefined,
      expertise_level: selectedExpertise !== 'all' ? selectedExpertise : undefined,
      is_primary: selectedPrimary !== 'all' ? selectedPrimary : undefined,
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

  const handleFormSubmit = (formData: any) => {
    // Ensure is_primary is sent as string for backend validation
    if (formData.is_primary !== undefined) {
      formData.is_primary = formData.is_primary === true || formData.is_primary === 'true' ? 'true' : 'false';
    }
    
    if (formMode === 'create') {
      toast.loading(t('Creating practice area...'));
      router.post(route('advocate.practice-areas.store'), formData, {
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
            toast.error(`Failed to create practice area: ${Object.values(errors).join(', ')}`);
          }
        }
      });
    } else if (formMode === 'edit') {
      toast.loading(t('Updating practice area...'));
      router.put(route('advocate.practice-areas.update', currentItem.id), formData, {
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
            toast.error(`Failed to update practice area: ${Object.values(errors).join(', ')}`);
          }
        }
      });
    }
  };

  const handleDeleteConfirm = () => {
    toast.loading(t('Deleting practice area...'));
    router.delete(route('advocate.practice-areas.destroy', currentItem.id), {
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
          toast.error(`Failed to delete practice area: ${Object.values(errors).join(', ')}`);
        }
      }
    });
  };

  const handleToggleStatus = (area: any) => {
    const newStatus = area.status === 'active' ? 'inactive' : 'active';
    toast.loading(`${newStatus === 'active' ? t('Activating') : t('Deactivating')} practice area...`);
    router.put(route('advocate.practice-areas.toggle-status', area.id), {}, {
      onSuccess: (page) => {
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
          toast.error(`Failed to update practice area status: ${Object.values(errors).join(', ')}`);
        }
      }
    });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedExpertise('all');
    setSelectedPrimary('all');
    setSelectedStatus('all');
    setShowFilters(false);
    router.get(route('advocate.practice-areas.index'), {
      page: 1,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const pageActions = [];
  if (hasPermission(permissions, 'create-practice-areas')) {
    pageActions.push({
      label: t('Add Practice Area'),
      icon: <Plus className="h-4 w-4 mr-2" />,
      variant: 'default',
      onClick: () => handleAddNew()
    });
  }

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Advocate'), href: route('advocate.company-profiles.index') },
    { title: t('Practice Areas') }
  ];

  const columns = [
    { key: 'area_id', label: t('Area ID'), sortable: true },
    { key: 'name', label: t('Practice Area'), sortable: true },
    {
      key: 'expertise_level',
      label: t('Expertise'),
      render: (value: string) => {
        const levels = { beginner: t('Beginner'), intermediate: t('Intermediate'), expert: t('Expert') };
        return levels[value as keyof typeof levels] || value;
      }
    },
    {
      key: 'is_primary',
      label: t('Primary'),
      render: (value: boolean) => (
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${value
          ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20'
          : 'bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20'
          }`}>
          {value ? t('Primary') : t('Secondary')}
        </span>
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
    },
    {
      key: 'created_at',
      label: t('Created At'),
      sortable: true,
        type: 'date',
    }
  ];

  const actions = [
    { label: t('View'), icon: 'Eye', action: 'view', className: 'text-blue-500', requiredPermission: 'view-practice-areas' },
    { label: t('Edit'), icon: 'Edit', action: 'edit', className: 'text-amber-500', requiredPermission: 'edit-practice-areas' },
    { label: t('Toggle Status'), icon: 'Lock', action: 'toggle-status', className: 'text-amber-500', requiredPermission: 'edit-practice-areas' },
    { label: t('Delete'), icon: 'Trash2', action: 'delete', className: 'text-red-500', requiredPermission: 'delete-practice-areas' }
  ];

  const expertiseOptions = [
    { value: 'all', label: t('All Levels') },
    { value: 'beginner', label: t('Beginner') },
    { value: 'intermediate', label: t('Intermediate') },
    { value: 'expert', label: t('Expert') }
  ];

  const primaryOptions = [
    { value: 'all', label: t('All Areas') },
    { value: 'true', label: t('Primary') },
    { value: 'false', label: t('Secondary') }
  ];

  const statusOptions = [
    { value: 'all', label: t('All Statuses') },
    { value: 'active', label: t('Active') },
    { value: 'inactive', label: t('Inactive') }
  ];

  return (
    <PageTemplate title={t("Practice Areas")} url="/advocate/practice-areas" actions={pageActions} breadcrumbs={breadcrumbs} noPadding>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow mb-4 p-4">
        <SearchAndFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearch={handleSearch}
          filters={[
            { name: 'expertise_level', label: t('Expertise Level'), type: 'select', value: selectedExpertise, onChange: setSelectedExpertise, options: expertiseOptions },
            { name: 'is_primary', label: t('Type'), type: 'select', value: selectedPrimary, onChange: setSelectedPrimary, options: primaryOptions },
            { name: 'status', label: t('Status'), type: 'select', value: selectedStatus, onChange: setSelectedStatus, options: statusOptions }
          ]}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          hasActiveFilters={hasActiveFilters}
          activeFilterCount={activeFilterCount}
          onResetFilters={handleResetFilters}
          onApplyFilters={applyFilters}
          currentPerPage={pageFilters.per_page?.toString() || "10"}
          onPerPageChange={(value) => {
            router.get(route('advocate.practice-areas.index'), {
              page: 1,
              per_page: parseInt(value),
              search: searchTerm || undefined,
              expertise_level: selectedExpertise !== 'all' ? selectedExpertise : undefined,
              is_primary: selectedPrimary !== 'all' ? selectedPrimary : undefined,
              status: selectedStatus !== 'all' ? selectedStatus : undefined
            }, { preserveState: true, preserveScroll: true });
          }}
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        <CrudTable
          columns={columns}
          actions={actions}
          data={practiceAreas?.data || []}
          from={practiceAreas?.from || 1}
          onAction={handleAction}
          sortField={pageFilters.sort_field}
          sortDirection={pageFilters.sort_direction}
          onSort={handleSort}
          permissions={permissions}
          entityPermissions={{
            view: 'view-practice-areas',
            create: 'create-practice-areas',
            edit: 'edit-practice-areas',
            delete: 'delete-practice-areas'
          }}
        />

        <Pagination
          from={practiceAreas?.from || 0}
          to={practiceAreas?.to || 0}
          total={practiceAreas?.total || 0}
          links={practiceAreas?.links}
          entityName={t("practice areas")}
          onPageChange={(url) => router.get(url)}
        />
      </div>

      <CrudFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        formConfig={{
          fields: [
            { name: 'name', label: t('Practice Area Name'), type: 'text', required: true },
            { name: 'description', label: t('Description'), type: 'textarea' },
            {
              name: 'expertise_level',
              label: t('Expertise Level'),
              type: 'select',
              required: true,
              options: [
                { value: 'beginner', label: t('Beginner') },
                { value: 'intermediate', label: t('Intermediate') },
                { value: 'expert', label: t('Expert') }
              ]
            },
            {
              name: 'is_primary',
              label: t('Primary Practice Area'),
              type: 'select',
              options: [
                { value: 'true', label: t('Yes') },
                { value: 'false', label: t('No') }
              ],
              defaultValue: 'false'
            },
            { name: 'certifications', label: t('Certifications'), type: 'textarea' },
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
        initialData={currentItem ? {
          ...currentItem,
          is_primary: currentItem.is_primary ? 'true' : 'false'
        } : null}
        title={
          formMode === 'create'
            ? t('Add New Practice Area')
            : formMode === 'edit'
              ? t('Edit Practice Area')
              : t('View Practice Area')
        }
        mode={formMode}
      />

      <CrudDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={currentItem?.name || ''}
        entityName="practice area"
      />
    </PageTemplate>
  );
}