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
import { formatCurrency } from '@/utils/helpers';

export default function TimeEntries() {
  const { t } = useTranslation();
  const { auth, timeEntries, cases, users, filters: pageFilters = {} } = usePage().props as any;
  const permissions = auth?.permissions || [];

  // State
  const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
  const [selectedCase, setSelectedCase] = useState(pageFilters.case_id || 'all');
  const [selectedUser, setSelectedUser] = useState(pageFilters.user_id || 'all');
  const [selectedStatus, setSelectedStatus] = useState(pageFilters.status || 'all');
  const [selectedBillable, setSelectedBillable] = useState(pageFilters.is_billable || 'all');
  const [dateFrom, setDateFrom] = useState(pageFilters.date_from || '');
  const [dateTo, setDateTo] = useState(pageFilters.date_to || '');
  const [showFilters, setShowFilters] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sortField, setSortField] = useState(pageFilters.sort_field || '');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(pageFilters.sort_direction || 'asc');

  const [currentItem, setCurrentItem] = useState<any>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');

  // Check if any filters are active
  const hasActiveFilters = () => {
    return searchTerm !== '' || selectedCase !== 'all' || selectedUser !== 'all' || 
           selectedStatus !== 'all' || selectedBillable !== 'all' || dateFrom !== '' || dateTo !== '';
  };

  // Count active filters
  const activeFilterCount = () => {
    return (searchTerm ? 1 : 0) + (selectedCase !== 'all' ? 1 : 0) + (selectedUser !== 'all' ? 1 : 0) + 
           (selectedStatus !== 'all' ? 1 : 0) + (selectedBillable !== 'all' ? 1 : 0) + 
           (dateFrom ? 1 : 0) + (dateTo ? 1 : 0);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const applyFilters = () => {
    router.get(route('billing.time-entries.index'), {
      page: 1,
      search: searchTerm || undefined,
      case_id: selectedCase !== 'all' ? selectedCase : undefined,
      user_id: selectedUser !== 'all' ? selectedUser : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      is_billable: selectedBillable !== 'all' ? selectedBillable : undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      sort_field: sortField || undefined,
      sort_direction: sortDirection || undefined,
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
      case 'approve':
        handleApprove(item);
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
      toast.loading(t('Creating time entry...'));

      router.post(route('billing.time-entries.store'), formData, {
        onSuccess: (page) => {
          setIsFormModalOpen(false);
          toast.dismiss();
          if (page.props.flash.success) {
            toast.success(page.props.flash.success);
          }
        },
        onError: (errors) => {
          toast.dismiss();
          toast.error(`Failed to create time entry: ${Object.values(errors).join(', ')}`);
        }
      });
    } else if (formMode === 'edit') {
      toast.loading(t('Updating time entry...'));

      router.put(route('billing.time-entries.update', currentItem.id), formData, {
        onSuccess: (page) => {
          setIsFormModalOpen(false);
          toast.dismiss();
          if (page.props.flash.success) {
            toast.success(page.props.flash.success);
          }
        },
        onError: (errors) => {
          toast.dismiss();
          toast.error(`Failed to update time entry: ${Object.values(errors).join(', ')}`);
        }
      });
    }
  };



  const handleDeleteConfirm = () => {
    toast.loading(t('Deleting time entry...'));

    router.delete(route('billing.time-entries.destroy', currentItem.id), {
      onSuccess: (page) => {
        setIsDeleteModalOpen(false);
        toast.dismiss();
        if (page.props.flash.success) {
          toast.success(page.props.flash.success);
        }
      },
      onError: (errors) => {
        toast.dismiss();
        toast.error(`Failed to delete time entry: ${Object.values(errors).join(', ')}`);
      }
    });
  };

  const handleApprove = (timeEntry: any) => {
    toast.loading(t('Approving time entry...'));

    router.put(route('billing.time-entries.approve', timeEntry.id), {}, {
      onSuccess: (page) => {
        toast.dismiss();
        if (page.props.flash.success) {
          toast.success(page.props.flash.success);
        }
      },
      onError: (errors) => {
        toast.dismiss();
        toast.error(`Failed to approve time entry: ${Object.values(errors).join(', ')}`);
      }
    });
  };



  const handleSort = (field: string) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    
    router.get(route('billing.time-entries.index'), {
      page: 1,
      search: searchTerm || undefined,
      case_id: selectedCase !== 'all' ? selectedCase : undefined,
      user_id: selectedUser !== 'all' ? selectedUser : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      is_billable: selectedBillable !== 'all' ? selectedBillable : undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      sort_field: field,
      sort_direction: newDirection,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCase('all');
    setSelectedUser('all');
    setSelectedStatus('all');
    setSelectedBillable('all');
    setDateFrom('');
    setDateTo('');
    setSortField('');
    setSortDirection('asc');
    setShowFilters(false);

    router.get(route('billing.time-entries.index'), {
      page: 1,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Billing & Invoicing'), href: route('billing.time-entries.index') },
    { title: t('Time Entries') }
  ];

  // Define table columns
  const columns = [
    {
      key: 'entry_id',
      label: t('Entry ID'),
      sortable: true
    },
    {
      key: 'entry_date',
      label: t('Date'),
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'user',
      label: t('User'),
      render: (value: any) => value?.name || '-'
    },
    {
      key: 'case',
      label: t('Case'),
      render: (value: any) => value ? `${value.case_id} - ${value.title}` : t('General')
    },
    {
      key: 'description',
      label: t('Description'),
      render: (value: string) => (
        <div className="max-w-md truncate" title={value}>
          {value}
        </div>
      )
    },
    {
      key: 'hours',
      label: t('Hours'),
      render: (value: number) => `${value}h`
    },
    {
      key: 'is_billable',
      label: t('Billable'),
      render: (value: boolean) => (
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
          value 
            ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
            : 'bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20'
        }`}>
          {value ? t('Yes') : t('No')}
        </span>
      )
    },
    {
      key: 'status',
      label: t('Status'),
      render: (value: string) => {
        const statusColors = {
          draft: 'bg-gray-50 text-gray-700 ring-gray-600/20',
          submitted: 'bg-blue-50 text-blue-700 ring-blue-600/20',
          approved: 'bg-green-50 text-green-700 ring-green-600/20',
          billed: 'bg-purple-50 text-purple-700 ring-purple-600/20'
        };
        
        return (
          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${statusColors[value as keyof typeof statusColors] || statusColors.draft}`}>
            {t(value?.charAt(0).toUpperCase() + value?.slice(1))}
          </span>
        );
      }
    },
    {
      key: 'total_amount',
      label: t('Amount'),
      render: (value: any, row: any) => {
        if (!row.is_billable || !row.billable_rate) return '-';
        return (formatCurrency(row.hours * row.billable_rate));
      }
    }
  ];

  // Define table actions
  const actions = [
    {
      label: t('View'),
      icon: 'Eye',
      action: 'view',
      className: 'text-blue-500',
      requiredPermission: 'view-time-entries'
    },
    {
      label: t('Edit'),
      icon: 'Edit',
      action: 'edit',
      className: 'text-amber-500',
      requiredPermission: 'edit-time-entries',
      condition: (row: any) => row.status !== 'billed'
    },
    {
      label: t('Approve'),
      icon: 'CheckCircle',
      action: 'approve',
      className: 'text-green-500',
      requiredPermission: 'approve-time-entries',
      condition: (row: any) => row.status === 'submitted'
    },

    {
      label: t('Delete'),
      icon: 'Trash2',
      action: 'delete',
      className: 'text-red-500',
      requiredPermission: 'delete-time-entries',
      condition: (row: any) => row.status !== 'billed'
    }
  ];

  return (
    <PageTemplate
      title={t("Time Entries")}
      url="/billing/time-entries"
      actions={[

        ...(hasPermission(permissions, 'create-time-entries') ? [{
          label: t('Add Time Entry'),
          icon: <Plus className="h-4 w-4 mr-2" />,
          variant: 'outline' as const,
          onClick: handleAddNew
        }] : [])
      ]}
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
              name: 'case_id',
              label: t('Case'),
              type: 'select',
              value: selectedCase,
              onChange: setSelectedCase,
              options: [
                { value: 'all', label: t('All Cases') },
                { value: 'none', label: t('General (No Case)') },
                ...(cases || []).map((caseItem: any) => ({
                  value: caseItem.id.toString(),
                  label: caseItem.case_id ? `${caseItem.case_id} - ${caseItem.title}` : 'General'
                }))
              ]
            },
            {
              name: 'user_id',
              label: t('User'),
              type: 'select',
              value: selectedUser,
              onChange: setSelectedUser,
              options: [
                { value: 'all', label: t('All Users') },
                ...(users || []).map((user: any) => ({
                  value: user.id.toString(),
                  label: user.name
                }))
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
                { value: 'draft', label: t('Draft') },
                { value: 'submitted', label: t('Submitted') },
                { value: 'approved', label: t('Approved') },
                { value: 'billed', label: t('Billed') }
              ]
            },
            {
              name: 'is_billable',
              label: t('Billable'),
              type: 'select',
              value: selectedBillable,
              onChange: setSelectedBillable,
              options: [
                { value: 'all', label: t('All') },
                { value: '1', label: t('Billable') },
                { value: '0', label: t('Non-billable') }
              ]
            },
            {
              name: 'date_from',
              label: t('Date From'),
              type: 'date',
              value: dateFrom,
              onChange: setDateFrom
            },
            {
              name: 'date_to',
              label: t('Date To'),
              type: 'date',
              value: dateTo,
              onChange: setDateTo
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
            router.get(route('billing.time-entries.index'), {
              page: 1,
              per_page: parseInt(value),
              search: searchTerm || undefined,
              case_id: selectedCase !== 'all' ? selectedCase : undefined,
              user_id: selectedUser !== 'all' ? selectedUser : undefined,
              status: selectedStatus !== 'all' ? selectedStatus : undefined,
              is_billable: selectedBillable !== 'all' ? selectedBillable : undefined,
              date_from: dateFrom || undefined,
              date_to: dateTo || undefined,
              sort_field: sortField || undefined,
              sort_direction: sortDirection || undefined
            }, { preserveState: true, preserveScroll: true });
          }}
        />
      </div>

      {/* Content section */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        <CrudTable
          columns={columns}
          actions={actions}
          data={timeEntries?.data || []}
          from={timeEntries?.from || 1}
          onAction={handleAction}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          permissions={permissions}
          entityPermissions={{
            view: 'view-time-entries',
            create: 'create-time-entries',
            edit: 'edit-time-entries',
            delete: 'delete-time-entries'
          }}
        />

        {/* Pagination section */}
        <Pagination
          from={timeEntries?.from || 0}
          to={timeEntries?.to || 0}
          total={timeEntries?.total || 0}
          links={timeEntries?.links}
          entityName={t("time entries")}
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
            {
              name: 'case_id',
              label: t('Case'),
              type: 'select',
              options: [
                ...(cases || []).map((caseItem: any) => ({
                  value: caseItem.id.toString(),
                  label: caseItem.case_id ? `${caseItem.case_id} - ${caseItem.title}` : 'General'
                }))
              ]
            },
            {
              name: 'user_id',
              label: t('Team Member'),
              type: 'select',
              required: true,
              options: (users || []).map((user: any) => ({
                value: user.id.toString(),
                label: user.name
              }))
            },
            { name: 'description', label: t('Description'), type: 'textarea', required: true },
            { name: 'hours', label: t('Hours'), type: 'number', required: true, step: '0.25', min: '0.1', max: '24' },
            { name: 'billable_rate', label: t('Billable Rate'), type: 'currency', step: '0.01', min: '0' },
            {
              name: 'is_billable',
              label: t('Billable'),
              type: 'select',
              options: [
                { value: true, label: t('Yes') },
                { value: false, label: t('No') }
              ],
              defaultValue: true
            },
            { name: 'entry_date', label: t('Entry Date'), type: 'date', required: true },
            { name: 'start_time', label: t('Start Time'), type: 'time' },
            { name: 'end_time', label: t('End Time'), type: 'time' },
            {
              name: 'status',
              label: t('Status'),
              type: 'select',
              options: [
                { value: 'draft', label: t('Draft') },
                { value: 'submitted', label: t('Submitted') },
                { value: 'approved', label: t('Approved') }
              ],
              defaultValue: 'draft'
            },
            { name: 'notes', label: t('Notes'), type: 'textarea' }
          ],
          modalSize: 'xl'
        }}
        initialData={currentItem}
        title={
          formMode === 'create'
            ? t('Add New Time Entry')
            : t('Edit Time Entry')
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
            { name: 'entry_id', label: t('Entry ID'), type: 'text' },
            {
              name: 'case',
              label: t('Case'),
              type: 'text',
              render: () => {
                const caseData = currentItem?.case;
                return <div className="rounded-md border bg-gray-50 p-2">
                  {caseData ? `${caseData.case_id} - ${caseData.title}` : t('General (No Case)')}
                </div>;
              }
            },
            {
              name: 'user',
              label: t('User'),
              type: 'text',
              render: () => {
                return <div className="rounded-md border bg-gray-50 p-2">
                  {currentItem?.user?.name || '-'}
                </div>;
              }
            },
            { name: 'description', label: t('Description'), type: 'textarea' },
            { name: 'hours', label: t('Hours'), type: 'text' },
            { name: 'billable_rate', label: t('Billable Rate'), type: 'text' },
            {
              name: 'is_billable',
              label: t('Billable'),
              type: 'text',
              render: () => {
                const value = currentItem?.is_billable;
                return <div className="rounded-md border bg-gray-50 p-2">
                  {(value === 1 || value === true) ? t('Yes') : t('No')}
                </div>;
              }
            },
            { name: 'entry_date', label: t('Entry Date'), type: 'text' },
            { name: 'start_time', label: t('Start Time'), type: 'time' },
            { name: 'end_time', label: t('End Time'), type: 'time' },
            {
              name: 'status',
              label: t('Status'),
              type: 'text',
              render: () => {
                const status = currentItem?.status;
                return <div className="rounded-md border bg-gray-50 p-2">
                  {t(status?.charAt(0).toUpperCase() + status?.slice(1))}
                </div>;
              }
            },
            { name: 'notes', label: t('Notes'), type: 'textarea' }
          ],
          modalSize: 'xl'
        }}
        initialData={currentItem}
        title={t('View Time Entry')}
        mode="view"
      />



      {/* Delete Modal */}
      <CrudDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={currentItem?.entry_id || ''}
        entityName="time entry"
      />
    </PageTemplate>
  );
}