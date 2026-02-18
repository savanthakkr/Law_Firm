import { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { usePage, router, Link } from '@inertiajs/react';
import { ExternalLink, Plus } from 'lucide-react';
import { hasPermission } from '@/utils/authorization';
import { CrudTable } from '@/components/CrudTable';
import { CrudFormModal } from '@/components/CrudFormModal';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { toast } from '@/components/custom-toast';
import { useTranslation } from 'react-i18next';
import { Pagination } from '@/components/ui/pagination';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';

export default function Tasks() {
  const { t } = useTranslation();
  const { auth, tasks, taskTypes, users, cases, taskStatuses, filters: pageFilters = {} } = usePage().props as any;
  const permissions = auth?.permissions || [];

  const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
  const [selectedTaskType, setSelectedTaskType] = useState(pageFilters.task_type_id || 'all');
  const [selectedStatus, setSelectedStatus] = useState(pageFilters.status || 'all');
  const [selectedPriority, setSelectedPriority] = useState(pageFilters.priority || 'all');
  const [selectedAssignedTo, setSelectedAssignedTo] = useState(pageFilters.assigned_to || 'all');
  const [showFilters, setShowFilters] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');

  const hasActiveFilters = () => {
    return searchTerm !== '' || selectedTaskType !== 'all' || selectedStatus !== 'all' || 
           selectedPriority !== 'all' || selectedAssignedTo !== 'all';
  };

  const activeFilterCount = () => {
    return (searchTerm ? 1 : 0) + (selectedTaskType !== 'all' ? 1 : 0) + 
           (selectedStatus !== 'all' ? 1 : 0) + (selectedPriority !== 'all' ? 1 : 0) + 
           (selectedAssignedTo !== 'all' ? 1 : 0);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const applyFilters = () => {
    router.get(route('tasks.index'), {
      page: 1,
      search: searchTerm || undefined,
      task_type_id: selectedTaskType !== 'all' ? selectedTaskType : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      priority: selectedPriority !== 'all' ? selectedPriority : undefined,
      assigned_to: selectedAssignedTo !== 'all' ? selectedAssignedTo : undefined,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const handleSort = (field: string) => {
    const direction = pageFilters.sort_field === field && pageFilters.sort_direction === 'asc' ? 'desc' : 'asc';

    router.get(route('tasks.index'), {
      sort_field: field,
      sort_direction: direction,
      page: 1,
      search: searchTerm || undefined,
      task_type_id: selectedTaskType !== 'all' ? selectedTaskType : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      priority: selectedPriority !== 'all' ? selectedPriority : undefined,
      assigned_to: selectedAssignedTo !== 'all' ? selectedAssignedTo : undefined,
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
        setIsStatusModalOpen(true);
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
      toast.loading(t('Creating task...'));
      router.post(route('tasks.store'), formData, {
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
            toast.error(`Failed to create task: ${Object.values(errors).join(', ')}`);
          }
        }
      });
    } else if (formMode === 'edit') {
      toast.loading(t('Updating task...'));
      router.put(route('tasks.update', currentItem.id), formData, {
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
            toast.error(`Failed to update task: ${Object.values(errors).join(', ')}`);
          }
        }
      });
    }
  };

  const handleDeleteConfirm = () => {
    toast.loading(t('Deleting task...'));
    router.delete(route('tasks.destroy', currentItem.id), {
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
          toast.error(`Failed to delete task: ${Object.values(errors).join(', ')}`);
        }
      }
    });
  };

  const handleStatusChange = (formData: any) => {
    toast.loading(t('Updating task status...'));
    router.put(route('tasks.update', currentItem.id), {
      ...currentItem,
      status: formData.status,
      task_type_id: currentItem.task_type_id || currentItem.task_type?.id,
      assigned_to: currentItem.assigned_to || currentItem.assigned_user?.id,
      case_id: currentItem.case_id || currentItem.case?.id,
      task_status_id: currentItem.task_status_id || currentItem.task_status?.id
    }, {
      onSuccess: (page) => {
        setIsStatusModalOpen(false);
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
          toast.error(`Failed to update task status: ${Object.values(errors).join(', ')}`);
        }
      }
    });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedTaskType('all');
    setSelectedStatus('all');
    setSelectedPriority('all');
    setSelectedAssignedTo('all');
    setShowFilters(false);

    router.get(route('tasks.index'), {
      page: 1,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const pageActions = [];
  if (hasPermission(permissions, 'create-tasks')) {
    pageActions.push({
      label: t('Add Task'),
      icon: <Plus className="h-4 w-4 mr-2" />,
      variant: 'default',
      onClick: () => handleAddNew()
    });
  }

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Task & Workflow'), href: route('tasks.index') },
    { title: t('Tasks') }
  ];

  const columns = [
    {
      key: 'case',
      label: t('Case ID'),
      render: (value: string, row: any) => (
        <div className="flex items-center gap-2">
          {value ? (
            <>
              <ExternalLink className="h-4 w-4 text-gray-500" />
              <a href={route('cases.show', row.case.id)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 truncate max-w-xs">
                {row.case.case_id}
              </a>
            </>
          ) : (
            <span className="text-gray-500">-</span>
          )}
        </div>
      )
    },
    {
      key: 'task_id',
      label: t('Task ID'),
      sortable: true
    },
    {
      key: 'title',
      label: t('Title'),
      sortable: true
    },
    {
      key: 'priority',
      label: t('Priority'),
      render: (value: string) => {
        const colors = {
          critical: 'bg-red-100 text-red-800',
          high: 'bg-orange-100 text-orange-800',
          medium: 'bg-yellow-100 text-yellow-800',
          low: 'bg-green-100 text-green-800'
        };
        return (
          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${colors[value as keyof typeof colors]}`}>
            {t(value.charAt(0).toUpperCase() + value.slice(1))}
          </span>
        );
      }
    },
    {
      key: 'status',
      label: t('Status'),
      render: (value: string) => {
        const colors = {
          not_started: 'bg-gray-100 text-gray-800',
          in_progress: 'bg-blue-100 text-blue-800',
          completed: 'bg-green-100 text-green-800',
          on_hold: 'bg-red-100 text-red-800'
        };
        return (
          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${colors[value as keyof typeof colors]}`}>
            {t(value.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()))}
          </span>
        );
      }
    },
    {
      key: 'assigned_user',
      label: t('Assigned To'),
      render: (value: any, row: any) => row.assigned_user?.name || '-'
    },
    {
      key: 'due_date',
      label: t('Due Date'),
      sortable: true,
      render: (value: string) => value ? window.appSettings?.formatDateTime(value, false) || new Date(value).toLocaleDateString() : '-'
    },
    {
      key: 'task_type',
      label: t('Type'),
      render: (value: any, row: any) => row.task_type?.name || '-'
    }
  ];

  const actions = [
    {
      label: t('View'),
      icon: 'Eye',
      action: 'view',
      className: 'text-blue-500',
      requiredPermission: 'view-tasks',
      href: (row: any) => route('tasks.show', row.id)
    },
    {
      label: t('Edit'),
      icon: 'Edit',
      action: 'edit',
      className: 'text-amber-500',
      requiredPermission: 'edit-tasks'
    },
    {
      label: t('Change Status'),
      icon: 'CheckCircle',
      action: 'toggle-status',
      className: 'text-green-500',
      requiredPermission: 'toggle-status-tasks'
    },
    {
      label: t('Delete'),
      icon: 'Trash2',
      action: 'delete',
      className: 'text-red-500',
      requiredPermission: 'delete-tasks'
    }
  ];

  const taskTypeOptions = [
    { value: 'all', label: t('All Types') },
    ...(taskTypes || []).map((type: any) => ({
      value: type.id.toString(),
      label: type.name
    }))
  ];

  const statusOptions = [
    { value: 'all', label: t('All Statuses') },
    { value: 'not_started', label: t('Not Started') },
    { value: 'in_progress', label: t('In Progress') },
    { value: 'completed', label: t('Completed') },
    { value: 'on_hold', label: t('On Hold') }
  ];

  const priorityOptions = [
    { value: 'all', label: t('All Priorities') },
    { value: 'critical', label: t('Critical') },
    { value: 'high', label: t('High') },
    { value: 'medium', label: t('Medium') },
    { value: 'low', label: t('Low') }
  ];

  const userOptions = [
    { value: 'all', label: t('All Users') },
    ...(users || []).map((user: any) => ({
      value: user.id.toString(),
      label: user.name
    }))
  ];

  return (
    <PageTemplate
      title={t("Task Management")}
      url="/tasks"
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
              name: 'task_type_id',
              label: t('Task Type'),
              type: 'select',
              value: selectedTaskType,
              onChange: setSelectedTaskType,
              options: taskTypeOptions
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
            },
            {
              name: 'assigned_to',
              label: t('Assigned To'),
              type: 'select',
              value: selectedAssignedTo,
              onChange: setSelectedAssignedTo,
              options: userOptions
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
            router.get(route('tasks.index'), {
              page: 1,
              per_page: parseInt(value),
              search: searchTerm || undefined,
              task_type_id: selectedTaskType !== 'all' ? selectedTaskType : undefined,
              status: selectedStatus !== 'all' ? selectedStatus : undefined,
              priority: selectedPriority !== 'all' ? selectedPriority : undefined,
              assigned_to: selectedAssignedTo !== 'all' ? selectedAssignedTo : undefined
            }, { preserveState: true, preserveScroll: true });
          }}
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        <CrudTable
          columns={columns}
          actions={actions}
          data={tasks?.data || []}
          from={tasks?.from || 1}
          onAction={handleAction}
          sortField={pageFilters.sort_field}
          sortDirection={pageFilters.sort_direction}
          onSort={handleSort}
          permissions={permissions}
          entityPermissions={{
            view: 'view-tasks',
            create: 'create-tasks',
            edit: 'edit-tasks',
            delete: 'delete-tasks'
          }}
        />

        <Pagination
          from={tasks?.from || 0}
          to={tasks?.to || 0}
          total={tasks?.total || 0}
          links={tasks?.links}
          entityName={t("tasks")}
          onPageChange={(url) => router.get(url)}
        />
      </div>

      <CrudFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        formConfig={{
          fields: [
            { name: 'title', label: t('Title'), type: 'text', required: true },
            { name: 'description', label: t('Description'), type: 'textarea' },
            {
              name: 'priority',
              label: t('Priority'),
              type: 'select',
              required: true,
              options: [
                { value: 'critical', label: t('Critical') },
                { value: 'high', label: t('High') },
                { value: 'medium', label: t('Medium') },
                { value: 'low', label: t('Low') }
              ],
              defaultValue: 'medium'
            },
            {
              name: 'status',
              label: t('Status'),
              type: 'select',
              required: true,
              options: [
                { value: 'not_started', label: t('Not Started') },
                { value: 'in_progress', label: t('In Progress') },
                { value: 'completed', label: t('Completed') },
                { value: 'on_hold', label: t('On Hold') }
              ],
              defaultValue: 'not_started'
            },
            { name: 'due_date', label: t('Due Date'), type: 'date' },
            { name: 'estimated_duration', label: t('Estimated Duration (minutes)'), type: 'number' },
            {
              name: 'case_assignment',
              label: t('Case & Assignment'),
              type: 'dependent-dropdown',
              dependentConfig: (() => {
                const caseOptions = (cases || []).map((c: any) => ({
                  value: c.id.toString(),
                  label: c.title || c.case_id || `Case ${c.id}`
                }));
                return [
                  {
                    name: 'case_id',
                    label: t('Case'),
                    options: caseOptions
                  },
                  {
                    name: 'assigned_to',
                    label: t('Assigned To'),
                    apiEndpoint: 'api/tasks/case-users/{case_id}',
                    showCurrentValue: true
                  }
                ];
              })()
            },
            {
              name: 'task_type_id',
              label: t('Task Type'),
              type: 'select',
              placeholder: t('Select Task Type'),
              options: [
                ...(taskTypes || []).map((type: any) => ({
                  value: type.id.toString(),
                  label: type.name
                }))
              ]
            },
            {
              name: 'task_status_id',
              label: t('Task Status'),
              type: 'select',
              placeholder: t('Select Task Status'),
              options: [
                ...(taskStatuses || []).map((status: any) => ({
                  value: status.id.toString(),
                  label: status.name
                }))
              ]
            },
            { name: 'notes', label: t('Notes'), type: 'textarea' }
          ],
          modalSize: 'xl'
        }}
        initialData={currentItem}
        title={
          formMode === 'create'
            ? t('Add New Task')
            : formMode === 'edit'
              ? t('Edit Task')
              : t('View Task')
        }
        mode={formMode}
      />

      <CrudFormModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onSubmit={handleStatusChange}
        formConfig={{
          fields: [
            {
              name: 'status',
              label: t('Status'),
              type: 'select',
              required: true,
              options: [
                { value: 'not_started', label: t('Not Started') },
                { value: 'in_progress', label: t('In Progress') },
                { value: 'completed', label: t('Completed') },
                { value: 'on_hold', label: t('On Hold') }
              ]
            }
          ],
          modalSize: 'sm'
        }}
        initialData={currentItem ? { status: currentItem.status } : null}
        title={t('Change Task Status')}
        mode='edit'
      />

      <CrudDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={currentItem?.title || ''}
        entityName="task"
      />
    </PageTemplate>
  );
}