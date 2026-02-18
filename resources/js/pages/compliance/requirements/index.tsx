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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { capitalize } from '@/utils/helpers';

export default function ComplianceRequirements() {
  const { t } = useTranslation();
  const { auth, requirements, categories, frequencies, filters: pageFilters = {} } = usePage().props as any;
  const permissions = auth?.permissions || [];

  // State
  const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
  const [selectedCategory, setSelectedCategory] = useState(pageFilters.category_id || 'all');
  const [selectedStatus, setSelectedStatus] = useState(pageFilters.status || 'all');
  const [selectedPriority, setSelectedPriority] = useState(pageFilters.priority || 'all');
  const [showFilters, setShowFilters] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const applyFilters = () => {
    router.get(route('compliance.requirements.index'), {
      page: 1,
      search: searchTerm || undefined,
      category_id: selectedCategory !== 'all' ? selectedCategory : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      priority: selectedPriority !== 'all' ? selectedPriority : undefined,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const handleSort = (field: string) => {
    const direction = pageFilters.sort_field === field && pageFilters.sort_direction === 'asc' ? 'desc' : 'asc';

    router.get(route('compliance.requirements.index'), {
      sort_field: field,
      sort_direction: direction,
      page: 1,
      search: searchTerm || undefined,
      category_id: selectedCategory !== 'all' ? selectedCategory : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      priority: selectedPriority !== 'all' ? selectedPriority : undefined,
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
        setIsStatusModalOpen(true);
        break;
    }
  };

  const handleAddNew = () => {
    setCurrentItem(null);
    setFormMode('create');
    setIsFormModalOpen(true);
  };

  const handleStatusChange = (newStatus: string) => {
    router.put(route('compliance.requirements.toggle-status', currentItem.id), { status: newStatus }, {
      onSuccess: (page) => {
        setIsStatusModalOpen(false);
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
      router.post(route('compliance.requirements.store'), formData, {
        onSuccess: (page) => {
          setIsFormModalOpen(false);
          if (page.props.flash.success) {
            toast.success(page.props.flash.success);
          }
        },
        onError: (errors) => {
          toast.error('Failed to create requirement');
        }
      });
    } else if (formMode === 'edit') {
      router.put(route('compliance.requirements.update', currentItem.id), formData, {
        onSuccess: (page) => {
          setIsFormModalOpen(false);
          if (page.props.flash.success) {
            toast.success(page.props.flash.success);
          }
        },
        onError: (errors) => {
          toast.error('Failed to update requirement');
        }
      });
    }
  };

  const handleDeleteConfirm = () => {
    router.delete(route('compliance.requirements.destroy', currentItem.id), {
      onSuccess: (page) => {
        setIsDeleteModalOpen(false);
        if (page.props.flash.success) {
          toast.success(page.props.flash.success);
        }
      },
      onError: (errors) => {
        toast.error('Failed to delete requirement');
      }
    });
  };

  const pageActions = [];
  if (hasPermission(permissions, 'create-compliance-requirements')) {
    pageActions.push({
      label: t('Add Requirement'),
      icon: <Plus className="h-4 w-4 mr-2" />,
      variant: 'default',
      onClick: () => handleAddNew()
    });
  }

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Compliance & Regulatory'), href: route('compliance.requirements.index') },
    { title: t('Requirements') }
  ];

  const columns = [
    {
      key: 'compliance_id',
      label: t('ID'),
      sortable: true
    },
    {
      key: 'title',
      label: t('Title'),
      sortable: true
    },
    {
      key: 'category',
      label: t('Category'),
      render: (value: any, row: any) => {
        const category = row.category;
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
      key: 'regulatory_body',
      label: t('Regulatory Body'),
      sortable: true
    },
    {
      key: 'deadline',
      label: t('Deadline'),
      sortable: true,
      render: (value: string) => value ? (window.appSettings?.formatDate(value) || new Date(value).toLocaleDateString()) : '-'
    },
    {
      key: 'status',
      label: t('Status'),
      render: (value: string) => {
        const statusColors = {
          pending: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
          in_progress: 'bg-blue-50 text-blue-700 ring-blue-600/20',
          compliant: 'bg-green-50 text-green-700 ring-green-600/20',
          non_compliant: 'bg-red-50 text-red-700 ring-red-600/20',
          overdue: 'bg-red-50 text-red-700 ring-red-600/20'
        };
        return (
          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${statusColors[value as keyof typeof statusColors] || 'bg-gray-50 text-gray-700 ring-gray-600/20'}`}>
            {t(capitalize(value))}
          </span>
        );
      }
    },
    {
      key: 'priority',
      label: t('Priority'),
      render: (value: string) => {
        const priorityColors = {
          low: 'bg-green-50 text-green-700 ring-green-600/20',
          medium: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
          high: 'bg-orange-50 text-orange-700 ring-orange-600/20',
          critical: 'bg-red-50 text-red-700 ring-red-600/20'
        };
        return (
          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${priorityColors[value as keyof typeof priorityColors] || 'bg-gray-50 text-gray-700 ring-gray-600/20'}`}>
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
      requiredPermission: 'view-compliance-requirements'
    },
    {
      label: t('Edit'),
      icon: 'Edit',
      action: 'edit',
      className: 'text-amber-500',
      requiredPermission: 'edit-compliance-requirements'
    },
    {
      label: t('Toggle Status'),
      icon: 'ToggleLeft',
      action: 'toggle-status',
      className: 'text-green-500',
      requiredPermission: 'toggle-status-compliance-requirements'
    },
    {
      label: t('Delete'),
      icon: 'Trash2',
      action: 'delete',
      className: 'text-red-500',
      requiredPermission: 'delete-compliance-requirements'
    }
  ];

  const categoryOptions = [
    { value: 'all', label: t('All Categories') },
    ...(categories || []).map((category: any) => ({
      value: category.id.toString(),
      label: category.name
    }))
  ];

  const statusOptions = [
    { value: 'all', label: t('All Statuses') },
    { value: 'pending', label: t('Pending') },
    { value: 'in_progress', label: t('In Progress') },
    { value: 'compliant', label: t('Compliant') },
    { value: 'non_compliant', label: t('Non Compliant') },
    { value: 'overdue', label: t('Overdue') }
  ];

  const priorityOptions = [
    { value: 'all', label: t('All Priorities') },
    { value: 'low', label: t('Low') },
    { value: 'medium', label: t('Medium') },
    { value: 'high', label: t('High') },
    { value: 'critical', label: t('Critical') }
  ];

  return (
    <PageTemplate
      title={t("Compliance Requirements")}
      url="/compliance/requirements"
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
              name: 'category_id',
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
              name: 'priority',
              label: t('Priority'),
              type: 'select',
              value: selectedPriority,
              onChange: setSelectedPriority,
              options: priorityOptions
            }
          ]}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          hasActiveFilters={() => searchTerm !== '' || selectedCategory !== 'all' || selectedStatus !== 'all' || selectedPriority !== 'all'}
          activeFilterCount={() => (searchTerm ? 1 : 0) + (selectedCategory !== 'all' ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0) + (selectedPriority !== 'all' ? 1 : 0)}
          onResetFilters={() => {
            setSearchTerm('');
            setSelectedCategory('all');
            setSelectedStatus('all');
            setSelectedPriority('all');
            setShowFilters(false);
            router.get(route('compliance.requirements.index'), { page: 1, per_page: pageFilters.per_page });
          }}
          onApplyFilters={applyFilters}
          currentPerPage={pageFilters.per_page?.toString() || "10"}
          onPerPageChange={(value) => {
            router.get(route('compliance.requirements.index'), {
              page: 1,
              per_page: parseInt(value),
              search: searchTerm || undefined,
              category_id: selectedCategory !== 'all' ? selectedCategory : undefined,
              status: selectedStatus !== 'all' ? selectedStatus : undefined,
              priority: selectedPriority !== 'all' ? selectedPriority : undefined
            });
          }}
        />
      </div>

      {/* Content section */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        <CrudTable
          columns={columns}
          actions={actions}
          data={requirements?.data || []}
          from={requirements?.from || 1}
          onAction={handleAction}
          sortField={pageFilters.sort_field}
          sortDirection={pageFilters.sort_direction}
          onSort={handleSort}
          permissions={permissions}
          entityPermissions={{
            view: 'view-compliance-requirements',
            create: 'create-compliance-requirements',
            edit: 'edit-compliance-requirements',
            delete: 'delete-compliance-requirements'
          }}
        />

        <Pagination
          from={requirements?.from || 0}
          to={requirements?.to || 0}
          total={requirements?.total || 0}
          links={requirements?.links}
          entityName={t("requirements")}
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
            { name: 'title', label: t('Title'), type: 'text', required: true },
            { name: 'description', label: t('Description'), type: 'textarea', required: true },
            { name: 'regulatory_body', label: t('Regulatory Body'), type: 'text', required: true },
            {
              name: 'category_id',
              label: t('Category'),
              type: 'select',
              required: true,
              options: categories ? categories.map((cat: any) => ({
                value: cat.id.toString(),
                label: cat.name
              })) : []
            },
            {
              name: 'frequency_id',
              label: t('Frequency'),
              type: 'select',
              required: true,
              options: frequencies ? frequencies.map((freq: any) => ({
                value: freq.id.toString(),
                label: freq.name
              })) : []
            },
            { name: 'jurisdiction', label: t('Jurisdiction'), type: 'text' },
            { name: 'scope', label: t('Scope'), type: 'textarea' },
            { name: 'effective_date', label: t('Effective Date'), type: 'date' },
            { name: 'deadline', label: t('Deadline'), type: 'date' },
            { name: 'responsible_party', label: t('Responsible Party'), type: 'text' },
            { name: 'evidence_requirements', label: t('Evidence Requirements'), type: 'textarea' },
            { name: 'penalty_implications', label: t('Penalty Implications'), type: 'textarea' },
            { name: 'monitoring_procedures', label: t('Monitoring Procedures'), type: 'textarea' },
            {
              name: 'status',
              label: t('Status'),
              type: 'select',
              options: [
                { value: 'pending', label: t('Pending') },
                { value: 'in_progress', label: t('In Progress') },
                { value: 'compliant', label: t('Compliant') },
                { value: 'non_compliant', label: t('Non Compliant') },
                { value: 'overdue', label: t('Overdue') }
              ],
              defaultValue: 'pending'
            },
            {
              name: 'priority',
              label: t('Priority'),
              type: 'select',
              options: [
                { value: 'low', label: t('Low') },
                { value: 'medium', label: t('Medium') },
                { value: 'high', label: t('High') },
                { value: 'critical', label: t('Critical') }
              ],
              defaultValue: 'medium'
            }
          ],
          modalSize: 'xl'
        }}
        initialData={currentItem}
        title={
          formMode === 'create'
            ? t('Add Compliance Requirement')
            : formMode === 'edit'
              ? t('Edit Compliance Requirement')
              : t('View Compliance Requirement')
        }
        mode={formMode}
      />

      {/* Delete Modal */}
      <CrudDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={currentItem?.title || ''}
        entityName="compliance requirement"
      />

      {/* Status Change Modal */}
      <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('Change Status')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('Select new status for')}: <strong>{currentItem?.title}</strong>
            </p>
            <div className="grid grid-cols-1 gap-2">
              {statusOptions.slice(1).map((option) => (
                <Button
                  key={option.value}
                  variant={currentItem?.status === option.value ? "default" : "outline"}
                  className="justify-start"
                  onClick={() => handleStatusChange(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
}