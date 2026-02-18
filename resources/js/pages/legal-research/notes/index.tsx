import { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { usePage, router } from '@inertiajs/react';
import { Plus, StickyNote, Lock, Globe } from 'lucide-react';
import { hasPermission } from '@/utils/authorization';
import { CrudTable } from '@/components/CrudTable';
import { CrudFormModal } from '@/components/CrudFormModal';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { toast } from '@/components/custom-toast';
import { useTranslation } from 'react-i18next';
import { Pagination } from '@/components/ui/pagination';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';

export default function ResearchNotes() {
  const { t } = useTranslation();
  const { auth, notes, projects, filters: pageFilters = {} } = usePage().props as any;
  const permissions = auth?.permissions || [];

  const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
  const [selectedProject, setSelectedProject] = useState(pageFilters.research_project_id || 'all');
  const [selectedPrivacy, setSelectedPrivacy] = useState(pageFilters.is_private || 'all');
  const [showFilters, setShowFilters] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const applyFilters = () => {
    router.get(route('legal-research.notes.index'), {
      page: 1,
      search: searchTerm || undefined,
      research_project_id: selectedProject !== 'all' ? selectedProject : undefined,
      is_private: selectedPrivacy !== 'all' ? selectedPrivacy : undefined,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const handleSort = (field: string) => {
    const direction = pageFilters.sort_field === field && pageFilters.sort_direction === 'asc' ? 'desc' : 'asc';
    router.get(route('legal-research.notes.index'), {
      sort_field: field,
      sort_direction: direction,
      page: 1,
      search: searchTerm || undefined,
      research_project_id: selectedProject !== 'all' ? selectedProject : undefined,
      is_private: selectedPrivacy !== 'all' ? selectedPrivacy : undefined,
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
    // Convert tags string to array
    if (formData.tags && typeof formData.tags === 'string') {
      formData.tags = formData.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean);
    }

    const action = formMode === 'create' ? 'store' : 'update';
    const route_name = formMode === 'create' 
      ? 'legal-research.notes.store' 
      : 'legal-research.notes.update';
    
    toast.loading(t(`${formMode === 'create' ? 'Creating' : 'Updating'} research note...`));

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
        toast.error(`Failed to ${action} research note: ${Object.values(errors).join(', ')}`);
      }
    });
  };

  const handleDeleteConfirm = () => {
    toast.loading(t('Deleting research note...'));
    router.delete(route('legal-research.notes.destroy', currentItem.id), {
      onSuccess: (page) => {
        setIsDeleteModalOpen(false);
        toast.dismiss();
        if (page.props.flash.success) {
          toast.success(page.props.flash.success);
        }
      },
      onError: (errors) => {
        toast.dismiss();
        toast.error(`Failed to delete research note: ${Object.values(errors).join(', ')}`);
      }
    });
  };

  const pageActions = [];
  if (hasPermission(permissions, 'create-research-notes')) {
    pageActions.push({
      label: t('Add Research Note'),
      icon: <Plus className="h-4 w-4 mr-2" />,
      variant: 'default',
      onClick: () => handleAddNew()
    });
  }

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Legal Research') },
    { title: t('Research Notes') }
  ];

  const columns = [
    {
      key: 'title',
      label: t('Title'),
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <StickyNote className="h-4 w-4 text-yellow-500" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'research_project',
      label: t('Research Project'),
      render: (value: any) => value?.title || '-'
    },
    {
      key: 'source_reference',
      label: t('Source Reference'),
      render: (value: string) => (
        <div className="max-w-xs truncate" title={value}>
          {value || '-'}
        </div>
      )
    },
    {
      key: 'tags',
      label: t('Tags'),
      render: (value: string[]) => (
        <div className="flex flex-wrap gap-1">
          {(value || []).slice(0, 2).map((tag, index) => (
            <span key={index} className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20">
              {tag}
            </span>
          ))}
          {(value || []).length > 2 && (
            <span className="text-xs text-gray-500">+{(value || []).length - 2} more</span>
          )}
        </div>
      )
    },
    {
      key: 'is_private',
      label: t('Privacy'),
      render: (value: boolean) => (
        <div className="flex items-center gap-2">
          {value ? (
            <>
              <Lock className="h-4 w-4 text-red-500" />
              <span className="text-red-700">{t('Private')}</span>
            </>
          ) : (
            <>
              <Globe className="h-4 w-4 text-green-500" />
              <span className="text-green-700">{t('Shared')}</span>
            </>
          )}
        </div>
      )
    },
    {
      key: 'creator',
      label: t('Created By'),
      render: (value: any) => value?.name || '-'
    },
    {
      key: 'created_at',
      label: t('Created'),
        type: 'date',
    }
  ];

  const actions = [
    {
      label: t('View'),
      icon: 'Eye',
      action: 'view',
      className: 'text-blue-500',
      requiredPermission: 'view-research-notes'
    },
    {
      label: t('Edit'),
      icon: 'Edit',
      action: 'edit',
      className: 'text-amber-500',
      requiredPermission: 'edit-research-notes'
    },
    {
      label: t('Delete'),
      icon: 'Trash2',
      action: 'delete',
      className: 'text-red-500',
      requiredPermission: 'delete-research-notes'
    }
  ];

  const projectOptions = [
    { value: 'all', label: t('All Projects') },
    ...(projects || []).map((project: any) => ({ value: project.id.toString(), label: project.title }))
  ];

  return (
    <PageTemplate
      title={t("Research Notes")}
      url="/legal-research/notes"
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
              name: 'research_project_id',
              label: t('Research Project'),
              type: 'select',
              value: selectedProject,
              onChange: setSelectedProject,
              options: projectOptions
            },
            {
              name: 'is_private',
              label: t('Privacy'),
              type: 'select',
              value: selectedPrivacy,
              onChange: setSelectedPrivacy,
              options: [
                { value: 'all', label: t('All Notes') },
                { value: '0', label: t('Shared') },
                { value: '1', label: t('Private') }
              ]
            }
          ]}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          hasActiveFilters={() => searchTerm !== '' || selectedProject !== 'all' || selectedPrivacy !== 'all'}
          activeFilterCount={() => (searchTerm ? 1 : 0) + (selectedProject !== 'all' ? 1 : 0) + (selectedPrivacy !== 'all' ? 1 : 0)}
          onResetFilters={() => {
            setSearchTerm('');
            setSelectedProject('all');
            setSelectedPrivacy('all');
            setShowFilters(false);
            router.get(route('legal-research.notes.index'), { page: 1, per_page: pageFilters.per_page });
          }}
          onApplyFilters={applyFilters}
          currentPerPage={pageFilters.per_page?.toString() || "10"}
          onPerPageChange={(value) => {
            router.get(route('legal-research.notes.index'), {
              page: 1,
              per_page: parseInt(value),
              search: searchTerm || undefined,
              research_project_id: selectedProject !== 'all' ? selectedProject : undefined,
              is_private: selectedPrivacy !== 'all' ? selectedPrivacy : undefined
            });
          }}
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        <CrudTable
          columns={columns}
          actions={actions}
          data={notes?.data || []}
          from={notes?.from || 1}
          onAction={handleAction}
          sortField={pageFilters.sort_field}
          sortDirection={pageFilters.sort_direction}
          onSort={handleSort}
          permissions={permissions}
          entityPermissions={{
            view: 'view-research-notes',
            create: 'create-research-notes',
            edit: 'edit-research-notes',
            delete: 'delete-research-notes'
          }}
        />

        <Pagination
          from={notes?.from || 0}
          to={notes?.to || 0}
          total={notes?.total || 0}
          links={notes?.links}
          entityName={t("research notes")}
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
              name: 'research_project_id', 
              label: t('Research Project'), 
              type: 'select', 
              required: true,
              options: (projects || []).map((project: any) => ({ value: project.id, label: project.title }))
            },
            { name: 'title', label: t('Title'), type: 'text', required: true },
            { name: 'note_content', label: t('Note Content'), type: 'textarea', required: true, rows: 8 },
            { name: 'source_reference', label: t('Source Reference'), type: 'text' },
            { name: 'tags', label: t('Tags'), type: 'text', placeholder: 'Enter tags separated by commas (e.g., contract, precedent, analysis)' },
            {
              name: 'is_private',
              label: t('Make Private'),
              type: 'checkbox',
              defaultValue: false
            }
          ],
          modalSize: 'xl'
        }}
        initialData={currentItem ? {
          ...currentItem,
          tags: currentItem.tags ? currentItem.tags.join(', ') : ''
        } : null}
        title={
          formMode === 'create'
            ? t('Add New Research Note')
            : formMode === 'edit'
              ? t('Edit Research Note')
              : t('View Research Note')
        }
        mode={formMode}
      />

      <CrudDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={currentItem?.title || ''}
        entityName="research note"
      />
    </PageTemplate>
  );
}