import { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { usePage, router } from '@inertiajs/react';
import { hasPermission } from '@/utils/authorization';
import { CrudTable } from '@/components/CrudTable';
import { CrudFormModal } from '@/components/CrudFormModal';
import { toast } from '@/components/custom-toast';
import { useTranslation } from 'react-i18next';
import { Pagination } from '@/components/ui/pagination';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';

export default function CompanySettings() {
  const { t } = useTranslation();
  const { auth, companySettings, filters: pageFilters = {} } = usePage().props as any;
  const permissions = auth?.permissions || [];

  const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
  const [selectedCategory, setSelectedCategory] = useState(pageFilters.category || 'all');
  const [selectedType, setSelectedType] = useState(pageFilters.setting_type || 'all');
  const [showFilters, setShowFilters] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [formMode, setFormMode] = useState<'edit' | 'view'>('edit');

  const hasActiveFilters = () => {
    return searchTerm !== '' || selectedCategory !== 'all' || selectedType !== 'all';
  };

  const activeFilterCount = () => {
    return (searchTerm ? 1 : 0) + (selectedCategory !== 'all' ? 1 : 0) + (selectedType !== 'all' ? 1 : 0);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const applyFilters = () => {
    router.get(route('advocate.company-settings.index'), {
      page: 1,
      search: searchTerm || undefined,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      setting_type: selectedType !== 'all' ? selectedType : undefined,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const handleSort = (field: string) => {
    const direction = pageFilters.sort_field === field && pageFilters.sort_direction === 'asc' ? 'desc' : 'asc';
    router.get(route('advocate.company-settings.index'), {
      sort_field: field,
      sort_direction: direction,
      page: 1,
      search: searchTerm || undefined,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      setting_type: selectedType !== 'all' ? selectedType : undefined,
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
    }
  };

  const handleFormSubmit = (formData: any) => {
    toast.loading(t('Updating company setting...'));
    router.put(route('advocate.company-settings.update', currentItem.id), formData, {
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
          toast.error(`Failed to update company setting: ${Object.values(errors).join(', ')}`);
        }
      }
    });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedType('all');
    setShowFilters(false);
    router.get(route('advocate.company-settings.index'), {
      page: 1,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Advocate'), href: route('advocate.company-profiles.index') },
    { title: t('Company Settings') }
  ];

  const columns = [
    {
      key: 'category',
      label: t('Category'),
      sortable: true,
      render: (value: string) => {
        const categories = {
          general: t('General'),
          billing: t('Billing'),
          notifications: t('Notifications'),
          security: t('Security')
        };
        return categories[value as keyof typeof categories] || value;
      }
    },
    { key: 'setting_key', label: t('Setting Key'), sortable: true },
    {
      key: 'setting_value',
      label: t('Value'),
      render: (value: string, row: any) => {
        if (row.setting_type === 'boolean') {
          return (
            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${value === '1'
              ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
              : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
              }`}>
              {value === '1' ? t('Enabled') : t('Disabled')}
            </span>
          );
        }
        return value || '-';
      }
    },
    {
      key: 'setting_type',
      label: t('Type'),
      render: (value: string) => {
        const types = {
          text: t('Text'),
          number: t('Number'),
          boolean: t('Boolean'),
          json: t('JSON'),
          file: t('File')
        };
        return types[value as keyof typeof types] || value;
      }
    },
    {
      key: 'description',
      label: t('Description'),
      render: (value: string) => value || '-'
    }
  ];

  const actions = [
    { label: t('View'), icon: 'Eye', action: 'view', className: 'text-blue-500', requiredPermission: 'view-company-settings' },
    { label: t('Edit'), icon: 'Edit', action: 'edit', className: 'text-amber-500', requiredPermission: 'edit-company-settings' }
  ];

  const categoryOptions = [
    { value: 'all', label: t('All Categories') },
    { value: 'general', label: t('General') },
    { value: 'billing', label: t('Billing') },
    { value: 'notifications', label: t('Notifications') },
    { value: 'security', label: t('Security') }
  ];

  const typeOptions = [
    { value: 'all', label: t('All Types') },
    { value: 'text', label: t('Text') },
    { value: 'number', label: t('Number') },
    { value: 'boolean', label: t('Boolean') },
    { value: 'json', label: t('JSON') },
    { value: 'file', label: t('File') }
  ];

  return (
    <PageTemplate title={t("Company Settings")} url="/advocate/company-settings" breadcrumbs={breadcrumbs} noPadding>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow mb-4 p-4">
        <SearchAndFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearch={handleSearch}
          filters={[
            { name: 'category', label: t('Category'), type: 'select', value: selectedCategory, onChange: setSelectedCategory, options: categoryOptions },
            { name: 'setting_type', label: t('Type'), type: 'select', value: selectedType, onChange: setSelectedType, options: typeOptions }
          ]}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          hasActiveFilters={hasActiveFilters}
          activeFilterCount={activeFilterCount}
          onResetFilters={handleResetFilters}
          onApplyFilters={applyFilters}
          currentPerPage={pageFilters.per_page?.toString() || "10"}
          onPerPageChange={(value) => {
            router.get(route('advocate.company-settings.index'), {
              page: 1,
              per_page: parseInt(value),
              search: searchTerm || undefined,
              category: selectedCategory !== 'all' ? selectedCategory : undefined,
              setting_type: selectedType !== 'all' ? selectedType : undefined
            }, { preserveState: true, preserveScroll: true });
          }}
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        <CrudTable
          columns={columns}
          actions={actions}
          data={companySettings?.data || []}
          from={companySettings?.from || 1}
          onAction={handleAction}
          sortField={pageFilters.sort_field}
          sortDirection={pageFilters.sort_direction}
          onSort={handleSort}
          permissions={permissions}
          entityPermissions={{
            view: 'view-company-settings',
            edit: 'edit-company-settings'
          }}
        />

        <Pagination
          from={companySettings?.from || 0}
          to={companySettings?.to || 0}
          total={companySettings?.total || 0}
          links={companySettings?.links}
          entityName={t("company settings")}
          onPageChange={(url) => router.get(url)}
        />
      </div>

      <CrudFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        formConfig={{
          fields: [
            { name: 'setting_key', label: t('Setting Key'), type: 'text', disabled: true },
            {
              name: 'setting_value',
              label: t('Setting Value'),
              type: currentItem?.setting_type === 'boolean' ? 'select' : currentItem?.setting_type === 'number' ? 'number' : 'text',
              required: true,
              options: currentItem?.setting_type === 'boolean' ? [
                { value: '1', label: t('Enabled') },
                { value: '0', label: t('Disabled') }
              ] : undefined
            },
            { name: 'description', label: t('Description'), type: 'textarea' }
          ],
          modalSize: 'lg'
        }}
        initialData={currentItem}
        title={formMode === 'edit' ? t('Edit Company Setting') : t('View Company Setting')}
        mode={formMode}
      />
    </PageTemplate>
  );
}