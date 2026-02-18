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

export default function CaseTimelines() {
  const { t } = useTranslation();
  const { auth, timelines, cases, filters: pageFilters = {} } = usePage().props as any;
  const permissions = auth?.permissions || [];

  const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
  const [selectedCase, setSelectedCase] = useState(pageFilters.case_id || 'all');
  const [selectedEventType, setSelectedEventType] = useState(pageFilters.event_type || 'all');
  const [selectedStatus, setSelectedStatus] = useState(pageFilters.status || 'all');
  const [showFilters, setShowFilters] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');

  const hasActiveFilters = () => {
    return searchTerm !== '' || selectedCase !== 'all' || selectedEventType !== 'all' || selectedStatus !== 'all';
  };

  const activeFilterCount = () => {
    return (searchTerm ? 1 : 0) + (selectedCase !== 'all' ? 1 : 0) + (selectedEventType !== 'all' ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const applyFilters = () => {
    router.get(route('cases.case-timelines.index'), {
      page: 1,
      search: searchTerm || undefined,
      case_id: selectedCase !== 'all' ? selectedCase : undefined,
      event_type: selectedEventType !== 'all' ? selectedEventType : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const handleSort = (field: string) => {
    const direction = pageFilters.sort_field === field && pageFilters.sort_direction === 'asc' ? 'desc' : 'asc';

    router.get(route('cases.case-timelines.index'), {
      sort_field: field,
      sort_direction: direction,
      page: 1,
      search: searchTerm || undefined,
      case_id: selectedCase !== 'all' ? selectedCase : undefined,
      event_type: selectedEventType !== 'all' ? selectedEventType : undefined,
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

  const handleFormSubmit = (formData: any) => {
    if (formMode === 'create') {
      toast.loading(t('Creating timeline event...'));

      router.post(route('cases.case-timelines.store'), formData, {
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
          toast.error(`Failed to create timeline event: ${Object.values(errors).join(', ')}`);
        }
      });
    } else if (formMode === 'edit') {
      toast.loading(t('Updating timeline event...'));

      router.put(route('cases.case-timelines.update', currentItem.id), formData, {
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
          toast.error(`Failed to update timeline event: ${Object.values(errors).join(', ')}`);
        }
      });
    }
  };

  const handleDeleteConfirm = () => {
    toast.loading(t('Deleting timeline event...'));

    router.delete(route('cases.case-timelines.destroy', currentItem.id), {
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
        toast.error(`Failed to delete timeline event: ${Object.values(errors).join(', ')}`);
      }
    });
  };

  const handleToggleStatus = (timeline: any) => {
    const newStatus = timeline.status === 'active' ? 'inactive' : 'active';
    toast.loading(`${newStatus === 'active' ? t('Activating') : t('Deactivating')} timeline event...`);

    router.put(route('cases.case-timelines.toggle-status', timeline.id), {}, {
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
        toast.error(`Failed to update timeline event status: ${Object.values(errors).join(', ')}`);
      }
    });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCase('all');
    setSelectedEventType('all');
    setSelectedStatus('all');
    setShowFilters(false);

    router.get(route('cases.case-timelines.index'), {
      page: 1,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const pageActions = [];

  if (hasPermission(permissions, 'create-case-timelines')) {
    pageActions.push({
      label: t('Add Timeline Event'),
      icon: <Plus className="h-4 w-4 mr-2" />,
      variant: 'default',
      onClick: () => handleAddNew()
    });
  }

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Case Management'), href: route('cases.index') },
    { title: t('Case Timelines') }
  ];

  const columns = [
    {
      key: 'case',
      label: t('Case'),
      render: (value: any, row: any) => (
        <div>
          <div className="font-medium">{row.case?.case_id}</div>
          <div className="text-sm text-muted-foreground">{row.case?.title}</div>
        </div>
      )
    },
    {
      key: 'title',
      label: t('Title'),
      sortable: true
    },
    {
      key: 'event_type',
      label: t('Event Type'),
      render: (value: string) => (
        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
          {value}
        </span>
      )
    },
    {
      key: 'event_date',
      label: t('Event Date'),
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'is_completed',
      label: t('Completed'),
      render: (value: boolean) => (
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${value
          ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
          : 'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20'
        }`}>
          {value ? t('Yes') : t('No')}
        </span>
      )
    },
    {
      key: 'status',
      label: t('Status'),
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
      requiredPermission: 'view-case-timelines'
    },
    {
      label: t('Edit'),
      icon: 'Edit',
      action: 'edit',
      className: 'text-amber-500',
      requiredPermission: 'edit-case-timelines'
    },
    {
      label: t('Toggle Status'),
      icon: 'Lock',
      action: 'toggle-status',
      className: 'text-amber-500',
      requiredPermission: 'edit-case-timelines'
    },
    {
      label: t('Delete'),
      icon: 'Trash2',
      action: 'delete',
      className: 'text-red-500',
      requiredPermission: 'delete-case-timelines'
    }
  ];
console.log({cases})
  return (
    <PageTemplate
      title={t("Case Timelines")}
      url="/cases/case-timelines"
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
              name: 'case_id',
              label: t('Case'),
              type: 'select',
              value: selectedCase,
              onChange: setSelectedCase,
              options: [
                { value: 'all', label: t('All Cases') },
                ...(cases || []).map((caseItem: any) => ({
                  value: caseItem.id.toString(),
                  label: `${caseItem.case_id} - ${caseItem.title}`
                }))
              ]
            },
            {
              name: 'event_type',
              label: t('Event Type'),
              type: 'select',
              value: selectedEventType,
              onChange: setSelectedEventType,
              options: [
                { value: 'all', label: t('All Types') },
                { value: 'milestone', label: t('Milestone') },
                { value: 'hearing', label: t('Hearing') },
                { value: 'deadline', label: t('Deadline') },
                { value: 'meeting', label: t('Meeting') }
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
            router.get(route('cases.case-timelines.index'), {
              page: 1,
              per_page: parseInt(value),
              search: searchTerm || undefined,
              case_id: selectedCase !== 'all' ? selectedCase : undefined,
              event_type: selectedEventType !== 'all' ? selectedEventType : undefined,
              status: selectedStatus !== 'all' ? selectedStatus : undefined
            }, { preserveState: true, preserveScroll: true });
          }}
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        <CrudTable
          columns={columns}
          actions={actions}
          data={timelines?.data || []}
          from={timelines?.from || 1}
          onAction={handleAction}
          sortField={pageFilters.sort_field}
          sortDirection={pageFilters.sort_direction}
          onSort={handleSort}
          permissions={permissions}
          entityPermissions={{
            view: 'view-case-timelines',
            create: 'create-case-timelines',
            edit: 'edit-case-timelines',
            delete: 'delete-case-timelines'
          }}
        />

        <Pagination
          from={timelines?.from || 0}
          to={timelines?.to || 0}
          total={timelines?.total || 0}
          links={timelines?.links}
          entityName={t("timeline events")}
          onPageChange={(url) => router.get(url)}
        />
      </div>

      <CrudFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        formConfig={{
          fields: [
            {
              name: 'case_id',
              label: t('Case'),
              type: 'select',
              required: true,
              options: cases ? cases.map((caseItem: any) => ({
                value: caseItem.id.toString(),
                label: `${caseItem.case_id} - ${caseItem.title}`
              })) : []
            },
            {
              name: 'event_type',
              label: t('Event Type'),
              type: 'select',
              required: true,
              options: [
                { value: 'milestone', label: t('Milestone') },
                { value: 'hearing', label: t('Hearing') },
                { value: 'deadline', label: t('Deadline') },
                { value: 'meeting', label: t('Meeting') }
              ],
              defaultValue: 'milestone'
            },
            { name: 'title', label: t('Title'), type: 'text', required: true },
            { name: 'description', label: t('Description'), type: 'textarea' },
            { name: 'event_date', label: t('Event Date'), type: 'date', required: true },
            { name: 'is_completed', label: t('Completed'), type: 'checkbox' },
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
          modalSize: 'lg'
        }}
        initialData={currentItem ? {
          ...currentItem,
          case_id: currentItem.case_id?.toString()
        } : null}
        title={
          formMode === 'create'
            ? t('Add New Timeline Event')
            : formMode === 'edit'
              ? t('Edit Timeline Event')
              : t('View Timeline Event')
        }
        mode={formMode}
      />

      <CrudDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={currentItem?.title || ''}
        entityName="timeline event"
      />
    </PageTemplate>
  );
}