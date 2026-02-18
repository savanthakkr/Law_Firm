import { PageTemplate } from '@/components/page-template';
import { usePage, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';

export default function TaskShow() {
  const { t } = useTranslation();
  const { task } = usePage().props as any;

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Task & Workflow'), href: route('tasks.index') },
    { title: t('Tasks'), href: route('tasks.index') },
    { title: task?.title || t('Task Details') }
  ];

  const pageActions = [
    {
      label: t('Back to Task List'),
      icon: <ArrowLeft className="h-4 w-4 mr-2" />,
      variant: 'outline',
      onClick: () => router.get(route('tasks.index'))
    }
  ];

  const getPriorityColor = (priority: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      not_started: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      on_hold: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <PageTemplate
      title={task?.title || t("Task Details")}
      url={`/tasks/${task?.id}`}
      actions={pageActions}
      breadcrumbs={breadcrumbs}
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {task?.task_id}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t('Task Details')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getPriorityColor(task?.priority)}`}>
                {t(task?.priority?.charAt(0).toUpperCase() + task?.priority?.slice(1))}
              </span>
              <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getStatusColor(task?.status)}`}>
                {t(task?.status?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()))}
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('Title')}</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{task?.title}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('Task Type')}</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{task?.task_type?.name || '-'}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('Assigned To')}</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{task?.assigned_user?.name || '-'}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('Case')}</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {task?.case ? `${task.case.case_id} - ${task.case.title}` : '-'}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('Due Date')}</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {task?.due_date ? window.appSettings?.formatDateTime(task.due_date, false) || new Date(task.due_date).toLocaleDateString() : '-'}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('Estimated Duration')}</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {task?.estimated_duration ? `${task.estimated_duration} ${t('minutes')}` : '-'}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('Created By')}</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{task?.creator?.name || '-'}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('Created At')}</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {task?.created_at ? window.appSettings?.formatDateTime(task.created_at, true) || new Date(task.created_at).toLocaleString() : '-'}
              </dd>
            </div>

            {task?.description && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('Description')}</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{task.description}</dd>
              </div>
            )}

            {task?.notes && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('Notes')}</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{task.notes}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </PageTemplate>
  );
}