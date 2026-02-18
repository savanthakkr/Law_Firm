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

export default function CompliancePolicies() {
  const { t } = useTranslation();
  const { auth, compliancePolicies, filters: pageFilters = {} } = usePage().props as any;
  const permissions = auth?.permissions || [];

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');

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
    }
  };

  const handleFormSubmit = (formData: any) => {
    const routeName = formMode === 'create' ? 'compliance.policies.store' : 'compliance.policies.update';
    const method = formMode === 'create' ? 'post' : 'put';
    const params = formMode === 'create' ? [] : [currentItem.id];

    router[method](route(routeName, ...params), formData, {
      onSuccess: () => {
        setIsFormModalOpen(false);
        toast.success(`Policy ${formMode === 'create' ? 'created' : 'updated'} successfully`);
      },
      onError: (errors) => {
        toast.error(`Failed to ${formMode} policy: ${Object.values(errors).join(', ')}`);
      }
    });
  };

  const handleDeleteConfirm = () => {
    router.delete(route('compliance.policies.destroy', currentItem.id), {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        toast.success('Policy deleted successfully');
      },
      onError: () => toast.error('Failed to delete policy')
    });
  };

  const pageActions = hasPermission(permissions, 'create-compliance-policies') ? [{
    label: t('Create Policy'),
    icon: <Plus className="h-4 w-4 mr-2" />,
    variant: 'default',
    onClick: () => {
      setCurrentItem(null);
      setFormMode('create');
      setIsFormModalOpen(true);
    }
  }] : [];

  const columns = [
    { key: 'policy_name', label: t('Policy Name'), sortable: true },
    { key: 'effective_date', label: t('Effective Date'), sortable: true, render: (value: string) => new Date(value).toLocaleDateString() },
    { key: 'review_date', label: t('Review Date'), render: (value: string) => value ? new Date(value).toLocaleDateString() : '-' },
    {
      key: 'status',
      label: t('Status'),
      render: (value: string) => (
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
          value === 'active' ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-gray-50 text-gray-700 ring-gray-600/20'
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    }
  ];

  const actions = [
    { label: t('View'), icon: 'Eye', action: 'view', className: 'text-blue-500', requiredPermission: 'view-compliance-policies' },
    { label: t('Edit'), icon: 'Edit', action: 'edit', className: 'text-amber-500', requiredPermission: 'edit-compliance-policies' },
    { label: t('Delete'), icon: 'Trash2', action: 'delete', className: 'text-red-500', requiredPermission: 'delete-compliance-policies' }
  ];

  return (
    <PageTemplate
      title={t("Compliance Policies")}
      actions={pageActions}
      breadcrumbs={[
        { title: t('Dashboard'), href: route('dashboard') },
        { title: t('Compliance & Regulatory') },
        { title: t('Policies') }
      ]}
      noPadding
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        <CrudTable
          columns={columns}
          actions={actions}
          data={compliancePolicies?.data || []}
          from={compliancePolicies?.from || 1}
          onAction={handleAction}
          permissions={permissions}
          entityPermissions={{
            view: 'view-compliance-policies',
            create: 'create-compliance-policies',
            edit: 'edit-compliance-policies',
            delete: 'delete-compliance-policies'
          }}
        />
        <Pagination
          from={compliancePolicies?.from || 0}
          to={compliancePolicies?.to || 0}
          total={compliancePolicies?.total || 0}
          links={compliancePolicies?.links}
          entityName={t("policies")}
          onPageChange={(url) => router.get(url)}
        />
      </div>

      <CrudFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        formConfig={{
          fields: [
            { name: 'policy_name', label: t('Policy Name'), type: 'text', required: true },
            { name: 'policy_content', label: t('Policy Content'), type: 'textarea', required: true, rows: 6 },
            { name: 'effective_date', label: t('Effective Date'), type: 'date', required: true },
            { name: 'review_date', label: t('Review Date'), type: 'date' },
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
        title={formMode === 'create' ? t('Create New Policy') : formMode === 'edit' ? t('Edit Policy') : t('View Policy')}
        mode={formMode}
      />

      <CrudDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={currentItem?.policy_name || ''}
        entityName="policy"
      />
    </PageTemplate>
  );
}