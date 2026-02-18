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

export default function ComplianceAudits() {
  const { t } = useTranslation();
  const { auth, audits, auditTypes, filters: pageFilters = {} } = usePage().props as any;
  const permissions = auth?.permissions || [];

  // State
  const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
  const [selectedType, setSelectedType] = useState(pageFilters.audit_type_id || 'all');
  const [selectedStatus, setSelectedStatus] = useState(pageFilters.status || 'all');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState(pageFilters.risk_level || 'all');
  const [showFilters, setShowFilters] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');

  // Check if any filters are active
  const hasActiveFilters = () => {
    return searchTerm !== '' || selectedType !== 'all' || selectedStatus !== 'all' || selectedRiskLevel !== 'all';
  };

  // Count active filters
  const activeFilterCount = () => {
    return (searchTerm ? 1 : 0) + (selectedType !== 'all' ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0) + (selectedRiskLevel !== 'all' ? 1 : 0);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const applyFilters = () => {
    router.get(route('compliance.audits.index'), {
      page: 1,
      search: searchTerm || undefined,
      audit_type_id: selectedType !== 'all' ? selectedType : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      risk_level: selectedRiskLevel !== 'all' ? selectedRiskLevel : undefined,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const handleSort = (field: string) => {
    const direction = pageFilters.sort_field === field && pageFilters.sort_direction === 'asc' ? 'desc' : 'asc';

    router.get(route('compliance.audits.index'), {
      sort_field: field,
      sort_direction: direction,
      page: 1,
      search: searchTerm || undefined,
      audit_type_id: selectedType !== 'all' ? selectedType : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      risk_level: selectedRiskLevel !== 'all' ? selectedRiskLevel : undefined,
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
    }
  };

  const handleAddNew = () => {
    setCurrentItem(null);
    setFormMode('create');
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = (formData: any) => {
    if (formMode === 'create') {
      toast.loading(t('Creating audit...'));

      router.post(route('compliance.audits.store'), formData, {
        onSuccess: (page) => {
          setIsFormModalOpen(false);
          toast.dismiss();
          if (page.props.flash.success) {
            toast.success(page.props.flash.success);
          }
        },
        onError: (errors) => {
          toast.dismiss();
          toast.error(`Failed to create audit: ${Object.values(errors).join(', ')}`);
        }
      });
    } else if (formMode === 'edit') {
      toast.loading(t('Updating audit...'));

      router.put(route('compliance.audits.update', currentItem.id), formData, {
        onSuccess: (page) => {
          setIsFormModalOpen(false);
          toast.dismiss();
          if (page.props.flash.success) {
            toast.success(page.props.flash.success);
          }
        },
        onError: (errors) => {
          toast.dismiss();
          toast.error(`Failed to update audit: ${Object.values(errors).join(', ')}`);
        }
      });
    }
  };

  const handleDeleteConfirm = () => {
    toast.loading(t('Deleting audit...'));

    router.delete(route('compliance.audits.destroy', currentItem.id), {
      onSuccess: (page) => {
        setIsDeleteModalOpen(false);
        toast.dismiss();
        if (page.props.flash.success) {
          toast.success(page.props.flash.success);
        }
      },
      onError: (errors) => {
        toast.dismiss();
        toast.error(`Failed to delete audit: ${Object.values(errors).join(', ')}`);
      }
    });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedStatus('all');
    setSelectedRiskLevel('all');
    setShowFilters(false);

    router.get(route('compliance.audits.index'), {
      page: 1,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  // Define page actions
  const pageActions = [];

  if (hasPermission(permissions, 'create-compliance-audits')) {
    pageActions.push({
      label: t('Add Audit'),
      icon: <Plus className="h-4 w-4 mr-2" />,
      variant: 'default',
      onClick: () => handleAddNew()
    });
  }

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Compliance & Regulatory') },
    { title: t('Audits') }
  ];

  // Define table columns
  const columns = [
    {
      key: 'audit_title',
      label: t('Audit Title'),
      sortable: true
    },
    {
      key: 'audit_type',
      label: t('Type'),
      render: (value: any, row: any) => {
        const auditType = row.audit_type;
        if (!auditType) return '-';
        return (
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: auditType.color }}
            />
            <span className="text-sm font-medium">{auditType.name}</span>
          </div>
        );
      }
    },
    {
      key: 'status',
      label: t('Status'),
      render: (value: string) => {
        const statusColors = {
          planned: 'bg-gray-50 text-gray-700 ring-gray-600/20',
          in_progress: 'bg-blue-50 text-blue-700 ring-blue-600/20',
          completed: 'bg-green-50 text-green-700 ring-green-600/20',
          cancelled: 'bg-red-50 text-red-700 ring-red-600/20'
        };
        return (
          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${statusColors[value as keyof typeof statusColors] || 'bg-gray-50 text-gray-700 ring-gray-600/20'}`}>
            {t(capitalize(value))}
          </span>
        );
      }
    },
    {
      key: 'risk_level',
      label: t('Risk Level'),
      render: (value: string) => {
        const levelColors = {
          low: 'bg-green-50 text-green-700 ring-green-600/20',
          medium: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
          high: 'bg-orange-50 text-orange-700 ring-orange-600/20',
          critical: 'bg-red-50 text-red-700 ring-red-600/20'
        };
        return (
          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${levelColors[value as keyof typeof levelColors]}`}>
            {t(capitalize(value))}
          </span>
        );
      }
    },
    {
      key: 'auditor_name',
      label: t('Auditor'),
      render: (value: string, row: any) => {
        return value ? `${value}${row.auditor_organization ? ` (${row.auditor_organization})` : ''}` : '-';
      }
    },
    {
      key: 'audit_date',
      label: t('Audit Date'),
      sortable: true,
      render: (value: string) => window.appSettings?.formatDateTime(value, false) || new Date(value).toLocaleDateString()
    },
    {
      key: 'completion_date',
      label: t('Completion'),
      render: (value: string) => value ? (window.appSettings?.formatDateTime(value, false) || new Date(value).toLocaleDateString()) : '-'
    }
  ];

  // Define table actions
  const actions = [
    {
      label: t('View'),
      icon: 'Eye',
      action: 'view',
      className: 'text-blue-500',
      requiredPermission: 'view-compliance-audits'
    },
    {
      label: t('Edit'),
      icon: 'Edit',
      action: 'edit',
      className: 'text-amber-500',
      requiredPermission: 'edit-compliance-audits'
    },
    {
      label: t('Delete'),
      icon: 'Trash2',
      action: 'delete',
      className: 'text-red-500',
      requiredPermission: 'delete-compliance-audits'
    }
  ];

  // Prepare options for filters and form
  const typeOptions = [
    { value: 'all', label: t('All Types') },
    ...(auditTypes || []).map((type: any) => ({
      value: type.id.toString(),
      label: type.name
    }))
  ];

  const statusOptions = [
    { value: 'all', label: t('All Statuses') },
    { value: 'planned', label: t('Planned') },
    { value: 'in_progress', label: t('In Progress') },
    { value: 'completed', label: t('Completed') },
    { value: 'cancelled', label: t('Cancelled') }
  ];

  const riskLevelOptions = [
    { value: 'all', label: t('All Risk Levels') },
    { value: 'low', label: t('Low') },
    { value: 'medium', label: t('Medium') },
    { value: 'high', label: t('High') },
    { value: 'critical', label: t('Critical') }
  ];

  return (
    <PageTemplate
      title={t("Compliance Audits")}
      url="/compliance/audits"
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
              name: 'audit_type_id',
              label: t('Type'),
              type: 'select',
              value: selectedType,
              onChange: setSelectedType,
              options: typeOptions
            },
            {
              name: 'status',
              label: t('Status'),
              type: 'select',
              value: selectedStatus,
              onChange: setSelectedStatus,
              options: statusOptions
            },
            {
              name: 'risk_level',
              label: t('Risk Level'),
              type: 'select',
              value: selectedRiskLevel,
              onChange: setSelectedRiskLevel,
              options: riskLevelOptions
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
            router.get(route('compliance.audits.index'), {
              page: 1,
              per_page: parseInt(value),
              search: searchTerm || undefined,
              audit_type_id: selectedType !== 'all' ? selectedType : undefined,
              status: selectedStatus !== 'all' ? selectedStatus : undefined,
              risk_level: selectedRiskLevel !== 'all' ? selectedRiskLevel : undefined
            }, { preserveState: true, preserveScroll: true });
          }}
        />
      </div>

      {/* Content section */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        <CrudTable
          columns={columns}
          actions={actions}
          data={audits?.data || []}
          from={audits?.from || 1}
          onAction={handleAction}
          sortField={pageFilters.sort_field}
          sortDirection={pageFilters.sort_direction}
          onSort={handleSort}
          permissions={permissions}
          entityPermissions={{
            view: 'view-compliance-audits',
            create: 'create-compliance-audits',
            edit: 'edit-compliance-audits',
            delete: 'delete-compliance-audits'
          }}
        />

        {/* Pagination section */}
        <Pagination
          from={audits?.from || 0}
          to={audits?.to || 0}
          total={audits?.total || 0}
          links={audits?.links}
          entityName={t("audits")}
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
            { name: 'audit_title', label: t('Audit Title'), type: 'text', required: true },
            {
              name: 'audit_type_id',
              label: t('Audit Type'),
              type: 'select',
              required: true,
              options: typeOptions.slice(1) // Remove 'All Types' option
            },
            { name: 'description', label: t('Description'), type: 'textarea', required: true },
            { name: 'audit_date', label: t('Audit Date'), type: 'date', required: true },
            { name: 'completion_date', label: t('Completion Date'), type: 'date' },
            {
              name: 'status',
              label: t('Status'),
              type: 'select',
              options: statusOptions.slice(1), // Remove 'All Statuses' option
              defaultValue: 'planned'
            },
            { name: 'scope', label: t('Scope'), type: 'textarea' },
            { name: 'findings', label: t('Findings'), type: 'textarea' },
            { name: 'recommendations', label: t('Recommendations'), type: 'textarea' },
            {
              name: 'risk_level',
              label: t('Risk Level'),
              type: 'select',
              options: riskLevelOptions.slice(1), // Remove 'All Risk Levels' option
              defaultValue: 'medium'
            },
            { name: 'auditor_name', label: t('Auditor Name'), type: 'text' },
            { name: 'auditor_organization', label: t('Auditor Organization'), type: 'text' },
            { name: 'corrective_actions', label: t('Corrective Actions'), type: 'textarea' },
            { name: 'follow_up_date', label: t('Follow-up Date'), type: 'date' }
          ],
          modalSize: 'xl'
        }}
        initialData={currentItem}
        title={
          formMode === 'create'
            ? t('Add New Audit')
            : formMode === 'edit'
              ? t('Edit Audit')
              : t('View Audit')
        }
        mode={formMode}
      />

      {/* Delete Modal */}
      <CrudDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={currentItem?.audit_title || ''}
        entityName="audit"
      />
    </PageTemplate>
  );
}