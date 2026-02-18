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

export default function RiskAssessments() {
  const { t } = useTranslation();
  const { auth, riskAssessments, riskCategories, filters: pageFilters = {} } = usePage().props as any;
  const permissions = auth?.permissions || [];

  // State
  const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
  const [selectedCategory, setSelectedCategory] = useState(pageFilters.risk_category || 'all');
  const [selectedStatus, setSelectedStatus] = useState(pageFilters.status || 'all');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState(pageFilters.risk_level || 'all');
  const [showFilters, setShowFilters] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');

  // Check if any filters are active
  const hasActiveFilters = () => {
    return searchTerm !== '' || selectedCategory !== 'all' || selectedStatus !== 'all' || selectedRiskLevel !== 'all';
  };

  // Count active filters
  const activeFilterCount = () => {
    return (searchTerm ? 1 : 0) + (selectedCategory !== 'all' ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0) + (selectedRiskLevel !== 'all' ? 1 : 0);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const applyFilters = () => {
    router.get(route('compliance.risk-assessments.index'), {
      page: 1,
      search: searchTerm || undefined,
      risk_category: selectedCategory !== 'all' ? selectedCategory : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      risk_level: selectedRiskLevel !== 'all' ? selectedRiskLevel : undefined,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const handleSort = (field: string) => {
    const direction = pageFilters.sort_field === field && pageFilters.sort_direction === 'asc' ? 'desc' : 'asc';

    router.get(route('compliance.risk-assessments.index'), {
      sort_field: field,
      sort_direction: direction,
      page: 1,
      search: searchTerm || undefined,
      risk_category: selectedCategory !== 'all' ? selectedCategory : undefined,
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
      toast.loading(t('Creating risk assessment...'));

      router.post(route('compliance.risk-assessments.store'), formData, {
        onSuccess: (page) => {
          setIsFormModalOpen(false);
          toast.dismiss();
          if (page.props.flash.success) {
            toast.success(page.props.flash.success);
          }
        },
        onError: (errors) => {
          toast.dismiss();
          toast.error(`Failed to create risk assessment: ${Object.values(errors).join(', ')}`);
        }
      });
    } else if (formMode === 'edit') {
      toast.loading(t('Updating risk assessment...'));

      router.put(route('compliance.risk-assessments.update', currentItem.id), formData, {
        onSuccess: (page) => {
          setIsFormModalOpen(false);
          toast.dismiss();
          if (page.props.flash.success) {
            toast.success(page.props.flash.success);
          }
        },
        onError: (errors) => {
          toast.dismiss();
          toast.error(`Failed to update risk assessment: ${Object.values(errors).join(', ')}`);
        }
      });
    }
  };

  const handleDeleteConfirm = () => {
    toast.loading(t('Deleting risk assessment...'));

    router.delete(route('compliance.risk-assessments.destroy', currentItem.id), {
      onSuccess: (page) => {
        setIsDeleteModalOpen(false);
        toast.dismiss();
        if (page.props.flash.success) {
          toast.success(page.props.flash.success);
        }
      },
      onError: (errors) => {
        toast.dismiss();
        toast.error(`Failed to delete risk assessment: ${Object.values(errors).join(', ')}`);
      }
    });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSelectedRiskLevel('all');
    setShowFilters(false);

    router.get(route('compliance.risk-assessments.index'), {
      page: 1,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  // Define page actions
  const pageActions = [];

  if (hasPermission(permissions, 'create-risk-assessments')) {
    pageActions.push({
      label: t('Add Risk Assessment'),
      icon: <Plus className="h-4 w-4 mr-2" />,
      variant: 'default',
      onClick: () => handleAddNew()
    });
  }

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Compliance & Regulatory') },
    { title: t('Risk Assessments') }
  ];

  // Calculate risk score and level
  const calculateRiskScore = (probability: string, impact: string) => {
    const values = { very_low: 1, low: 2, medium: 3, high: 4, very_high: 5 };
    return (values[probability as keyof typeof values] || 3) * (values[impact as keyof typeof values] || 3);
  };

  const getRiskLevel = (score: number) => {
    if (score <= 4) return 'low';
    if (score <= 9) return 'medium';
    if (score <= 16) return 'high';
    return 'critical';
  };

  // Define table columns
  const columns = [
    {
      key: 'risk_title',
      label: t('Risk Title'),
      sortable: true
    },
    {
      key: 'risk_category',
      label: t('Category'),
      render: (value: any, row: any) => {
        const category = row.risk_category;
        return category ? (
          <span 
            className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium"
            style={{ 
              backgroundColor: `${category.color}20`, 
              color: category.color 
            }}
          >
            {category.name}
          </span>
        ) : '-';
      }
    },
    {
      key: 'probability',
      label: t('Probability'),
      render: (value: string) => value.replace('_', ' ').toUpperCase()
    },
    {
      key: 'impact',
      label: t('Impact'),
      render: (value: string) => value.replace('_', ' ').toUpperCase()
    },
    {
      key: 'risk_level',
      label: t('Risk Level'),
      render: (value: string, row: any) => {
        const score = calculateRiskScore(row.probability, row.impact);
        const level = getRiskLevel(score);
        const levelColors = {
          low: 'bg-green-50 text-green-700 ring-green-600/20',
          medium: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
          high: 'bg-orange-50 text-orange-700 ring-orange-600/20',
          critical: 'bg-red-50 text-red-700 ring-red-600/20'
        };
        return (
          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${levelColors[level as keyof typeof levelColors]}`}>
            {t(capitalize(level))} ({score})
          </span>
        );
      }
    },
    {
      key: 'status',
      label: t('Status'),
      render: (value: string) => {
        const statusColors = {
          identified: 'bg-gray-50 text-gray-700 ring-gray-600/20',
          assessed: 'bg-blue-50 text-blue-700 ring-blue-600/20',
          mitigated: 'bg-green-50 text-green-700 ring-green-600/20',
          monitored: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
          closed: 'bg-purple-50 text-purple-700 ring-purple-600/20'
        };
        return (
          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${statusColors[value as keyof typeof statusColors] || 'bg-gray-50 text-gray-700 ring-gray-600/20'}`}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </span>
        );
      }
    },
    {
      key: 'assessment_date',
      label: t('Assessment Date'),
      sortable: true,
      render: (value: string) => window.appSettings?.formatDateTime(value, false) || new Date(value).toLocaleDateString()
    }
  ];

  // Define table actions
  const actions = [
    {
      label: t('View'),
      icon: 'Eye',
      action: 'view',
      className: 'text-blue-500',
      requiredPermission: 'view-risk-assessments'
    },
    {
      label: t('Edit'),
      icon: 'Edit',
      action: 'edit',
      className: 'text-amber-500',
      requiredPermission: 'edit-risk-assessments'
    },
    {
      label: t('Delete'),
      icon: 'Trash2',
      action: 'delete',
      className: 'text-red-500',
      requiredPermission: 'delete-risk-assessments'
    }
  ];

  // Prepare options for filters and form
  const categoryOptions = [
    { value: 'all', label: t('All Categories') },
    ...(riskCategories || []).map((category: any) => ({
      value: category.id.toString(),
      label: category.name
    }))
  ];

  const statusOptions = [
    { value: 'all', label: t('All Statuses') },
    { value: 'identified', label: t('Identified') },
    { value: 'assessed', label: t('Assessed') },
    { value: 'mitigated', label: t('Mitigated') },
    { value: 'monitored', label: t('Monitored') },
    { value: 'closed', label: t('Closed') }
  ];

  const riskLevelOptions = [
    { value: 'all', label: t('All Risk Levels') },
    { value: 'low', label: t('Low') },
    { value: 'medium', label: t('Medium') },
    { value: 'high', label: t('High') },
    { value: 'critical', label: t('Critical') }
  ];

  const probabilityOptions = [
    { value: 'very_low', label: t('Very Low') },
    { value: 'low', label: t('Low') },
    { value: 'medium', label: t('Medium') },
    { value: 'high', label: t('High') },
    { value: 'very_high', label: t('Very High') }
  ];

  const impactOptions = [
    { value: 'very_low', label: t('Very Low') },
    { value: 'low', label: t('Low') },
    { value: 'medium', label: t('Medium') },
    { value: 'high', label: t('High') },
    { value: 'very_high', label: t('Very High') }
  ];

  return (
    <PageTemplate
      title={t("Risk Assessments")}
      url="/compliance/risk-assessments"
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
              name: 'risk_category',
              label: t('Category'),
              type: 'select',
              value: selectedCategory,
              onChange: setSelectedCategory,
              options: categoryOptions
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
            router.get(route('compliance.risk-assessments.index'), {
              page: 1,
              per_page: parseInt(value),
              search: searchTerm || undefined,
              risk_category: selectedCategory !== 'all' ? selectedCategory : undefined,
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
          data={riskAssessments?.data || []}
          from={riskAssessments?.from || 1}
          onAction={handleAction}
          sortField={pageFilters.sort_field}
          sortDirection={pageFilters.sort_direction}
          onSort={handleSort}
          permissions={permissions}
          entityPermissions={{
            view: 'view-risk-assessments',
            create: 'create-risk-assessments',
            edit: 'edit-risk-assessments',
            delete: 'delete-risk-assessments'
          }}
        />

        {/* Pagination section */}
        <Pagination
          from={riskAssessments?.from || 0}
          to={riskAssessments?.to || 0}
          total={riskAssessments?.total || 0}
          links={riskAssessments?.links}
          entityName={t("risk assessments")}
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
            { name: 'risk_title', label: t('Risk Title'), type: 'text', required: true },
            {
              name: 'risk_category_id',
              label: t('Risk Category'),
              type: 'select',
              required: true,
              options: riskCategories ? riskCategories.map((category: any) => ({
                value: category.id.toString(),
                label: category.name
              })) : []
            },
            { name: 'description', label: t('Description'), type: 'textarea', required: true },
            {
              name: 'probability',
              label: t('Probability'),
              type: 'select',
              required: true,
              options: probabilityOptions
            },
            {
              name: 'impact',
              label: t('Impact'),
              type: 'select',
              required: true,
              options: impactOptions
            },
            { name: 'mitigation_plan', label: t('Mitigation Plan'), type: 'textarea' },
            { name: 'control_measures', label: t('Control Measures'), type: 'textarea' },
            { name: 'assessment_date', label: t('Assessment Date'), type: 'date', required: true },
            { name: 'review_date', label: t('Review Date'), type: 'date' },
            {
              name: 'status',
              label: t('Status'),
              type: 'select',
              options: statusOptions.slice(1), // Remove 'All Statuses' option
              defaultValue: 'identified'
            },
            { name: 'responsible_person', label: t('Responsible Person'), type: 'text' }
          ],
          modalSize: 'xl'
        }}
        initialData={currentItem}
        title={
          formMode === 'create'
            ? t('Add New Risk Assessment')
            : t('Edit Risk Assessment')
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
            { name: 'risk_title', label: t('Risk Title'), type: 'text' },
            {
              name: 'risk_category',
              label: t('Risk Category'),
              type: 'text',
              render: () => {
                const category = currentItem?.risk_category;
                return <div className="rounded-md border bg-gray-50 p-2">
                  {category ? (
                    <span 
                      className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium"
                      style={{ 
                        backgroundColor: `${category.color}20`, 
                        color: category.color 
                      }}
                    >
                      {category.name}
                    </span>
                  ) : '-'}
                </div>;
              }
            },
            { name: 'description', label: t('Description'), type: 'textarea' },
            {
              name: 'probability',
              label: t('Probability'),
              type: 'text',
              render: () => {
                return <div className="rounded-md border bg-gray-50 p-2">
                  {t(capitalize(currentItem?.probability))}
                </div>;
              }
            },
            {
              name: 'impact',
              label: t('Impact'),
              type: 'text',
              render: () => {
                return <div className="rounded-md border bg-gray-50 p-2">
                  {t(capitalize(currentItem?.impact))}
                </div>;
              }
            },
            {
              name: 'risk_level',
              label: t('Risk Level'),
              type: 'text',
              render: () => {
                const score = calculateRiskScore(currentItem?.probability, currentItem?.impact);
                const level = getRiskLevel(score);
                return <div className="rounded-md border bg-gray-50 p-2">
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium`}>
                    {t(capitalize(level))} (Score: {score})
                  </span>
                </div>;
              }
            },
            { name: 'mitigation_plan', label: t('Mitigation Plan'), type: 'textarea' },
            { name: 'control_measures', label: t('Control Measures'), type: 'textarea' },
            { name: 'assessment_date', label: t('Assessment Date'), type: 'text' },
            { name: 'review_date', label: t('Review Date'), type: 'text' },
            {
              name: 'status',
              label: t('Status'),
              type: 'text',
              render: () => {
                const status = currentItem?.status;
                return <div className="rounded-md border bg-gray-50 p-2">
                  {status?.charAt(0).toUpperCase() + status?.slice(1)}
                </div>;
              }
            },
            { name: 'responsible_person', label: t('Responsible Person'), type: 'text' },
            { name: 'created_at', label: t('Created At'), type: 'text' },
            { name: 'updated_at', label: t('Updated At'), type: 'text' }
          ],
          modalSize: 'xl'
        }}
        initialData={currentItem}
        title={t('View Risk Assessment')}
        mode="view"
      />

      {/* Delete Modal */}
      <CrudDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={currentItem?.risk_title || ''}
        entityName="risk assessment"
      />
    </PageTemplate>
  );
}