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

export default function CaseTeamMembers() {
  const { t } = useTranslation();
  const { auth, teamMembers, cases, users, filters: pageFilters = {} } = usePage().props as any;
  const permissions = auth?.permissions || [];

  const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
  const [selectedCase, setSelectedCase] = useState(pageFilters.case_id || 'all');
  const [selectedRole, setSelectedRole] = useState(pageFilters.role || 'all');
  const [selectedStatus, setSelectedStatus] = useState(pageFilters.status || 'all');
  const [showFilters, setShowFilters] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');

  const hasActiveFilters = () => {
    return searchTerm !== '' || selectedCase !== 'all' || selectedRole !== 'all' || selectedStatus !== 'all';
  };

  const activeFilterCount = () => {
    return (searchTerm ? 1 : 0) + (selectedCase !== 'all' ? 1 : 0) + (selectedRole !== 'all' ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const applyFilters = () => {
    router.get(route('cases.case-team-members.index'), {
      page: 1,
      search: searchTerm || undefined,
      case_id: selectedCase !== 'all' ? selectedCase : undefined,
      role: selectedRole !== 'all' ? selectedRole : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const handleSort = (field: string) => {
    const direction = pageFilters.sort_field === field && pageFilters.sort_direction === 'asc' ? 'desc' : 'asc';

    router.get(route('cases.case-team-members.index'), {
      sort_field: field,
      sort_direction: direction,
      page: 1,
      search: searchTerm || undefined,
      case_id: selectedCase !== 'all' ? selectedCase : undefined,
      role: selectedRole !== 'all' ? selectedRole : undefined,
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
      toast.loading(t('Assigning team member...'));

      router.post(route('cases.case-team-members.store'), formData, {
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
          toast.error(`Failed to assign team member: ${Object.values(errors).join(', ')}`);
        }
      });
    } else if (formMode === 'edit') {
      toast.loading(t('Updating team member assignment...'));

      router.put(route('cases.case-team-members.update', currentItem.id), formData, {
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
          toast.error(`Failed to update team member assignment: ${Object.values(errors).join(', ')}`);
        }
      });
    }
  };

  const handleDeleteConfirm = () => {
    toast.loading(t('Removing team member assignment...'));

    router.delete(route('cases.case-team-members.destroy', currentItem.id), {
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
        toast.error(`Failed to remove team member assignment: ${Object.values(errors).join(', ')}`);
      }
    });
  };

  const handleToggleStatus = (teamMember: any) => {
    const newStatus = teamMember.status === 'active' ? 'inactive' : 'active';
    toast.loading(`${newStatus === 'active' ? t('Activating') : t('Deactivating')} team member assignment...`);

    router.put(route('cases.case-team-members.toggle-status', teamMember.id), {}, {
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
        toast.error(`Failed to update team member status: ${Object.values(errors).join(', ')}`);
      }
    });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCase('all');
    setSelectedRole('all');
    setSelectedStatus('all');
    setShowFilters(false);

    router.get(route('cases.case-team-members.index'), {
      page: 1,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const pageActions = [];

  if (hasPermission(permissions, 'create-case-team-members')) {
    pageActions.push({
      label: t('Assign Team Member'),
      icon: <Plus className="h-4 w-4 mr-2" />,
      variant: 'default',
      onClick: () => handleAddNew()
    });
  }

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Case Management'), href: route('cases.index') },
    { title: t('Case Team Members') }
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
      key: 'user',
      label: t('Team Member'),
      render: (value: any, row: any) => row.user?.name || '-'
    },

    {
      key: 'assigned_date',
      label: t('Assigned Date'),
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
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
      requiredPermission: 'view-case-team-members'
    },
    {
      label: t('Edit'),
      icon: 'Edit',
      action: 'edit',
      className: 'text-amber-500',
      requiredPermission: 'edit-case-team-members'
    },
    {
      label: t('Toggle Status'),
      icon: 'Lock',
      action: 'toggle-status',
      className: 'text-amber-500',
      requiredPermission: 'edit-case-team-members'
    },
    {
      label: t('Delete'),
      icon: 'Trash2',
      action: 'delete',
      className: 'text-red-500',
      requiredPermission: 'delete-case-team-members'
    }
  ];

  return (
    <PageTemplate
      title={t("Case Team Members")}
      url="/cases/case-team-members"
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
            router.get(route('cases.case-team-members.index'), {
              page: 1,
              per_page: parseInt(value),
              search: searchTerm || undefined,
              case_id: selectedCase !== 'all' ? selectedCase : undefined,
              role: selectedRole !== 'all' ? selectedRole : undefined,
              status: selectedStatus !== 'all' ? selectedStatus : undefined
            }, { preserveState: true, preserveScroll: true });
          }}
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        <CrudTable
          columns={columns}
          actions={actions}
          data={teamMembers?.data || []}
          from={teamMembers?.from || 1}
          onAction={handleAction}
          sortField={pageFilters.sort_field}
          sortDirection={pageFilters.sort_direction}
          onSort={handleSort}
          permissions={permissions}
          entityPermissions={{
            view: 'view-case-team-members',
            create: 'create-case-team-members',
            edit: 'edit-case-team-members',
            delete: 'delete-case-team-members'
          }}
        />

        <Pagination
          from={teamMembers?.from || 0}
          to={teamMembers?.to || 0}
          total={teamMembers?.total || 0}
          links={teamMembers?.links}
          entityName={t("team member assignments")}
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
              name: 'user_id',
              label: t('Team Member'),
              type: 'select',
              required: true,
              options: users ? users.map((user: any) => ({
                value: user.id.toString(),
                label: user.name
              })) : []
            },

            { name: 'assigned_date', label: t('Assigned Date'), type: 'date', required: true, defaultValue: new Date().toISOString().split('T')[0] },
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
        initialData={currentItem}
        title={
          formMode === 'create'
            ? t('Assign Team Member')
            : formMode === 'edit'
              ? t('Edit Team Member Assignment')
              : t('View Team Member Assignment')
        }
        mode={formMode}
      />

      <CrudDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={`${currentItem?.user?.name} - ${currentItem?.case?.title}` || ''}
        entityName="team member assignment"
      />
    </PageTemplate>
  );
}