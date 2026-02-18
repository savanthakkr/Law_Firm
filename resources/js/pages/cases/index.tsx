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
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';

export default function Cases() {
  const { t } = useTranslation();
  const { auth, cases, caseTypes, caseStatuses, clients, courts, planLimits, filters: pageFilters = {} } = usePage().props as any;
  const permissions = auth?.permissions || [];

  const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
  const [selectedCaseType, setSelectedCaseType] = useState(pageFilters.case_type_id || 'all');
  const [selectedCaseStatus, setSelectedCaseStatus] = useState(pageFilters.case_status_id || 'all');
  const [selectedPriority, setSelectedPriority] = useState(pageFilters.priority || 'all');
  const [selectedStatus, setSelectedStatus] = useState(pageFilters.status || 'all');
  const [selectedCourt, setSelectedCourt] = useState(pageFilters.court_id || 'all');
  const [showFilters, setShowFilters] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');

  const hasActiveFilters = () => {
    return searchTerm !== '' || selectedCaseType !== 'all' || selectedCaseStatus !== 'all' ||
      selectedPriority !== 'all' || selectedStatus !== 'all' || selectedCourt !== 'all';
  };

  const activeFilterCount = () => {
    return (searchTerm ? 1 : 0) + (selectedCaseType !== 'all' ? 1 : 0) +
      (selectedCaseStatus !== 'all' ? 1 : 0) + (selectedPriority !== 'all' ? 1 : 0) +
      (selectedStatus !== 'all' ? 1 : 0) + (selectedCourt !== 'all' ? 1 : 0);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const applyFilters = () => {
    router.get(route('cases.index'), {
      page: 1,
      search: searchTerm || undefined,
      case_type_id: selectedCaseType !== 'all' ? selectedCaseType : undefined,
      case_status_id: selectedCaseStatus !== 'all' ? selectedCaseStatus : undefined,
      priority: selectedPriority !== 'all' ? selectedPriority : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      court_id: selectedCourt !== 'all' ? selectedCourt : undefined,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const handleSort = (field: string) => {
    const direction = pageFilters.sort_field === field && pageFilters.sort_direction === 'asc' ? 'desc' : 'asc';

    router.get(route('cases.index'), {
      sort_field: field,
      sort_direction: direction,
      page: 1,
      search: searchTerm || undefined,
      case_type_id: selectedCaseType !== 'all' ? selectedCaseType : undefined,
      case_status_id: selectedCaseStatus !== 'all' ? selectedCaseStatus : undefined,
      priority: selectedPriority !== 'all' ? selectedPriority : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      court_id: selectedCourt !== 'all' ? selectedCourt : undefined,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const handleAction = (action: string, item: any) => {
    setCurrentItem(item);

    switch (action) {
      case 'view':
        router.get(route('cases.show', item.id));
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
      toast.loading(t('Creating case...'));

      router.post(route('cases.store'), formData, {
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
            toast.error(`Failed to create case: ${Object.values(errors).join(', ')}`);
          }
        }
      });
    } else if (formMode === 'edit') {
      toast.loading(t('Updating case...'));

      router.put(route('cases.update', currentItem.id), formData, {
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
            toast.error(`Failed to update case: ${Object.values(errors).join(', ')}`);
          }
        }
      });
    }
  };

  const handleDeleteConfirm = () => {
    toast.loading(t('Deleting case...'));

    router.delete(route('cases.destroy', currentItem.id), {
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
          toast.error(`Failed to delete case: ${Object.values(errors).join(', ')}`);
        }
      }
    });
  };

  const handleToggleStatus = (caseItem: any) => {
    const newStatus = caseItem.status === 'active' ? 'inactive' : 'active';
    toast.loading(`${newStatus === 'active' ? t('Activating') : t('Deactivating')} case...`);

    router.put(route('cases.toggle-status', caseItem.id), {}, {
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
          toast.error(`Failed to update case status: ${Object.values(errors).join(', ')}`);
        }
      }
    });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCaseType('all');
    setSelectedCaseStatus('all');
    setSelectedPriority('all');
    setSelectedStatus('all');
    setSelectedCourt('all');
    setShowFilters(false);

    router.get(route('cases.index'), {
      page: 1,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const pageActions = [];

  if (hasPermission(permissions, 'create-cases')) {
    const canCreate = !planLimits || planLimits.can_create;
    pageActions.push({
      label: planLimits && !canCreate ? t('Case Limit Reached ({{current}}/{{max}})', { current: planLimits.current_cases, max: planLimits.max_cases }) : t('Add Case'),
      icon: <Plus className="h-4 w-4 mr-2" />,
      variant: canCreate ? 'default' : 'outline',
      onClick: canCreate ? () => handleAddNew() : () => toast.error(t('Case limit exceeded. Your plan allows maximum {{max}} cases. Please upgrade your plan.', { max: planLimits.max_cases })),
      disabled: !canCreate
    });
  }

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Case Management'), href: route('cases.index') },
    { title: t('Cases') }
  ];

  const columns = [
    {
      key: 'case_id',
      label: t('Case ID'),
      sortable: true
    },
    {
      key: 'title',
      label: t('Title'),
      sortable: true
    },
    {
      key: 'client',
      label: t('Client'),
      render: (value: any, row: any) => row.client?.name || '-'
    },
    {
      key: 'case_type',
      label: t('Type'),
      render: (value: any, row: any) => (
        <span
          className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium"
          style={{
            backgroundColor: `${row.case_type?.color}20`,
            color: row.case_type?.color
          }}
        >
          {row.case_type?.name || '-'}
        </span>
      )
    },
    {
      key: 'case_status',
      label: t('Status'),
      render: (value: any, row: any) => (
        <span
          className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium"
          style={{
            backgroundColor: `${row.case_status?.color}20`,
            color: row.case_status?.color
          }}
        >
          {row.case_status?.name || '-'}
        </span>
      )
    },
    {
      key: 'priority',
      label: t('Priority'),
      render: (value: string) => {
        const colors = {
          low: 'bg-green-50 text-green-700 ring-green-600/20',
          medium: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
          high: 'bg-red-50 text-red-700 ring-red-600/20'
        };
        return (
          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${colors[value as keyof typeof colors] || colors.medium}`}>
            {value ? t(value.charAt(0).toUpperCase() + value.slice(1)) : '-'}
          </span>
        );
      }
    },
    {
      key: 'filing_date',
      label: t('Filing Date'),
      sortable: true,
      render: (value: string) => value ? new Date(value).toLocaleDateString() : '-'
    },
    {
      key: 'status',
      label: t('Active Status'),
      render: (value: string) => (
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${value === 'active'
          ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
          : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
          }`}>
          {value === 'active' ? t('Active') : t('Inactive')}
        </span>
      )
    }
  ];

  const actions = [
    {
      label: t('View'),
      icon: 'Eye',
      action: 'view',
      className: 'text-blue-500',
      requiredPermission: 'view-cases'
    },
    {
      label: t('Edit'),
      icon: 'Edit',
      action: 'edit',
      className: 'text-amber-500',
      requiredPermission: 'edit-cases'
    },
    {
      label: t('Toggle Status'),
      icon: 'Lock',
      action: 'toggle-status',
      className: 'text-amber-500',
      requiredPermission: 'edit-cases'
    },
    {
      label: t('Delete'),
      icon: 'Trash2',
      action: 'delete',
      className: 'text-red-500',
      requiredPermission: 'delete-cases'
    }
  ];


  return (
    <PageTemplate
      title={t("Case Management")}
      url="/cases"
      actions={pageActions}
      breadcrumbs={breadcrumbs}
      noPadding
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow mb-4 p-4">
        <SearchAndFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearch={handleSearch}
          filters={[
            {
              name: 'case_type_id',
              label: t('Case Type'),
              type: 'select',
              value: selectedCaseType,
              onChange: setSelectedCaseType,
              options: [
                { value: 'all', label: t('All Types') },
                ...(caseTypes || []).map((type: any) => ({
                  value: type.id.toString(),
                  label: type.name
                }))
              ]
            },
            {
              name: 'case_status_id',
              label: t('Case Status'),
              type: 'select',
              value: selectedCaseStatus,
              onChange: setSelectedCaseStatus,
              options: [
                { value: 'all', label: t('All Statuses') },
                ...(caseStatuses || []).map((status: any) => ({
                  value: status.id.toString(),
                  label: status.name
                }))
              ]
            },
            {
              name: 'priority',
              label: t('Priority'),
              type: 'select',
              value: selectedPriority,
              onChange: setSelectedPriority,
              options: [
                { value: 'all', label: t('All Priorities') },
                { value: 'low', label: t('Low') },
                { value: 'medium', label: t('Medium') },
                { value: 'high', label: t('High') }
              ]
            },
            {
              name: 'status',
              label: t('Status'),
              type: 'select',
              value: selectedStatus,
              onChange: setSelectedStatus,
              options: [
                { value: 'all', label: t('All Statuses') },
                { value: 'active', label: t('Active') },
                { value: 'inactive', label: t('Inactive') }
              ]
            },
            {
              name: 'court_id',
              label: t('Court'),
              type: 'select',
              value: selectedCourt,
              onChange: setSelectedCourt,
              options: [
                { value: 'all', label: t('All Courts') },
                ...(courts || []).map((court: any) => ({
                  value: court.id.toString(),
                  label: court.name,
                  key: `filter-court-${court.id}`
                }))
              ]
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
            router.get(route('cases.index'), {
              page: 1,
              per_page: parseInt(value),
              search: searchTerm || undefined,
              case_type_id: selectedCaseType !== 'all' ? selectedCaseType : undefined,
              case_status_id: selectedCaseStatus !== 'all' ? selectedCaseStatus : undefined,
              priority: selectedPriority !== 'all' ? selectedPriority : undefined,
              status: selectedStatus !== 'all' ? selectedStatus : undefined,
              court_id: selectedCourt !== 'all' ? selectedCourt : undefined
            }, { preserveState: true, preserveScroll: true });
          }}
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        <CrudTable
          columns={columns}
          actions={actions}
          data={cases?.data || []}
          from={cases?.from || 1}
          onAction={handleAction}
          sortField={pageFilters.sort_field}
          sortDirection={pageFilters.sort_direction}
          onSort={handleSort}
          permissions={permissions}
          entityPermissions={{
            view: 'view-cases',
            create: 'create-cases',
            edit: 'edit-cases',
            delete: 'delete-cases'
          }}
        />

        <Pagination
          from={cases?.from || 0}
          to={cases?.to || 0}
          total={cases?.total || 0}
          links={cases?.links}
          entityName={t("cases")}
          onPageChange={(url) => router.get(url)}
        />
      </div>

      <CrudFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        formConfig={{
          fields: [
            { name: 'title', label: t('Case Title'), type: 'text', required: true },
            { name: 'description', label: t('Description'), type: 'textarea' },
            {
              name: 'client_id',
              label: t('Client'),
              type: 'select',
              required: true,
              options: clients ? [
                ...clients.map((client: any) => ({
                  value: client.id.toString(),
                  label: client.name
                })),
              ] : [],
              addonRight: (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    localStorage.setItem('OPEN_CLIENT_CREATE_MODAL', '1');
                    window.open(route('clients.index'), '_blank');
                  }}
                >
                  + {t('Add Client')}
                </Button>
              )
            },
            {
              name: 'case_type_id',
              label: t('Case Type'),
              type: 'select',
              required: true,
              options: caseTypes ? caseTypes.map((type: any) => ({
                value: type.id.toString(),
                label: type.name
              })) : [],
              addonRight: (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    localStorage.setItem('OPEN_CASE_TYPE_CREATE_MODAL', '1');
                    window.open(route('cases.case-types.index'), '_blank');
                  }}
                >
                  + {t('Add CaseType')}
                </Button>
              )
            },
            {
              name: 'case_status_id',
              label: t('Case Status'),
              type: 'select',
              required: true,
              options: caseStatuses ? caseStatuses.map((status: any) => ({
                value: status.id.toString(),
                label: status.name
              })) : [],
              addonRight: (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    localStorage.setItem('OPEN_CASE_STATUS_CREATE_MODAL', '1');
                    window.open(route('cases.case-statuses.index'), '_blank');
                  }}
                >
                  + {t('Add CaseStatus')}
                </Button>
              )
            },
            {
              name: 'court_id',
              label: t('Court'),
              type: 'select',
              required: true,
              options: courts ? courts.map((court: any) => ({
                value: court.id.toString(),
                label: court.name,
                key: `court-${court.id}`
              })) : [],
              addonRight: (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    localStorage.setItem('OPEN_COURT_CREATE_MODAL', '1');
                    window.open(route('courts.index'), '_blank');
                  }}
                >
                  + {t('Add Court')}
                </Button>
              )
            },
            {
              name: 'priority',
              label: t('Priority'),
              type: 'select',
              required: true,
              options: [
                { value: 'low', label: t('Low') },
                { value: 'medium', label: t('Medium') },
                { value: 'high', label: t('High') }
              ],
              defaultValue: 'medium'
            },
            { name: 'filing_date', label: t('Filing Date'), type: 'date' },
            { name: 'expected_completion_date', label: t('Expected Completion'), type: 'date' },
            { name: 'estimated_value', label: t('Estimated Value'), type: 'number' },
            { name: 'opposing_party', label: t('Opposing Party'), type: 'text' },
            { name: 'court_details', label: t('Court Details'), type: 'textarea' },
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
          modalSize: 'xl',
        }}
        initialData={currentItem}
        title={
          formMode === 'create'
            ? t('Add New Case')
            : formMode === 'edit'
              ? t('Edit Case')
              : t('View Case')
        }
        mode={formMode}
      />

      <CrudDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={currentItem?.title || ''}
        entityName="case"
      />
    </PageTemplate>
  );
}