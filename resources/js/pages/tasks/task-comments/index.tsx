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

export default function TaskComments() {
  const { t } = useTranslation();
  const { auth, comments, tasks, filters: pageFilters = {} } = usePage().props as any;
  const permissions = auth?.permissions || [];

  const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
  const [selectedTask, setSelectedTask] = useState(pageFilters.task_id || 'all');
  const [selectedInternal, setSelectedInternal] = useState(pageFilters.is_internal || 'all');
  const [showFilters, setShowFilters] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');

  const hasActiveFilters = () => {
    return searchTerm !== '' || selectedTask !== 'all' || selectedInternal !== 'all';
  };

  const activeFilterCount = () => {
    return (searchTerm ? 1 : 0) + (selectedTask !== 'all' ? 1 : 0) + (selectedInternal !== 'all' ? 1 : 0);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const applyFilters = () => {
    router.get(route('tasks.task-comments.index'), {
      page: 1,
      search: searchTerm || undefined,
      task_id: selectedTask !== 'all' ? selectedTask : undefined,
      is_internal: selectedInternal !== 'all' ? selectedInternal : undefined,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const handleSort = (field: string) => {
    const direction = pageFilters.sort_field === field && pageFilters.sort_direction === 'asc' ? 'desc' : 'asc';

    router.get(route('tasks.task-comments.index'), {
      sort_field: field,
      sort_direction: direction,
      page: 1,
      search: searchTerm || undefined,
      task_id: selectedTask !== 'all' ? selectedTask : undefined,
      is_internal: selectedInternal !== 'all' ? selectedInternal : undefined,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const handleAction = (action: string, item: any) => {
    setCurrentItem(item);

    switch (action) {
      case 'view':
        setIsViewModalOpen(true);
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
    // Convert is_internal to boolean
    const processedData = {
      ...formData,
      is_internal: formData.is_internal === true || formData.is_internal === 'true'
    };
    
    if (formMode === 'create') {
      toast.loading(t('Creating comment...'));
      router.post(route('tasks.task-comments.store'), processedData, {
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
            toast.error(`Failed to create comment: ${Object.values(errors).join(', ')}`);
          }
        }
      });
    } else if (formMode === 'edit') {
      toast.loading(t('Updating comment...'));
      router.put(route('tasks.task-comments.update', currentItem.id), processedData, {
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
            toast.error(`Failed to update comment: ${Object.values(errors).join(', ')}`);
          }
        }
      });
    }
  };

  const handleDeleteConfirm = () => {
    toast.loading(t('Deleting comment...'));
    router.delete(route('tasks.task-comments.destroy', currentItem.id), {
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
          toast.error(`Failed to delete comment: ${Object.values(errors).join(', ')}`);
        }
      }
    });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedTask('all');
    setSelectedInternal('all');
    setShowFilters(false);

    router.get(route('tasks.task-comments.index'), {
      page: 1,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const pageActions = [];
  if (hasPermission(permissions, 'create-task-comments')) {
    pageActions.push({
      label: t('Add Comment'),
      icon: <Plus className="h-4 w-4 mr-2" />,
      variant: 'default',
      onClick: () => handleAddNew()
    });
  }

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Task & Workflow'), href: route('tasks.index') },
    { title: t('Comments') }
  ];

  const columns = [
    {
      key: 'task',
      label: t('Task'),
      render: (value: any, row: any) => row.task ? `${row.task.task_id} - ${row.task.title}` : '-'
    },
    {
      key: 'comment_text',
      label: t('Comment'),
      render: (value: string) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      )
    },
    {
      key: 'is_internal',
      label: t('Type'),
      render: (value: boolean) => (
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${value
          ? 'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20'
          : 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20'
          }`}>
          {value ? t('Internal') : t('External')}
        </span>
      )
    },
    {
      key: 'creator',
      label: t('Author'),
      render: (value: any, row: any) => row.creator?.name || '-'
    },
    {
      key: 'created_at',
      label: t('Created At'),
      sortable: true,
        type: 'date',
    }
  ];

  const actions = [
    {
      label: t('View'),
      icon: 'Eye',
      action: 'view',
      className: 'text-blue-500',
      requiredPermission: 'view-task-comments'
    },
    {
      label: t('Edit'),
      icon: 'Edit',
      action: 'edit',
      className: 'text-amber-500',
      requiredPermission: 'edit-task-comments'
    },
    {
      label: t('Delete'),
      icon: 'Trash2',
      action: 'delete',
      className: 'text-red-500',
      requiredPermission: 'delete-task-comments'
    }
  ];

  const taskOptions = [
    { value: 'all', label: t('All Tasks') },
    ...(tasks || []).map((task: any) => ({
      value: task.id.toString(),
      label: `${task.task_id} - ${task.title}`
    }))
  ];

  const internalOptions = [
    { value: 'all', label: t('All Types') },
    { value: 'true', label: t('Internal') },
    { value: 'false', label: t('External') }
  ];

  return (
    <PageTemplate
      title={t("Task Comments")}
      url="/tasks/task-comments"
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
              name: 'task_id',
              label: t('Task'),
              type: 'select',
              value: selectedTask,
              onChange: setSelectedTask,
              options: taskOptions
            },
            {
              name: 'is_internal',
              label: t('Type'),
              type: 'select',
              value: selectedInternal,
              onChange: setSelectedInternal,
              options: internalOptions
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
            router.get(route('tasks.task-comments.index'), {
              page: 1,
              per_page: parseInt(value),
              search: searchTerm || undefined,
              task_id: selectedTask !== 'all' ? selectedTask : undefined,
              is_internal: selectedInternal !== 'all' ? selectedInternal : undefined
            }, { preserveState: true, preserveScroll: true });
          }}
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        <CrudTable
          columns={columns}
          actions={actions}
          data={comments?.data || []}
          from={comments?.from || 1}
          onAction={handleAction}
          sortField={pageFilters.sort_field}
          sortDirection={pageFilters.sort_direction}
          onSort={handleSort}
          permissions={permissions}
          entityPermissions={{
            view: 'view-task-comments',
            create: 'create-task-comments',
            edit: 'edit-task-comments',
            delete: 'delete-task-comments'
          }}
        />

        <Pagination
          from={comments?.from || 0}
          to={comments?.to || 0}
          total={comments?.total || 0}
          links={comments?.links}
          entityName={t("comments")}
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
              name: 'task_id',
              label: t('Task'),
              type: 'select',
              required: true,
              placeholder: t('Select Task'),
              options: [
                ...(tasks || []).map((task: any) => ({
                  value: task.id.toString(),
                  label: `${task.task_id} - ${task.title}`
                }))
              ]
            },
            { name: 'comment_text', label: t('Comment'), type: 'textarea', required: true },
            {
              name: 'is_internal',
              label: t('Comment Type'),
              type: 'select',
              required: true,
              options: [
                { value: false, label: t('External') },
                { value: true, label: t('Internal') }
              ],
              defaultValue: false
            }
          ],
          modalSize: 'lg'
        }}
        initialData={currentItem}
        title={
          formMode === 'create'
            ? t('Add New Comment')
            : formMode === 'edit'
              ? t('Edit Comment')
              : t('View Comment')
        }
        mode={formMode}
      />

      <CrudFormModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        onSubmit={() => {}}
        formConfig={{
          fields: [
            {
              name: 'task_info',
              label: t('Task'),
              type: 'text',
              readOnly: true
            },
            {
              name: 'comment_text',
              label: t('Comment'),
              type: 'textarea',
              readOnly: true
            },
            {
              name: 'is_internal',
              label: t('Comment Type'),
              type: 'text',
              readOnly: true
            },
            {
              name: 'author_info',
              label: t('Author'),
              type: 'text',
              readOnly: true
            }
          ],
          modalSize: 'lg',
          hideSubmitButton: true
        }}
        initialData={currentItem ? {
          task_info: currentItem.task ? `${currentItem.task.task_id} - ${currentItem.task.title}` : '-',
          comment_text: currentItem.comment_text || '-',
          is_internal: currentItem.is_internal ? t('Internal') : t('External'),
          author_info: currentItem.creator?.name || '-'
        } : null}
        title={t('View Comment Details')}
        mode='view'
      />

      <CrudDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={currentItem?.comment_text?.substring(0, 50) + '...' || ''}
        entityName="comment"
      />
    </PageTemplate>
  );
}