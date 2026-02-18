import { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { usePage, router } from '@inertiajs/react';
import { Plus, Download } from 'lucide-react';
import { hasPermission } from '@/utils/authorization';
import { CrudTable } from '@/components/CrudTable';
import { CrudFormModal } from '@/components/CrudFormModal';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { toast } from '@/components/custom-toast';
import { useTranslation } from 'react-i18next';
import { Pagination } from '@/components/ui/pagination';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';

export default function CleTracking() {
  const { t } = useTranslation();
  const { auth, cleRecords, users, filters: pageFilters = {} } = usePage().props as any;
  const permissions = auth?.permissions || [];

  // State
  const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
  const [selectedUser, setSelectedUser] = useState(pageFilters.user_id || 'all');
  const [selectedStatus, setSelectedStatus] = useState(pageFilters.status || 'all');
  const [showFilters, setShowFilters] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');

  // Check if any filters are active
  const hasActiveFilters = () => {
    return searchTerm !== '' || selectedUser !== 'all' || selectedStatus !== 'all';
  };

  // Count active filters
  const activeFilterCount = () => {
    return (searchTerm ? 1 : 0) + (selectedUser !== 'all' ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const applyFilters = () => {
    router.get(route('compliance.cle-tracking.index'), {
      page: 1,
      search: searchTerm || undefined,
      user_id: selectedUser !== 'all' ? selectedUser : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const handleSort = (field: string) => {
    const direction = pageFilters.sort_field === field && pageFilters.sort_direction === 'asc' ? 'desc' : 'asc';

    router.get(route('compliance.cle-tracking.index'), {
      sort_field: field,
      sort_direction: direction,
      page: 1,
      search: searchTerm || undefined,
      user_id: selectedUser !== 'all' ? selectedUser : undefined,
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
      case 'download':
        handleDownload(item);
        break;
    }
  };

  const handleAddNew = () => {
    setCurrentItem(null);
    setFormMode('create');
    setIsFormModalOpen(true);
  };

  const handleDownload = (doc: any) => {
    const link = document.createElement('a');
    link.href = doc.certificate_file;
    link.download = doc.document_name;
    link.click();
  };

  const handleFormSubmit = (formData: any) => {
    if (formMode === 'create') {
      toast.loading(t('Creating CLE record...'));

      router.post(route('compliance.cle-tracking.store'), formData, {
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
            toast.error(`Failed to create CLE record: ${Object.values(errors).join(', ')}`);
          }
        }
      });
    } else if (formMode === 'edit') {
      toast.loading(t('Updating CLE record...'));

      router.post(route('compliance.cle-tracking.update', currentItem.id), {
        ...formData,
        _method: 'PUT'
      }, {
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
            toast.error(`Failed to update CLE record: ${Object.values(errors).join(', ')}`);
          }
        }
      });
    }
  };

  const handleDeleteConfirm = () => {
    toast.loading(t('Deleting CLE record...'));

    router.delete(route('compliance.cle-tracking.destroy', currentItem.id), {
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
          toast.error(`Failed to delete CLE record: ${Object.values(errors).join(', ')}`);
        }
      }
    });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedUser('all');
    setSelectedStatus('all');
    setShowFilters(false);

    router.get(route('compliance.cle-tracking.index'), {
      page: 1,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  // Define page actions
  const pageActions = [];

  // Add the "Add CLE Record" button if user has permission
  if (hasPermission(permissions, 'create-cle-tracking')) {
    pageActions.push({
      label: t('Add CLE Record'),
      icon: <Plus className="h-4 w-4 mr-2" />,
      variant: 'default',
      onClick: () => handleAddNew()
    });
  }

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Compliance & Regulatory'), href: route('compliance.requirements.index') },
    { title: t('CLE Tracking') }
  ];

  // Define table columns
  const columns = [
    {
      key: 'user.name',
      label: t('User'),
      render: (value: any, row: any) => {
        return row.user?.name || '-';
      }
    },
    {
      key: 'course_name',
      label: t('Course Name'),
      sortable: true
    },
    {
      key: 'provider',
      label: t('Provider'),
      sortable: true
    },
    {
      key: 'credits_earned',
      label: t('Credits'),
      render: (value: number) => {
        return value ? `${value} credits` : '-';
      }
    },
    {
      key: 'completion_date',
      label: t('Completion Date'),
      sortable: true,
      render: (value: string) => window.appSettings?.formatDate(value) || new Date(value).toLocaleDateString()
    },
    {
      key: 'expiry_date',
      label: t('Expiry Date'),
      render: (value: string) => {
        if (!value) return '-';
        const expiryDate = new Date(value);
        const isExpired = expiryDate < new Date();
        return (
          <span className={isExpired ? 'text-red-600' : 'text-gray-900'}>
            {window.appSettings?.formatDate(value) || expiryDate.toLocaleDateString()}
          </span>
        );
      }
    },
    {
      key: 'status',
      label: t('Status'),
      render: (value: string) => {
        const statusColors = {
          completed: 'bg-green-50 text-green-700 ring-green-600/20',
          in_progress: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
          expired: 'bg-red-50 text-red-700 ring-red-600/20'
        };
        return (
          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${statusColors[value as keyof typeof statusColors] || 'bg-gray-50 text-gray-700 ring-gray-600/20'}`}>
            {value.charAt(0).toUpperCase() + value.slice(1).replace('_', ' ')}
          </span>
        );
      }
    }
  ];

  // Define table actions
  const actions = [
    {
      label: t('Download Certificate'),
      icon: 'Download',
      action: 'download',
      className: 'text-blue-500',
      requiredPermission: 'download-cle-tracking'
    },
    {
      label: t('View'),
      icon: 'Eye',
      action: 'view',
      className: 'text-blue-500',
      requiredPermission: 'view-cle-tracking'
    },
    {
      label: t('Edit'),
      icon: 'Edit',
      action: 'edit',
      className: 'text-amber-500',
      requiredPermission: 'edit-cle-tracking'
    },
    {
      label: t('Delete'),
      icon: 'Trash2',
      action: 'delete',
      className: 'text-red-500',
      requiredPermission: 'delete-cle-tracking'
    }
  ];

  // Prepare options for filters and form
  const userOptions = [
    { value: 'all', label: t('All Users') },
    ...(users || []).map((user: any) => ({
      value: user.id.toString(),
      label: user.name
    }))
  ];

  const statusOptions = [
    { value: 'all', label: t('All Statuses') },
    { value: 'completed', label: t('Completed') },
    { value: 'in_progress', label: t('In Progress') },
    { value: 'expired', label: t('Expired') }
  ];

  return (
    <PageTemplate
      title={t("Continuing Legal Education (CLE) Tracking")}
      url="/compliance/cle-tracking"
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
              name: 'user_id',
              label: t('User'),
              type: 'select',
              value: selectedUser,
              onChange: setSelectedUser,
              options: userOptions
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
            router.get(route('compliance.cle-tracking.index'), {
              page: 1,
              per_page: parseInt(value),
              search: searchTerm || undefined,
              user_id: selectedUser !== 'all' ? selectedUser : undefined,
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
          data={cleRecords?.data || []}
          from={cleRecords?.from || 1}
          onAction={handleAction}
          sortField={pageFilters.sort_field}
          sortDirection={pageFilters.sort_direction}
          onSort={handleSort}
          permissions={permissions}
          entityPermissions={{
            view: 'view-cle-tracking',
            create: 'create-cle-tracking',
            edit: 'edit-cle-tracking',
            delete: 'delete-cle-tracking'
          }}
        />

        {/* Pagination section */}
        <Pagination
          from={cleRecords?.from || 0}
          to={cleRecords?.to || 0}
          total={cleRecords?.total || 0}
          links={cleRecords?.links}
          entityName={t("CLE records")}
          onPageChange={(url) => router.get(url)}
        />
      </div>

      {/* Form Modal (Create/Edit) */}
      <CrudFormModal
        isOpen={isFormModalOpen && formMode !== 'view'}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        formConfig={{
          fields: [
            {
              name: 'user_id',
              label: t('Team Member'),
              type: 'select',
              required: true,
              options: users ? [
                ...users.filter((user: any) => user.id !== auth.user.id).map((user: any) => ({
                  value: user.id.toString(),
                  label: user.name
                })),
                {
                  value: auth.user.id.toString(),
                  label: `${auth.user.name} (Me)`
                }
              ] : [{
                value: auth.user.id.toString(),
                label: `${auth.user.name} (Me)`
              }]
            },
            { name: 'course_name', label: t('Course Name'), type: 'text', required: true },
            { name: 'provider', label: t('Provider'), type: 'text', required: true },
            { name: 'credits_earned', label: t('Credits Earned'), type: 'number', required: true },
            { name: 'credits_required', label: t('Credits Required'), type: 'number' },
            { name: 'completion_date', label: t('Completion Date'), type: 'date', required: true },
            { name: 'expiry_date', label: t('Expiry Date'), type: 'date' },
            { name: 'certificate_number', label: t('Certificate Number'), type: 'text' },
            { 
              name: 'certificate_file', 
              label: t('Certificate File'), 
              type: 'media-picker',
            },
            {
              name: 'status',
              label: t('Status'),
              type: 'select',
              options: [
                { value: 'completed', label: t('Completed') },
                { value: 'in_progress', label: t('In Progress') },
                { value: 'expired', label: t('Expired') }
              ],
              defaultValue: 'completed'
            },
            { name: 'description', label: t('Description'), type: 'textarea' }
          ],
          modalSize: 'xl'
        }}
        initialData={currentItem}
        title={
          formMode === 'create'
            ? t('Add CLE Record')
            : t('Edit CLE Record')
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
            {
              name: 'user',
              label: t('Team Member'),
              type: 'text',
              render: () => {
                return <div className="rounded-md border bg-gray-50 p-2">
                  {currentItem?.user?.name || '-'}
                </div>;
              }
            },
            { name: 'course_name', label: t('Course Name'), type: 'text' },
            { name: 'provider', label: t('Provider'), type: 'text' },
            {
              name: 'credits_display',
              label: t('Credits'),
              type: 'text',
              render: () => {
                const earned = currentItem?.credits_earned || 0;
                const required = currentItem?.credits_required;
                return <div className="rounded-md border bg-gray-50 p-2">
                  {earned} credits earned{required ? ` / ${required} required` : ''}
                </div>;
              }
            },
            { name: 'completion_date', label: t('Completion Date'), type: 'text' },
            {
              name: 'expiry_date',
              label: t('Expiry Date'),
              type: 'text',
              render: () => {
                const expiryDate = currentItem?.expiry_date;
                if (!expiryDate) return <div className="rounded-md border bg-gray-50 p-2">-</div>;
                
                const expiry = new Date(expiryDate);
                const isExpired = expiry < new Date();
                
                return <div className="rounded-md border bg-gray-50 p-2">
                  <span className={isExpired ? 'text-red-600' : 'text-gray-900'}>
                    {window.appSettings?.formatDate(expiryDate) || expiry.toLocaleDateString()}
                    {isExpired && ' (Expired)'}
                  </span>
                </div>;
              }
            },
            { name: 'certificate_number', label: t('Certificate Number'), type: 'text' },
            {
              name: 'status',
              label: t('Status'),
              type: 'text',
              render: () => {
                const status = currentItem?.status;
                return <div className="rounded-md border bg-gray-50 p-2">
                  {status?.charAt(0).toUpperCase() + status?.slice(1).replace('_', ' ')}
                </div>;
              }
            },
            { name: 'description', label: t('Description'), type: 'textarea' },
            { name: 'created_at', label: t('Created At'), type: 'text' },
            { name: 'updated_at', label: t('Updated At'), type: 'text' }
          ],
          modalSize: 'xl'
        }}
        initialData={currentItem}
        title={t('View CLE Record')}
        mode="view"
      />

      {/* Delete Modal */}
      <CrudDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={currentItem?.course_name || ''}
        entityName="CLE record"
      />
    </PageTemplate>
  );
}