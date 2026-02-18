import { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { usePage, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { hasPermission } from '@/utils/authorization';
import { CrudTable } from '@/components/CrudTable';
import { CrudFormModal } from '@/components/CrudFormModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { toast } from '@/components/custom-toast';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { Pagination } from '@/components/ui/pagination';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';

export default function Clients() {
  const { t } = useTranslation();
  const { auth, clients, clientTypes, planLimits, filters: pageFilters = {} } = usePage().props as any;
  const permissions = auth?.permissions || [];
  const { url } = usePage();

  // State
  const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
  const [selectedClientType, setSelectedClientType] = useState(pageFilters.client_type_id || 'all');
  const [selectedStatus, setSelectedStatus] = useState(pageFilters.status || 'all');
  const [showFilters, setShowFilters] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [resetPasswordData, setResetPasswordData] = useState({ password: '', password_confirmation: '' });
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');

  // Check if any filters are active
  const hasActiveFilters = () => {
    return searchTerm !== '' || selectedClientType !== 'all' || selectedStatus !== 'all';
  };

  // Count active filters
  const activeFilterCount = () => {
    return (searchTerm ? 1 : 0) + (selectedClientType !== 'all' ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  useEffect(() => {
    const shouldOpen = localStorage.getItem('OPEN_CLIENT_CREATE_MODAL');

    if (shouldOpen === '1') {
      setCurrentItem(null);
      setFormMode('create');
      setIsFormModalOpen(true);

      // IMPORTANT: clear flag so refresh doesn't reopen modal
      localStorage.removeItem('OPEN_CLIENT_CREATE_MODAL');
    }
  }, []);



  const applyFilters = () => {
    router.get(route('clients.index'), {
      page: 1,
      search: searchTerm || undefined,
      client_type_id: selectedClientType !== 'all' ? selectedClientType : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const handleSort = (field: string) => {
    const direction = pageFilters.sort_field === field && pageFilters.sort_direction === 'asc' ? 'desc' : 'asc';

    router.get(route('clients.index'), {
      sort_field: field,
      sort_direction: direction,
      page: 1,
      search: searchTerm || undefined,
      client_type_id: selectedClientType !== 'all' ? selectedClientType : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const handleAction = (action: string, item: any) => {
    setCurrentItem(item);

    switch (action) {
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
      case 'reset-password':
        if (item.email) {
          setIsResetPasswordModalOpen(true);
        } else {
          toast.error(t('Client must have an email address to reset password'));
        }
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
      toast.loading(t('Creating client...'));

      router.post(route('clients.store'), formData, {
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
            toast.error(`Failed to create client: ${Object.values(errors).join(', ')}`);
          }
        }
      });
    } else if (formMode === 'edit') {
      toast.loading(t('Updating client...'));

      router.put(route('clients.update', currentItem.id), formData, {
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
            toast.error(`Failed to update client: ${Object.values(errors).join(', ')}`);
          }
        }
      });
    }
  };

  const handleDeleteConfirm = () => {
    toast.loading(t('Deleting client...'));

    router.delete(route('clients.destroy', currentItem.id), {
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
          toast.error(`Failed to delete client: ${Object.values(errors).join(', ')}`);
        }
      }
    });
  };

  const handleToggleStatus = (client: any) => {
    const newStatus = client.status === 'active' ? 'inactive' : 'active';
    toast.loading(`${newStatus === 'active' ? t('Activating') : t('Deactivating')} client...`);

    router.put(route('clients.toggle-status', client.id), {}, {
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
          toast.error(`Failed to update client status: ${Object.values(errors).join(', ')}`);
        }
      }
    });
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (resetPasswordData.password !== resetPasswordData.password_confirmation) {
      toast.error(t('Passwords do not match'));
      return;
    }

    if (resetPasswordData.password.length < 6) {
      toast.error(t('Password must be at least 6 characters'));
      return;
    }

    toast.loading(t('Resetting password...'));

    router.put(route('clients.reset-password', currentItem.id), resetPasswordData, {
      onSuccess: (page) => {
        setIsResetPasswordModalOpen(false);
        setResetPasswordData({ password: '', password_confirmation: '' });
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
          toast.error(`Failed to reset password: ${Object.values(errors).join(', ')}`);
        }
      }
    });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedClientType('all');
    setSelectedStatus('all');
    setShowFilters(false);

    router.get(route('clients.index'), {
      page: 1,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  // Define page actions
  const pageActions = [];

  // Add the "Add New Client" button if user has permission and within limits
  if (hasPermission(permissions, 'create-clients')) {
    const canCreate = !planLimits || planLimits.can_create;
    pageActions.push({
      label: planLimits && !canCreate ? t('Client Limit Reached ({{current}}/{{max}})', { current: planLimits.current_clients, max: planLimits.max_clients }) : t('Add Client'),
      icon: <Plus className="h-4 w-4 mr-2" />,
      variant: canCreate ? 'default' : 'outline',
      onClick: canCreate ? () => handleAddNew() : () => toast.error(t('Client limit exceeded. Your plan allows maximum {{max}} clients. Please upgrade your plan.', { max: planLimits.max_clients })),
      disabled: !canCreate
    });
  }

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Client Management'), href: route('clients.index') },
    { title: t('Clients') }
  ];

  // Define table columns
  const columns = [
    {
      key: 'client_id',
      label: t('Client ID'),
      sortable: true
    },
    {
      key: 'name',
      label: t('Name'),
      sortable: true
    },
    {
      key: 'email',
      label: t('Email'),
      render: (value: string) => value || '-'
    },
    {
      key: 'phone',
      label: t('Phone'),
      render: (value: string) => value || '-'
    },
    {
      key: 'client_type',
      label: t('Type'),
      render: (value: any, row: any) => {
        return row.client_type?.name || '-';
      }
    },
    {
      key: 'status',
      label: t('Status'),
      render: (value: string) => {
        return (
          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${value === 'active'
            ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
            : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
            }`}>
            {value === 'active' ? t('Active') : t('Inactive')}
          </span>
        );
      }
    },
    {
      key: 'created_at',
      label: t('Created At'),
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
      requiredPermission: 'view-clients',
      href: (row: any) => route('clients.show', row.id)
    },
    {
      label: t('Edit'),
      icon: 'Edit',
      action: 'edit',
      className: 'text-amber-500',
      requiredPermission: 'edit-clients'
    },
    {
      label: t('Toggle Status'),
      icon: 'Lock',
      action: 'toggle-status',
      className: 'text-amber-500',
      requiredPermission: 'edit-clients'
    },
    {
      label: t('Reset Password'),
      icon: 'Key',
      action: 'reset-password',
      className: 'text-purple-500',
      requiredPermission: 'reset-client-password'
    },
    {
      label: t('Delete'),
      icon: 'Trash2',
      action: 'delete',
      className: 'text-red-500',
      requiredPermission: 'delete-clients'
    }
  ];

  // Prepare client type options for filter and form
  const clientTypeOptions = [
    { value: 'all', label: t('All Types') },
    ...(clientTypes || []).map((type: any) => ({
      value: type.id.toString(),
      label: type.name
    }))
  ];

  // Prepare status options for filter
  const statusOptions = [
    { value: 'all', label: t('All Statuses') },
    { value: 'active', label: t('Active') },
    { value: 'inactive', label: t('Inactive') }
  ];

  return (
    <PageTemplate
      title={t("Client Management")}
      url="/clients"
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
              name: 'client_type_id',
              label: t('Client Type'),
              type: 'select',
              value: selectedClientType,
              onChange: setSelectedClientType,
              options: clientTypeOptions
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
            router.get(route('clients.index'), {
              page: 1,
              per_page: parseInt(value),
              search: searchTerm || undefined,
              client_type_id: selectedClientType !== 'all' ? selectedClientType : undefined,
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
          data={clients?.data || []}
          from={clients?.from || 1}
          onAction={handleAction}
          sortField={pageFilters.sort_field}
          sortDirection={pageFilters.sort_direction}
          onSort={handleSort}
          permissions={permissions}
          entityPermissions={{
            view: 'view-clients',
            create: 'create-clients',
            edit: 'edit-clients',
            delete: 'delete-clients'
          }}
        />

        {/* Pagination section */}
        <Pagination
          from={clients?.from || 0}
          to={clients?.to || 0}
          total={clients?.total || 0}
          links={clients?.links}
          entityName={t("clients")}
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
            { name: 'name', label: t('Client Name'), type: 'text', required: true },
            { name: 'email', label: t('Email'), type: 'email' },
            ...(formMode === 'create' ? [{ name: 'password', label: t('Password'), type: 'password', required: true }] : []),
            { name: 'phone', label: t('Phone'), type: 'text' },
            {
              name: 'client_type_id',
              label: t('Client Type'),
              type: 'select',
              required: true,
              options: clientTypes ? clientTypes.map((type: any) => ({
                value: type.id.toString(),
                label: type.name
              })) : []
            },
            { name: 'company_name', label: t('Company Name'), type: 'text' },
            { name: 'tax_id', label: t('Tax ID'), type: 'text' },
            { name: 'tax_rate', label: t('Tax Rate (%)'), type: 'number', step: '0.01', min: '0', max: '100', defaultValue: 0 },
            { name: 'date_of_birth', label: t('Date of Birth'), type: 'date' },
            { name: 'address', label: t('Address'), type: 'textarea' },
            { name: 'referral_source', label: t('Referral Source'), type: 'text' },
            { name: 'notes', label: t('Notes'), type: 'textarea' },
            {
              name: 'status',
              label: t('Status'),
              type: 'select',
              options: [
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' }
              ],
              defaultValue: 'active'
            }
          ],
          modalSize: 'xl'
        }}
        initialData={currentItem}
        title={
          formMode === 'create'
            ? t('Add New Client')
            : formMode === 'edit'
              ? t('Edit Client')
              : t('View Client')
        }
        mode={formMode}
      />

      {/* Delete Modal */}
      <CrudDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={currentItem?.name || ''}
        entityName="client"
      />

      {/* Reset Password Modal */}
      <Dialog open={isResetPasswordModalOpen} onOpenChange={setIsResetPasswordModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('Reset Client Password')}</DialogTitle>
            <div className="text-sm text-muted-foreground">
              <p><strong>{t('Client')}:</strong> {currentItem?.name}</p>
              <p><strong>{t('Email')}:</strong> {currentItem?.email}</p>
            </div>
          </DialogHeader>
          <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">{t('New Password')}</Label>
              <Input
                id="password"
                type="password"
                value={resetPasswordData.password}
                onChange={(e) => setResetPasswordData(prev => ({ ...prev, password: e.target.value }))}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password_confirmation">{t('Confirm Password')}</Label>
              <Input
                id="password_confirmation"
                type="password"
                value={resetPasswordData.password_confirmation}
                onChange={(e) => setResetPasswordData(prev => ({ ...prev, password_confirmation: e.target.value }))}
                required
                minLength={6}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsResetPasswordModalOpen(false);
                  setResetPasswordData({ password: '', password_confirmation: '' });
                }}
              >
                {t('Cancel')}
              </Button>
              <Button type="submit">
                {t('Reset Password')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
}