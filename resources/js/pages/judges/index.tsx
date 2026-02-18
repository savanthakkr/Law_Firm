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

export default function Judges() {
  const { t } = useTranslation();
  const { auth, judges, courts, filters: pageFilters = {} } = usePage().props as any;
  const permissions = auth?.permissions || [];

  const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
  const [selectedCourt, setSelectedCourt] = useState(pageFilters.court_id || 'all');
  const [selectedStatus, setSelectedStatus] = useState(pageFilters.status || 'all');
  const [showFilters, setShowFilters] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');

  const hasActiveFilters = () => {
    return searchTerm !== '' || selectedCourt !== 'all' || selectedStatus !== 'all';
  };

  const activeFilterCount = () => {
    return (searchTerm ? 1 : 0) + (selectedCourt !== 'all' ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const applyFilters = () => {
    router.get(route('judges.index'), {
      page: 1,
      search: searchTerm || undefined,
      court_id: selectedCourt !== 'all' ? selectedCourt : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const handleSort = (field: string) => {
    const direction = pageFilters.sort_field === field && pageFilters.sort_direction === 'asc' ? 'desc' : 'asc';

    router.get(route('judges.index'), {
      sort_field: field,
      sort_direction: direction,
      page: 1,
      search: searchTerm || undefined,
      court_id: selectedCourt !== 'all' ? selectedCourt : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const handleAction = (action: string, item: any) => {
    setCurrentItem(item);

    switch (action) {
      case 'view':
        setIsViewModalOpen(true);
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
      toast.loading(t('Creating judge...'));

      router.post(route('judges.store'), formData, {
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
          toast.error(`Failed to create judge: ${Object.values(errors).join(', ')}`);
        }
      });
    } else if (formMode === 'edit') {
      toast.loading(t('Updating judge...'));

      router.put(route('judges.update', currentItem.id), formData, {
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
          toast.error(`Failed to update judge: ${Object.values(errors).join(', ')}`);
        }
      });
    }
  };

  const handleDeleteConfirm = () => {
    toast.loading(t('Deleting judge...'));

    router.delete(route('judges.destroy', currentItem.id), {
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
        toast.error(`Failed to delete judge: ${Object.values(errors).join(', ')}`);
      }
    });
  };

  const handleToggleStatus = (judge: any) => {
    const newStatus = judge.status === 'active' ? 'inactive' : 'active';
    toast.loading(`${newStatus === 'active' ? t('Activating') : t('Deactivating')} judge...`);

    router.put(route('judges.toggle-status', judge.id), {}, {
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
        toast.error(`Failed to update judge status: ${Object.values(errors).join(', ')}`);
      }
    });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCourt('all');
    setSelectedStatus('all');
    setShowFilters(false);

    router.get(route('judges.index'), {
      page: 1,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const pageActions = [];

  if (hasPermission(permissions, 'create-judges')) {
    pageActions.push({
      label: t('Add Judge'),
      icon: <Plus className="h-4 w-4 mr-2" />,
      variant: 'default',
      onClick: () => handleAddNew()
    });
  }

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Court Schedule'), href: route('courts.index') },
    { title: t('Judges') }
  ];

  const columns = [
    { key: 'judge_id', label: t('Judge ID'), sortable: true },
    { key: 'name', label: t('Judge Name'), sortable: true },
    { key: 'title', label: t('Title'), render: (value: string) => value || '-' },
    { key: 'court', label: t('Court'), render: (value: any, row: any) => row.court?.name || '-' },
    { key: 'email', label: t('Email'), render: (value: string) => value || '-' },
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
    { label: t('View'), icon: 'Eye', action: 'view', className: 'text-blue-500', requiredPermission: 'view-judges' },
    { label: t('Edit'), icon: 'Edit', action: 'edit', className: 'text-amber-500', requiredPermission: 'edit-judges' },
    { label: t('Toggle Status'), icon: 'Lock', action: 'toggle-status', className: 'text-amber-500', requiredPermission: 'edit-judges' },
    { label: t('Delete'), icon: 'Trash2', action: 'delete', className: 'text-red-500', requiredPermission: 'delete-judges' }
  ];

  const courtOptions = [
    { value: 'all', label: t('All Courts') },
    ...(courts || []).map((court: any) => ({
      value: court.id.toString(),
      label: court.name
    }))
  ];

  const statusOptions = [
    { value: 'all', label: t('All Statuses') },
    { value: 'active', label: t('Active') },
    { value: 'inactive', label: t('Inactive') }
  ];

  return (
    <PageTemplate title={t("Judge Management")} url="/judges" actions={pageActions} breadcrumbs={breadcrumbs} noPadding>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow mb-4 p-4">
        <SearchAndFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearch={handleSearch}
          filters={[
            { name: 'court_id', label: t('Court'), type: 'select', value: selectedCourt, onChange: setSelectedCourt, options: courtOptions },
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
            router.get(route('judges.index'), {
              page: 1, per_page: parseInt(value),
              search: searchTerm || undefined,
              court_id: selectedCourt !== 'all' ? selectedCourt : undefined,
              status: selectedStatus !== 'all' ? selectedStatus : undefined
            }, { preserveState: true, preserveScroll: true });
          }}
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        <CrudTable
          columns={columns}
          actions={actions}
          data={judges?.data || []}
          from={judges?.from || 1}
          onAction={handleAction}
          sortField={pageFilters.sort_field}
          sortDirection={pageFilters.sort_direction}
          onSort={handleSort}
          permissions={permissions}
          entityPermissions={{ view: 'view-judges', create: 'create-judges', edit: 'edit-judges', delete: 'delete-judges' }}
        />

        <Pagination
          from={judges?.from || 0}
          to={judges?.to || 0}
          total={judges?.total || 0}
          links={judges?.links}
          entityName={t("judges")}
          onPageChange={(url) => router.get(url)}
        />
      </div>

      <CrudFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        formConfig={{
          fields: [
            { name: 'court_id', label: t('Court'), type: 'select', required: true, options: courts ? courts.map((court: any) => ({ value: court.id.toString(), label: court.name })) : [] },
            { name: 'name', label: t('Judge Name'), type: 'text', required: true },
            { name: 'title', label: t('Title'), type: 'text' },
            { name: 'email', label: t('Email'), type: 'email' },
            { name: 'phone', label: t('Phone'), type: 'text' },
            { name: 'contact_info', label: t('Contact Information'), type: 'textarea' },
            { name: 'notes', label: t('Notes'), type: 'textarea' },
            { name: 'status', label: t('Status'), type: 'select', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }], defaultValue: 'active' }
          ],
          modalSize: 'xl'
        }}
        initialData={currentItem}
        title={formMode === 'create' ? t('Add New Judge') : formMode === 'edit' ? t('Edit Judge') : t('View Judge')}
        mode={formMode}
      />

      <CrudDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={currentItem?.name || ''}
        entityName="judge"
      />

      {/* View Modal */}
      <CrudFormModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        onSubmit={() => {}}
        formConfig={{
          fields: [
            { name: 'court_name', label: t('Court'), type: 'text', readOnly: true },
            { name: 'judge_id', label: t('Judge ID'), type: 'text', readOnly: true },
            { name: 'name', label: t('Judge Name'), type: 'text', readOnly: true },
            { name: 'title', label: t('Title'), type: 'text', readOnly: true },
            { name: 'email', label: t('Email'), type: 'email', readOnly: true },
            { name: 'phone', label: t('Phone'), type: 'text', readOnly: true },
            { name: 'contact_info', label: t('Contact Information'), type: 'textarea', readOnly: true },
            { name: 'notes', label: t('Notes'), type: 'textarea', readOnly: true },
            { name: 'status', label: t('Status'), type: 'text', readOnly: true }
          ],
          modalSize: 'xl'
        }}
        initialData={{
          ...currentItem,
          court_name: currentItem?.court?.name || '-'
        }}
        title={t('View Judge Details')}
        mode='view'
      />
    </PageTemplate>
  );
}