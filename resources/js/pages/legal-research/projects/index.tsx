import { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { usePage, router } from '@inertiajs/react';
import { Plus, Search, Calendar, User } from 'lucide-react';
import { hasPermission } from '@/utils/authorization';
import { CrudTable } from '@/components/CrudTable';
import { CrudFormModal } from '@/components/CrudFormModal';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { toast } from '@/components/custom-toast';
import { useTranslation } from 'react-i18next';
import { Pagination } from '@/components/ui/pagination';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';

export default function ResearchProjects() {
  const { t } = useTranslation();
  const { auth, projects, cases, researchTypes, filters: pageFilters = {} } = usePage().props as any;
  const permissions = auth?.permissions || [];

  const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
  const [selectedType, setSelectedType] = useState(pageFilters.research_type_id || 'all');
  const [selectedStatus, setSelectedStatus] = useState(pageFilters.status || 'all');
  const [selectedPriority, setSelectedPriority] = useState(pageFilters.priority || 'all');
  const [selectedCase, setSelectedCase] = useState(pageFilters.case_id || 'all');
  const [showFilters, setShowFilters] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const applyFilters = () => {
    router.get(route('legal-research.projects.index'), {
      page: 1,
      search: searchTerm || undefined,
      research_type_id: selectedType !== 'all' ? selectedType : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      priority: selectedPriority !== 'all' ? selectedPriority : undefined,
      case_id: selectedCase !== 'all' ? selectedCase : undefined,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const handleSort = (field: string) => {
    const direction = pageFilters.sort_field === field && pageFilters.sort_direction === 'asc' ? 'desc' : 'asc';
    router.get(route('legal-research.projects.index'), {
      sort_field: field,
      sort_direction: direction,
      page: 1,
      search: searchTerm || undefined,
      research_type_id: selectedType !== 'all' ? selectedType : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      priority: selectedPriority !== 'all' ? selectedPriority : undefined,
      case_id: selectedCase !== 'all' ? selectedCase : undefined,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const handleAction = (action: string, item: any) => {
    setCurrentItem(item);
    switch (action) {
      case 'view':
        router.get(route('legal-research.projects.show', item.id));
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

  const handleToggleStatus = (project: any) => {
    const newStatus = project.status === 'active' ? 'completed' : 'active';
    toast.loading(`${newStatus === 'active' ? t('Activating') : t('Completing')} project...`);

    router.put(route('legal-research.projects.toggle-status', project.id), {}, {
      onSuccess: (page) => {
        toast.dismiss();
        if (page.props.flash.success) {
          toast.success(page.props.flash.success);
        }
      },
      onError: (errors) => {
        toast.dismiss();
        toast.error(`Failed to update project status: ${Object.values(errors).join(', ')}`);
      }
    });
  };

  const handleFormSubmit = (formData: any) => {
    const action = formMode === 'create' ? 'store' : 'update';
    const route_name = formMode === 'create' 
      ? 'legal-research.projects.store' 
      : 'legal-research.projects.update';
    
    toast.loading(t(`${formMode === 'create' ? 'Creating' : 'Updating'} research project...`));

    const method = formMode === 'create' ? 'post' : 'put';
    const url = formMode === 'create' 
      ? route(route_name) 
      : route(route_name, currentItem.id);

    router[method](url, formData, {
      onSuccess: (page) => {
        setIsFormModalOpen(false);
        toast.dismiss();
        if (page.props.flash.success) {
          toast.success(page.props.flash.success);
        }
      },
      onError: (errors) => {
        toast.dismiss();
        toast.error(`Failed to ${action} research project: ${Object.values(errors).join(', ')}`);
      }
    });
  };

  const handleDeleteConfirm = () => {
    toast.loading(t('Deleting research project...'));
    router.delete(route('legal-research.projects.destroy', currentItem.id), {
      onSuccess: (page) => {
        setIsDeleteModalOpen(false);
        toast.dismiss();
        if (page.props.flash.success) {
          toast.success(page.props.flash.success);
        }
      },
      onError: (errors) => {
        toast.dismiss();
        toast.error(`Failed to delete research project: ${Object.values(errors).join(', ')}`);
      }
    });
  };

  const pageActions = [];
  if (hasPermission(permissions, 'create-research-projects')) {
    pageActions.push({
      label: t('Add Research Project'),
      icon: <Plus className="h-4 w-4 mr-2" />,
      variant: 'default',
      onClick: () => handleAddNew()
    });
  }

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Legal Research') },
    { title: t('Research Projects') }
  ];

  const columns = [
    {
      key: 'research_id',
      label: t('ID'),
      render: (value: string) => (
        <span className=" text-sm">{value}</span>
      )
    },
    {
      key: 'title',
      label: t('Title'),
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'research_type',
      label: t('Type'),
      render: (value: any, item: any) => {
        const researchType = item.research_type;
        return (
          <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20">
            {researchType?.name || '-'}
          </span>
        );
      }
    },
    {
      key: 'case',
      label: t('Case'),
      render: (value: any) => value?.title || '-'
    },

    {
      key: 'priority',
      label: t('Priority'),
      render: (value: string) => {
        const priorityColors = {
          low: 'bg-gray-50 text-gray-700 ring-gray-600/20',
          medium: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
          high: 'bg-orange-50 text-orange-700 ring-orange-600/20',
          urgent: 'bg-red-50 text-red-700 ring-red-600/20'
        };
        
        return (
          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${priorityColors[value as keyof typeof priorityColors] || priorityColors.medium}`}>
            {t(value.charAt(0).toUpperCase() + value.slice(1))}
          </span>
        );
      }
    },
    {
      key: 'due_date',
      label: t('Due Date'),
      render: (value: string) => (
        <div className="flex items-center gap-2">
          {value && <Calendar className="h-4 w-4 text-gray-500" />}
          <span>{value ? (window.appSettings?.formatDate(value) || new Date(value).toLocaleDateString()) : '-'}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: t('Status'),
      render: (value: string) => {
        const statusColors = {
          active: 'bg-green-50 text-green-700 ring-green-600/20',
          completed: 'bg-blue-50 text-blue-700 ring-blue-600/20',
          on_hold: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
          cancelled: 'bg-red-50 text-red-700 ring-red-600/20'
        };
        
        return (
          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${statusColors[value as keyof typeof statusColors] || statusColors.active}`}>
            {t(value.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()))}
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
      requiredPermission: 'view-research-projects'
    },
    {
      label: t('Edit'),
      icon: 'Edit',
      action: 'edit',
      className: 'text-amber-500',
      requiredPermission: 'edit-research-projects'
    },
    {
      label: t('Toggle Status'),
      icon: 'ToggleLeft',
      action: 'toggle-status',
      className: 'text-green-500',
      requiredPermission: 'edit-research-projects'
    },
    {
      label: t('Delete'),
      icon: 'Trash2',
      action: 'delete',
      className: 'text-red-500',
      requiredPermission: 'delete-research-projects'
    }
  ];

  const caseOptions = [
    { value: 'all', label: t('All Cases') },
    ...(cases || []).map((case_item: any) => ({ value: case_item.id.toString(), label: case_item.title }))
  ];

  return (
    <PageTemplate
      title={t("Research Projects")}
      url="/legal-research/projects"
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
              name: 'research_type_id',
              label: t('Research Type'),
              type: 'select',
              value: selectedType,
              onChange: setSelectedType,
              options: [
                { value: 'all', label: t('All Types') },
                ...(researchTypes || []).map((type: any) => ({ value: type.id.toString(), label: type.name }))
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
                { value: 'completed', label: t('Completed') },
                { value: 'on_hold', label: t('On Hold') },
                { value: 'cancelled', label: t('Cancelled') }
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
                { value: 'high', label: t('High') },
                { value: 'urgent', label: t('Urgent') }
              ]
            },
            {
              name: 'case_id',
              label: t('Case'),
              type: 'select',
              value: selectedCase,
              onChange: setSelectedCase,
              options: caseOptions
            }
          ]}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          hasActiveFilters={() => searchTerm !== '' || selectedType !== 'all' || selectedStatus !== 'all' || selectedPriority !== 'all' || selectedCase !== 'all'}
          activeFilterCount={() => (searchTerm ? 1 : 0) + (selectedType !== 'all' ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0) + (selectedPriority !== 'all' ? 1 : 0) + (selectedCase !== 'all' ? 1 : 0)}
          onResetFilters={() => {
            setSearchTerm('');
            setSelectedType('all');
            setSelectedStatus('all');
            setSelectedPriority('all');
            setSelectedCase('all');
            setShowFilters(false);
            router.get(route('legal-research.projects.index'), { page: 1, per_page: pageFilters.per_page });
          }}
          onApplyFilters={applyFilters}
          currentPerPage={pageFilters.per_page?.toString() || "10"}
          onPerPageChange={(value) => {
            router.get(route('legal-research.projects.index'), {
              page: 1,
              per_page: parseInt(value),
              search: searchTerm || undefined,
              research_type_id: selectedType !== 'all' ? selectedType : undefined,
              status: selectedStatus !== 'all' ? selectedStatus : undefined,
              priority: selectedPriority !== 'all' ? selectedPriority : undefined,
              case_id: selectedCase !== 'all' ? selectedCase : undefined
            });
          }}
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        <CrudTable
          columns={columns}
          actions={actions}
          data={projects?.data || []}
          from={projects?.from || 1}
          onAction={handleAction}
          sortField={pageFilters.sort_field}
          sortDirection={pageFilters.sort_direction}
          onSort={handleSort}
          permissions={permissions}
          entityPermissions={{
            view: 'view-research-projects',
            create: 'create-research-projects',
            edit: 'edit-research-projects',
            delete: 'delete-research-projects'
          }}
        />

        <Pagination
          from={projects?.from || 0}
          to={projects?.to || 0}
          total={projects?.total || 0}
          links={projects?.links}
          entityName={t("research projects")}
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
            { name: 'description', label: t('Description'), type: 'textarea', rows: 3 },
            {
              name: 'research_type_id',
              label: t('Research Type'),
              type: 'select',
              required: true,
              options: (researchTypes || []).map((type: any) => ({ value: type.id, label: type.name })),
              displayValue: formMode === 'view' ? currentItem?.research_type?.name : undefined
            },
            { 
              name: 'case_id', 
              label: t('Associated Case'), 
              type: 'select',
              options: [
                ...(cases || []).map((case_item: any) => ({ value: case_item.id, label: case_item.title }))
              ],
              displayValue: formMode === 'view' ? (currentItem?.case?.title || t('No Case')) : undefined
            },
            {
              name: 'priority',
              label: t('Priority'),
              type: 'select',
              required: true,
              options: [
                { value: 'low', label: t('Low') },
                { value: 'medium', label: t('Medium') },
                { value: 'high', label: t('High') },
                { value: 'urgent', label: t('Urgent') }
              ],
              defaultValue: 'medium'
            },

            { name: 'due_date', label: t('Due Date'), type: 'date' },
            {
              name: 'status',
              label: t('Status'),
              type: 'select',
              options: [
                { value: 'active', label: t('Active') },
                { value: 'completed', label: t('Completed') },
                { value: 'on_hold', label: t('On Hold') },
                { value: 'cancelled', label: t('Cancelled') }
              ],
              defaultValue: 'active'
            }
          ],
          modalSize: 'xl'
        }}
        initialData={currentItem}
        title={formMode === 'create' ? t('Add New Research Project') : t('Edit Research Project')}
        mode={formMode}
      />

      <CrudDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={currentItem?.title || ''}
        entityName="research project"
      />


    </PageTemplate>
  );
}