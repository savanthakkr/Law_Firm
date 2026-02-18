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

export default function ProfessionalLicenses() {
  const { t } = useTranslation();
  const { auth, licenses, users, filters: pageFilters = {} } = usePage().props as any;
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const applyFilters = () => {
    router.get(route('compliance.professional-licenses.index'), {
      page: 1,
      search: searchTerm || undefined,
      user_id: selectedUser !== 'all' ? selectedUser : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const handleSort = (field: string) => {
    const direction = pageFilters.sort_field === field && pageFilters.sort_direction === 'asc' ? 'desc' : 'asc';

    router.get(route('compliance.professional-licenses.index'), {
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
    router.put(route('compliance.professional-licenses.toggle-status', item.id), {}, {
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
      router.post(route('compliance.professional-licenses.store'), formData, {
        onSuccess: (page) => {
          setIsFormModalOpen(false);
          if (page.props.flash.success) {
            toast.success(page.props.flash.success);
          }
        },
        onError: (errors) => {
          toast.error('Failed to create license');
        }
      });
    } else if (formMode === 'edit') {
      router.put(route('compliance.professional-licenses.update', currentItem.id), formData, {
        onSuccess: (page) => {
          setIsFormModalOpen(false);
          if (page.props.flash.success) {
            toast.success(page.props.flash.success);
          }
        },
        onError: (errors) => {
          toast.error('Failed to update license');
        }
      });
    }
  };

  const handleDeleteConfirm = () => {
    router.delete(route('compliance.professional-licenses.destroy', currentItem.id), {
      onSuccess: (page) => {
        setIsDeleteModalOpen(false);
        if (page.props.flash.success) {
          toast.success(page.props.flash.success);
        }
      },
      onError: (errors) => {
        toast.error('Failed to delete license');
      }
    });
  };

  const pageActions = [];
  if (hasPermission(permissions, 'create-professional-licenses')) {
    pageActions.push({
      label: t('Add License'),
      icon: <Plus className="h-4 w-4 mr-2" />,
      variant: 'default',
      onClick: () => handleAddNew()
    });
  }

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Compliance & Regulatory'), href: route('compliance.requirements.index') },
    { title: t('Professional Licenses') }
  ];

  const columns = [
    {
      key: 'user',
      label: t('User'),
      render: (value: any, row: any) => row.user?.name || '-'
    },
    {
      key: 'license_type',
      label: t('License Type'),
      sortable: true
    },
    {
      key: 'license_number',
      label: t('License Number'),
      sortable: true
    },
    {
      key: 'issuing_authority',
      label: t('Issuing Authority'),
      sortable: true
    },
    {
      key: 'jurisdiction',
      label: t('Jurisdiction'),
      sortable: true
    },
    {
      key: 'expiry_date',
      label: t('Expiry Date'),
      sortable: true,
      render: (value: string, row: any) => {
        const expiryDate = new Date(value);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        let className = '';
        if (daysUntilExpiry < 0) {
          className = 'text-red-600 font-semibold';
        } else if (daysUntilExpiry <= 30) {
          className = 'text-orange-600 font-semibold';
        }
        
        return (
          <span className={className}>
            {window.appSettings?.formatDate(value) || expiryDate.toLocaleDateString()}
            {daysUntilExpiry <= 30 && daysUntilExpiry >= 0 && (
              <span className="block text-xs">({daysUntilExpiry} days left)</span>
            )}
            {daysUntilExpiry < 0 && (
              <span className="block text-xs">(Expired)</span>
            )}
          </span>
        );
      }
    },
    {
      key: 'status',
      label: t('Status'),
      render: (value: string) => {
        const statusColors = {
          active: 'bg-green-50 text-green-700 ring-green-600/20',
          expired: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
          suspended: 'bg-red-50 text-red-700 ring-red-600/20',
          revoked: 'bg-red-50 text-red-700 ring-red-600/20'
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
      requiredPermission: 'view-professional-licenses'
    },
    {
      label: t('Edit'),
      icon: 'Edit',
      action: 'edit',
      className: 'text-amber-500',
      requiredPermission: 'edit-professional-licenses'
    },
    {
      label: t('Toggle Status'),
      icon: 'ToggleLeft',
      action: 'toggle-status',
      className: 'text-green-500',
      requiredPermission: 'toggle-status-professional-licenses'
    },
    {
      label: t('Delete'),
      icon: 'Trash2',
      action: 'delete',
      className: 'text-red-500',
      requiredPermission: 'delete-professional-licenses'
    }
  ];

  const userOptions = [
    { value: 'all', label: t('All Users') },
    ...(users || []).map((user: any) => ({
      value: user.id.toString(),
      label: user.name
    }))
  ];

  const statusOptions = [
    { value: 'all', label: t('All Statuses') },
    { value: 'active', label: t('Active') },
    { value: 'expired', label: t('Expired') },
    { value: 'suspended', label: t('Suspended') },
    { value: 'revoked', label: t('Revoked') }
  ];

  return (
    <PageTemplate
      title={t("Professional Licenses")}
      url="/compliance/professional-licenses"
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
          hasActiveFilters={() => searchTerm !== '' || selectedUser !== 'all' || selectedStatus !== 'all'}
          activeFilterCount={() => (searchTerm ? 1 : 0) + (selectedUser !== 'all' ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0)}
          onResetFilters={() => {
            setSearchTerm('');
            setSelectedUser('all');
            setSelectedStatus('all');
            setShowFilters(false);
            router.get(route('compliance.professional-licenses.index'), { page: 1, per_page: pageFilters.per_page });
          }}
          onApplyFilters={applyFilters}
          currentPerPage={pageFilters.per_page?.toString() || "10"}
          onPerPageChange={(value) => {
            router.get(route('compliance.professional-licenses.index'), {
              page: 1,
              per_page: parseInt(value),
              search: searchTerm || undefined,
              user_id: selectedUser !== 'all' ? selectedUser : undefined,
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
          data={licenses?.data || []}
          from={licenses?.from || 1}
          onAction={handleAction}
          sortField={pageFilters.sort_field}
          sortDirection={pageFilters.sort_direction}
          onSort={handleSort}
          permissions={permissions}
          entityPermissions={{
            view: 'view-professional-licenses',
            create: 'create-professional-licenses',
            edit: 'edit-professional-licenses',
            delete: 'delete-professional-licenses'
          }}
        />

        <Pagination
          from={licenses?.from || 0}
          to={licenses?.to || 0}
          total={licenses?.total || 0}
          links={licenses?.links}
          entityName={t("licenses")}
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
                ...users.map((user: any) => ({
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
            { name: 'license_type', label: t('License Type'), type: 'text', required: true },
            { name: 'license_number', label: t('License Number'), type: 'text', required: true },
            { name: 'issuing_authority', label: t('Issuing Authority'), type: 'text', required: true },
            { name: 'jurisdiction', label: t('Jurisdiction'), type: 'text', required: true },
            { name: 'issue_date', label: t('Issue Date'), type: 'date', required: true },
            { name: 'expiry_date', label: t('Expiry Date'), type: 'date', required: true },
            {
              name: 'status',
              label: t('Status'),
              type: 'select',
              options: [
                { value: 'active', label: t('Active') },
                { value: 'expired', label: t('Expired') },
                { value: 'suspended', label: t('Suspended') },
                { value: 'revoked', label: t('Revoked') }
              ],
              defaultValue: 'active'
            },
            { name: 'notes', label: t('Notes'), type: 'textarea' }
          ],
          modalSize: 'xl'
        }}
        initialData={currentItem}
        title={
          formMode === 'create'
            ? t('Add Professional License')
            : t('Edit Professional License')
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
            { name: 'license_type', label: t('License Type'), type: 'text' },
            { name: 'license_number', label: t('License Number'), type: 'text' },
            { name: 'issuing_authority', label: t('Issuing Authority'), type: 'text' },
            { name: 'jurisdiction', label: t('Jurisdiction'), type: 'text' },
            { name: 'issue_date', label: t('Issue Date'), type: 'text' },
            {
              name: 'expiry_date',
              label: t('Expiry Date'),
              type: 'text',
              render: () => {
                const expiryDate = new Date(currentItem?.expiry_date);
                const today = new Date();
                const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                
                let className = '';
                let statusText = '';
                if (daysUntilExpiry < 0) {
                  className = 'text-red-600';
                  statusText = ' (Expired)';
                } else if (daysUntilExpiry <= 30) {
                  className = 'text-orange-600';
                  statusText = ` (${daysUntilExpiry} days left)`;
                }
                
                return <div className="rounded-md border bg-gray-50 p-2">
                  <span className={className}>
                    {window.appSettings?.formatDate(currentItem?.expiry_date) || expiryDate.toLocaleDateString()}{statusText}
                  </span>
                </div>;
              }
            },
            {
              name: 'status',
              label: t('Status'),
              type: 'text',
              render: () => {
                const status = currentItem?.status;
                return <div className="rounded-md border bg-gray-50 p-2">
                  {t(capitalize(status))}
                </div>;
              }
            },
            { name: 'notes', label: t('Notes'), type: 'textarea' },
            { name: 'created_at', label: t('Created At'), type: 'text' },
            { name: 'updated_at', label: t('Updated At'), type: 'text' }
          ],
          modalSize: 'xl'
        }}
        initialData={currentItem}
        title={t('View Professional License')}
        mode="view"
      />

      {/* Delete Modal */}
      <CrudDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={currentItem?.license_number || ''}
        entityName="professional license"
      />
    </PageTemplate>
  );
}