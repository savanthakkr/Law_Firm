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

export default function ClientBillingCurrencies() {
  const { t } = useTranslation();
  const { auth, currencies, filters: pageFilters = {} } = usePage().props as any;
  const permissions = auth?.permissions || [];

  const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route('client-billing-currencies.index'), {
      page: 1,
      search: searchTerm || undefined,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const handleSort = (field: string) => {
    const direction = pageFilters.sort_field === field && pageFilters.sort_direction === 'asc' ? 'desc' : 'asc';
    router.get(route('client-billing-currencies.index'), {
      sort_field: field,
      sort_direction: direction,
      page: 1,
      search: searchTerm || undefined,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const handleAction = (action: string, item: any) => {
    setCurrentItem(item);
    if (action === 'edit') {
      setFormMode('edit');
      setIsFormModalOpen(true);
    } else if (action === 'delete') {
      setIsDeleteModalOpen(true);
    }
  };

  const handleAddNew = () => {
    setCurrentItem(null);
    setFormMode('create');
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = (formData: any) => {
    if (formMode === 'create') {
      router.post(route('client-billing-currencies.store'), formData, {
        onSuccess: (page) => {
          setIsFormModalOpen(false);
          if (page.props.flash.success) {
            toast.success(page.props.flash.success);
          }
        },
        onError: (errors) => {
          toast.error(`Failed to create currency: ${Object.values(errors).join(', ')}`);
        }
      });
    } else {
      router.put(route('client-billing-currencies.update', currentItem.id), formData, {
        onSuccess: (page) => {
          setIsFormModalOpen(false);
          if (page.props.flash.success) {
            toast.success(page.props.flash.success);
          }
        },
        onError: (errors) => {
          toast.error(`Failed to update currency: ${Object.values(errors).join(', ')}`);
        }
      });
    }
  };

  const handleDeleteConfirm = () => {
    router.delete(route('client-billing-currencies.destroy', currentItem.id), {
      onSuccess: (page) => {
        setIsDeleteModalOpen(false);
        if (page.props.flash.success) {
          toast.success(page.props.flash.success);
        }
      },
      onError: (errors) => {
        toast.error(`Failed to delete currency: ${Object.values(errors).join(', ')}`);
      }
    });
  };

  const pageActions = [];
  if (hasPermission(permissions, 'create-client-billing-currencies')) {
    pageActions.push({
      label: t('Add Currency'),
      icon: <Plus className="h-4 w-4 mr-2" />,
      variant: 'default',
      onClick: handleAddNew
    });
  }

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Client Management'), href: route('clients.index') },
    { title: t('Billing Currencies') }
  ];

  const columns = [
    { key: 'name', label: t('Name'), sortable: true },
    { key: 'code', label: t('Code'), sortable: true },
    { key: 'symbol', label: t('Symbol'), sortable: true },
    { key: 'description', label: t('Description') },
    {
      key: 'is_default',
      label: t('Default'),
      render: (value: boolean) => (
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
          value ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20' : 'bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20'
        }`}>
          {value ? t('Yes') : t('No')}
        </span>
      )
    }
  ];

  const actions = [
    {
      label: t('Edit'),
      icon: 'Edit',
      action: 'edit',
      className: 'text-amber-500',
      requiredPermission: 'edit-client-billing-currencies'
    },
    {
      label: t('Delete'),
      icon: 'Trash2',
      action: 'delete',
      className: 'text-red-500',
      requiredPermission: 'delete-client-billing-currencies',
      condition: (row: any) => !row.is_default
    }
  ];

  return (
    <PageTemplate
      title={t("Client Billing Currencies")}
      url="/client-billing-currencies"
      actions={pageActions}
      breadcrumbs={breadcrumbs}
      noPadding
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow mb-4 p-4">
        <SearchAndFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearch={handleSearch}
          filters={[]}
          showFilters={false}
          setShowFilters={() => {}}
          hasActiveFilters={() => searchTerm !== ''}
          activeFilterCount={() => searchTerm ? 1 : 0}
          onResetFilters={() => {
            setSearchTerm('');
            router.get(route('client-billing-currencies.index'), { page: 1, per_page: pageFilters.per_page });
          }}
          onApplyFilters={() => {}}
          currentPerPage={pageFilters.per_page?.toString() || "10"}
          onPerPageChange={(value) => {
            router.get(route('client-billing-currencies.index'), {
              page: 1,
              per_page: parseInt(value),
              search: searchTerm || undefined
            });
          }}
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        <CrudTable
          columns={columns}
          actions={actions}
          data={currencies?.data || []}
          from={currencies?.from || 1}
          onAction={handleAction}
          sortField={pageFilters.sort_field}
          sortDirection={pageFilters.sort_direction}
          onSort={handleSort}
          permissions={permissions}
          entityPermissions={{
            view: 'view-client-billing-currencies',
            create: 'create-client-billing-currencies',
            edit: 'edit-client-billing-currencies',
            delete: 'delete-client-billing-currencies'
          }}
        />

        <Pagination
          from={currencies?.from || 0}
          to={currencies?.to || 0}
          total={currencies?.total || 0}
          links={currencies?.links}
          entityName={t("currencies")}
          onPageChange={(url) => router.get(url)}
        />
      </div>

      <CrudFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        formConfig={{
          fields: [
            { name: 'name', label: t('Currency Name'), type: 'text', required: true },
            { name: 'code', label: t('Currency Code'), type: 'text', required: true, placeholder: 'e.g. USD, EUR, GBP' },
            { name: 'symbol', label: t('Currency Symbol'), type: 'text', required: true, placeholder: 'e.g. $, €, £' },
            { name: 'description', label: t('Description'), type: 'textarea' },
            { name: 'is_default', label: t('Set as Default Currency'), type: 'checkbox' }
          ]
        }}
        initialData={currentItem}
        title={formMode === 'create' ? t('Add New Currency') : t('Edit Currency')}
        mode={formMode}
      />

      <CrudDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={currentItem?.name || ''}
        entityName="currency"
      />
    </PageTemplate>
  );
}