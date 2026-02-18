import { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { usePage, router } from '@inertiajs/react';
import { Plus, Quote, FileText } from 'lucide-react';
import { hasPermission } from '@/utils/authorization';
import { CrudTable } from '@/components/CrudTable';
import { CrudFormModal } from '@/components/CrudFormModal';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { toast } from '@/components/custom-toast';
import { useTranslation } from 'react-i18next';
import { Pagination } from '@/components/ui/pagination';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';

export default function ResearchCitations() {
  const { t } = useTranslation();
  const { auth, citations, projects, sources, filters: pageFilters = {} } = usePage().props as any;
  const permissions = auth?.permissions || [];

  const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
  const [selectedProject, setSelectedProject] = useState(pageFilters.research_project_id || 'all');
  const [selectedType, setSelectedType] = useState(pageFilters.citation_type || 'all');
  const [selectedSource, setSelectedSource] = useState(pageFilters.source_id || 'all');
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
    router.get(route('legal-research.citations.index'), {
      page: 1,
      search: searchTerm || undefined,
      research_project_id: selectedProject !== 'all' ? selectedProject : undefined,
      citation_type: selectedType !== 'all' ? selectedType : undefined,
      source_id: selectedSource !== 'all' ? selectedSource : undefined,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const handleSort = (field: string) => {
    const direction = pageFilters.sort_field === field && pageFilters.sort_direction === 'asc' ? 'desc' : 'asc';
    router.get(route('legal-research.citations.index'), {
      sort_field: field,
      sort_direction: direction,
      page: 1,
      search: searchTerm || undefined,
      research_project_id: selectedProject !== 'all' ? selectedProject : undefined,
      citation_type: selectedType !== 'all' ? selectedType : undefined,
      source_id: selectedSource !== 'all' ? selectedSource : undefined,
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
    const action = formMode === 'create' ? 'store' : 'update';
    const route_name = formMode === 'create' 
      ? 'legal-research.citations.store' 
      : 'legal-research.citations.update';
    
    toast.loading(t(`${formMode === 'create' ? 'Creating' : 'Updating'} research citation...`));

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
        toast.error(`Failed to ${action} research citation: ${Object.values(errors).join(', ')}`);
      }
    });
  };

  const handleDeleteConfirm = () => {
    toast.loading(t('Deleting research citation...'));
    router.delete(route('legal-research.citations.destroy', currentItem.id), {
      onSuccess: (page) => {
        setIsDeleteModalOpen(false);
        toast.dismiss();
        if (page.props.flash.success) {
          toast.success(page.props.flash.success);
        }
      },
      onError: (errors) => {
        toast.dismiss();
        toast.error(`Failed to delete research citation: ${Object.values(errors).join(', ')}`);
      }
    });
  };

  const pageActions = [];
  if (hasPermission(permissions, 'create-research-citations')) {
    pageActions.push({
      label: t('Add Citation'),
      icon: <Plus className="h-4 w-4 mr-2" />,
      variant: 'default',
      onClick: () => handleAddNew()
    });
  }

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Legal Research') },
    { title: t('Research Citations') }
  ];

  const columns = [
    {
      key: 'citation_text',
      label: t('Citation'),
      sortable: true,
      render: (value: string) => (
        <div className="flex items-start gap-2">
          <Quote className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
          <span className=" text-sm">{value}</span>
        </div>
      )
    },
    {
      key: 'research_project',
      label: t('Research Project'),
      render: (value: any) => value?.title || '-'
    },
    {
      key: 'citation_type',
      label: t('Type'),
      render: (value: string) => {
        const typeColors = {
          case: 'bg-blue-50 text-blue-700 ring-blue-600/20',
          statute: 'bg-green-50 text-green-700 ring-green-600/20',
          article: 'bg-purple-50 text-purple-700 ring-purple-600/20',
          book: 'bg-orange-50 text-orange-700 ring-orange-600/20',
          website: 'bg-cyan-50 text-cyan-700 ring-cyan-600/20',
          other: 'bg-gray-50 text-gray-700 ring-gray-600/20'
        };
        
        return (
          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${typeColors[value as keyof typeof typeColors] || typeColors.other}`}>
            {t(value.charAt(0).toUpperCase() + value.slice(1))}
          </span>
        );
      }
    },
    {
      key: 'source',
      label: t('Source'),
      render: (value: any) => value?.source_name || '-'
    },
    {
      key: 'page_number',
      label: t('Page'),
      render: (value: string) => (
        <div className="flex items-center gap-2">
          {value && <FileText className="h-4 w-4 text-gray-500" />}
          <span>{value || '-'}</span>
        </div>
      )
    },
    {
      key: 'notes',
      label: t('Notes'),
      render: (value: string) => (
        <div className="max-w-xs truncate" title={value}>
          {value || '-'}
        </div>
      )
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
      requiredPermission: 'view-research-citations'
    },
    {
      label: t('Edit'),
      icon: 'Edit',
      action: 'edit',
      className: 'text-amber-500',
      requiredPermission: 'edit-research-citations'
    },
    {
      label: t('Delete'),
      icon: 'Trash2',
      action: 'delete',
      className: 'text-red-500',
      requiredPermission: 'delete-research-citations'
    }
  ];

  const projectOptions = [
    { value: 'all', label: t('All Projects') },
    ...(projects || []).map((project: any) => ({ value: project.id.toString(), label: project.title }))
  ];

  const sourceOptions = [
    { value: 'all', label: t('All Sources') },
    ...(sources || []).map((source: any) => ({ value: source.id.toString(), label: source.source_name }))
  ];

  return (
    <PageTemplate
      title={t("Research Citations")}
      url="/legal-research/citations"
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
              name: 'citation_type',
              label: t('Citation Type'),
              type: 'select',
              value: selectedType,
              onChange: setSelectedType,
              options: [
                { value: 'all', label: t('All Types') },
                { value: 'case', label: t('Case') },
                { value: 'statute', label: t('Statute') },
                { value: 'article', label: t('Article') },
                { value: 'book', label: t('Book') },
                { value: 'website', label: t('Website') },
                { value: 'other', label: t('Other') }
              ]
            },
            {
              name: 'source_id',
              label: t('Source'),
              type: 'select',
              value: selectedSource,
              onChange: setSelectedSource,
              options: sourceOptions
            }
          ]}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          hasActiveFilters={() => searchTerm !== '' || selectedProject !== 'all' || selectedType !== 'all' || selectedSource !== 'all'}
          activeFilterCount={() => (searchTerm ? 1 : 0) + (selectedProject !== 'all' ? 1 : 0) + (selectedType !== 'all' ? 1 : 0) + (selectedSource !== 'all' ? 1 : 0)}
          onResetFilters={() => {
            setSearchTerm('');
            setSelectedProject('all');
            setSelectedType('all');
            setSelectedSource('all');
            setShowFilters(false);
            router.get(route('legal-research.citations.index'), { page: 1, per_page: pageFilters.per_page });
          }}
          onApplyFilters={applyFilters}
          currentPerPage={pageFilters.per_page?.toString() || "10"}
          onPerPageChange={(value) => {
            router.get(route('legal-research.citations.index'), {
              page: 1,
              per_page: parseInt(value),
              search: searchTerm || undefined,
              research_project_id: selectedProject !== 'all' ? selectedProject : undefined,
              citation_type: selectedType !== 'all' ? selectedType : undefined,
              source_id: selectedSource !== 'all' ? selectedSource : undefined
            });
          }}
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        <CrudTable
          columns={columns}
          actions={actions}
          data={citations?.data || []}
          from={citations?.from || 1}
          onAction={handleAction}
          sortField={pageFilters.sort_field}
          sortDirection={pageFilters.sort_direction}
          onSort={handleSort}
          permissions={permissions}
          entityPermissions={{
            view: 'view-research-citations',
            create: 'create-research-citations',
            edit: 'edit-research-citations',
            delete: 'delete-research-citations'
          }}
        />

        <Pagination
          from={citations?.from || 0}
          to={citations?.to || 0}
          total={citations?.total || 0}
          links={citations?.links}
          entityName={t("research citations")}
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
            { name: 'citation_text', label: t('Citation Text'), type: 'textarea', required: true, rows: 3 },
            {
              name: 'citation_type',
              label: t('Citation Type'),
              type: 'select',
              required: true,
              options: [
                { value: 'case', label: t('Case') },
                { value: 'statute', label: t('Statute') },
                { value: 'article', label: t('Article') },
                { value: 'book', label: t('Book') },
                { value: 'website', label: t('Website') },
                { value: 'other', label: t('Other') }
              ]
            },
            { 
              name: 'source_id', 
              label: t('Source'), 
              type: 'select',
              options: [
                { value: null, label: t('No Source') },
                ...(sources || []).map((source: any) => ({ value: source.id, label: source.source_name }))
              ]
            },
            { name: 'page_number', label: t('Page Number'), type: 'text' },
            { name: 'notes', label: t('Notes'), type: 'textarea', rows: 3 }
          ],
          modalSize: 'lg'
        }}
        initialData={currentItem}
        title={
          formMode === 'create'
            ? t('Add New Research Citation')
            : formMode === 'edit'
              ? t('Edit Research Citation')
              : t('View Research Citation')
        }
        mode={formMode}
      />

      <CrudDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={currentItem?.citation_text || ''}
        entityName="research citation"
      />
    </PageTemplate>
  );
}