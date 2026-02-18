import { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { usePage, router } from '@inertiajs/react';
import { Plus, FileText, Quote, Calendar, User, Tag, ArrowLeft } from 'lucide-react';
import { hasPermission } from '@/utils/authorization';
import { CrudTable } from '@/components/CrudTable';
import { CrudFormModal } from '@/components/CrudFormModal';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { toast } from '@/components/custom-toast';
import { useTranslation } from 'react-i18next';
import { Pagination } from '@/components/ui/pagination';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';

export default function ViewResearchProject() {
  const { t } = useTranslation();
  const { auth, project, notes, citations, sources, filters: pageFilters = {} } = usePage().props as any;
  const permissions = auth?.permissions || [];

  const [activeTab, setActiveTab] = useState('notes');
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isCitationsModalOpen, setIsCitationsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [modalType, setModalType] = useState<'notes' | 'citations'>('notes');

  // Notes filters
  const [notesSearchTerm, setNotesSearchTerm] = useState(pageFilters.notes_search || '');
  const [notesPrivacy, setNotesPrivacy] = useState(pageFilters.notes_is_private || 'all');
  const [showNotesFilters, setShowNotesFilters] = useState(false);

  // Citations filters
  const [citationsSearchTerm, setCitationsSearchTerm] = useState(pageFilters.citations_search || '');
  const [citationsType, setCitationsType] = useState(pageFilters.citations_type || 'all');
  const [citationsSource, setCitationsSource] = useState(pageFilters.citations_source_id || 'all');
  const [showCitationsFilters, setShowCitationsFilters] = useState(false);

  const handleNotesAction = (action: string, item: any) => {
    setCurrentItem(item);
    setModalType('notes');
    switch (action) {
      case 'view':
        setFormMode('view');
        setIsNotesModalOpen(true);
        break;
      case 'edit':
        setFormMode('edit');
        setIsNotesModalOpen(true);
        break;
      case 'delete':
        setIsDeleteModalOpen(true);
        break;
    }
  };

  const handleCitationsAction = (action: string, item: any) => {
    setCurrentItem(item);
    setModalType('citations');
    switch (action) {
      case 'view':
        setFormMode('view');
        setIsCitationsModalOpen(true);
        break;
      case 'edit':
        setFormMode('edit');
        setIsCitationsModalOpen(true);
        break;
      case 'delete':
        setIsDeleteModalOpen(true);
        break;
    }
  };

  const handleAddNote = () => {
    setCurrentItem(null);
    setFormMode('create');
    setModalType('notes');
    setIsNotesModalOpen(true);
  };

  const handleAddCitation = () => {
    setCurrentItem(null);
    setFormMode('create');
    setModalType('citations');
    setIsCitationsModalOpen(true);
  };

  const handleNotesSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyNotesFilters();
  };

  const applyNotesFilters = () => {
    router.get(route('legal-research.projects.show', project.id), {
      notes_page: 1,
      notes_search: notesSearchTerm || undefined,
      notes_is_private: notesPrivacy !== 'all' ? notesPrivacy : undefined,
      citations_page: pageFilters.citations_page
    }, { preserveState: true, preserveScroll: true });
  };

  const handleCitationsSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyCitationsFilters();
  };

  const applyCitationsFilters = () => {
    router.get(route('legal-research.projects.show', project.id), {
      citations_page: 1,
      citations_search: citationsSearchTerm || undefined,
      citations_type: citationsType !== 'all' ? citationsType : undefined,
      citations_source_id: citationsSource !== 'all' ? citationsSource : undefined,
      notes_page: pageFilters.notes_page
    }, { preserveState: true, preserveScroll: true });
  };

  const handleNotesSubmit = (formData: any) => {
    // Convert tags string to array
    if (formData.tags && typeof formData.tags === 'string') {
      formData.tags = formData.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean);
    }

    const data = { ...formData, research_project_id: project.id };
    const method = formMode === 'create' ? 'post' : 'put';
    const url = formMode === 'create' 
      ? route('legal-research.notes.store') 
      : route('legal-research.notes.update', currentItem.id);

    toast.loading(t(`${formMode === 'create' ? 'Creating' : 'Updating'} note...`));

    router[method](url, data, {
      onSuccess: (page) => {
        setIsNotesModalOpen(false);
        toast.dismiss();
        if (page.props.flash.success) {
          toast.success(page.props.flash.success);
        }
      },
      onError: (errors) => {
        toast.dismiss();
        toast.error(`Failed to save note: ${Object.values(errors).join(', ')}`);
      }
    });
  };

  const handleCitationsSubmit = (formData: any) => {
    const data = { ...formData, research_project_id: project.id };
    const method = formMode === 'create' ? 'post' : 'put';
    const url = formMode === 'create' 
      ? route('legal-research.citations.store') 
      : route('legal-research.citations.update', currentItem.id);

    toast.loading(t(`${formMode === 'create' ? 'Creating' : 'Updating'} citation...`));

    router[method](url, data, {
      onSuccess: (page) => {
        setIsCitationsModalOpen(false);
        toast.dismiss();
        if (page.props.flash.success) {
          toast.success(page.props.flash.success);
        }
      },
      onError: (errors) => {
        toast.dismiss();
        toast.error(`Failed to save citation: ${Object.values(errors).join(', ')}`);
      }
    });
  };

  const handleDeleteConfirm = () => {
    const route_name = modalType === 'notes' ? 'legal-research.notes.destroy' : 'legal-research.citations.destroy';
    
    toast.loading(t(`Deleting ${modalType.slice(0, -1)}...`));
    router.delete(route(route_name, currentItem.id), {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        toast.dismiss();
        toast.success(t(`${modalType.slice(0, -1)} deleted successfully`));
      },
      onError: (errors) => {
        toast.dismiss();
        toast.error(`Failed to delete ${modalType.slice(0, -1)}: ${Object.values(errors).join(', ')}`);
      }
    });
  };

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Legal Research') },
    { title: t('Research Projects'), href: route('legal-research.projects.index') },
    { title: project?.title || t('View Project') }
  ];

  const notesColumns = [
    { key: 'title', label: t('Title'), sortable: true },
    { key: 'note_content', label: t('Content'), render: (value: string) => value?.substring(0, 50) + '...' || '-' },
    { key: 'source_reference', label: t('Source Reference'), render: (value: string) => value || '-' },
    { key: 'tags', label: t('Tags'), render: (value: string[]) => (
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
    )},
    { key: 'created_at', label: t('Created'), 
        type: 'date', }
  ];

  const citationsColumns = [
    {
      key: 'citation_text',
      label: t('Citation'),
      sortable: true,
      render: (value: string) => (
        <span className=" text-sm">{value}</span>
      )
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
    { key: 'source', label: t('Source'), render: (value: any) => value?.source_name || '-' },
    { key: 'page_number', label: t('Page'), render: (value: string) => value || '-' },
    { key: 'created_at', label: t('Created'), 
        type: 'date', }
  ];

  const actions = [
    { label: t('View'), icon: 'Eye', action: 'view', className: 'text-blue-500' },
    { label: t('Edit'), icon: 'Edit', action: 'edit', className: 'text-amber-500' },
    { label: t('Delete'), icon: 'Trash2', action: 'delete', className: 'text-red-500' }
  ];

  return (
    <PageTemplate
      title={project?.title || t('Research Project')}
      url={`/legal-research/projects/${project?.id}`}
      breadcrumbs={breadcrumbs}
      actions={[
        {
          label: t('Back to Projects'),
          icon: <ArrowLeft className="h-4 w-4 mr-2" />,
          variant: 'outline',
          onClick: () => router.get(route('legal-research.projects.index'))
        }
      ]}
      noPadding
    >
      {/* Project Details */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow mb-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('Project ID')}</label>
            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{project?.research_id}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('Research Type')}</label>
            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{project?.research_type?.name || '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('Associated Case')}</label>
            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{project?.case?.title || t('No Case')}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('Priority')}</label>
            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{project?.priority ? t(project.priority.charAt(0).toUpperCase() + project.priority.slice(1)) : '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('Status')}</label>
            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{project?.status ? t(project.status.replace('_', ' ').replace(/\\b\\w/g, l => l.toUpperCase())) : '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('Due Date')}</label>
            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{project?.due_date ? (window.appSettings?.formatDate(project.due_date) || new Date(project.due_date).toLocaleDateString()) : '-'}</p>
          </div>
          {project?.description && (
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('Description')}</label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{project.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('notes')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${activeTab === 'notes' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <FileText className="h-4 w-4 inline mr-2" />
              {t('Research Notes')}
            </button>
            <button
              onClick={() => setActiveTab('citations')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${activeTab === 'citations' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <Quote className="h-4 w-4 inline mr-2" />
              {t('Research Citations')}
            </button>
          </nav>
        </div>

        <div className="p-4">
          {activeTab === 'notes' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">{t('Research Notes')}</h3>
                {hasPermission(permissions, 'create-research-notes') && (
                  <button
                    onClick={handleAddNote}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t('Add Note')}
                  </button>
                )}
              </div>
              <div className="mb-6">
                <SearchAndFilterBar
                  searchTerm={notesSearchTerm}
                  onSearchChange={setNotesSearchTerm}
                  onSearch={handleNotesSearch}
                  filters={[
                    {
                      name: 'notes_is_private',
                      label: t('Privacy'),
                      type: 'select',
                      value: notesPrivacy,
                      onChange: setNotesPrivacy,
                      options: [
                        { value: 'all', label: t('All Notes') },
                        { value: '0', label: t('Shared') },
                        { value: '1', label: t('Private') }
                      ]
                    }
                  ]}
                  showFilters={showNotesFilters}
                  setShowFilters={setShowNotesFilters}
                  hasActiveFilters={() => notesSearchTerm !== '' || notesPrivacy !== 'all'}
                  activeFilterCount={() => (notesSearchTerm ? 1 : 0) + (notesPrivacy !== 'all' ? 1 : 0)}
                  onResetFilters={() => {
                    setNotesSearchTerm('');
                    setNotesPrivacy('all');
                    setShowNotesFilters(false);
                    router.get(route('legal-research.projects.show', project.id), { notes_page: 1 });
                  }}
                  onApplyFilters={applyNotesFilters}
                />
              </div>
              <CrudTable
                columns={notesColumns}
                actions={actions}
                data={notes?.data || []}
                from={notes?.from || 1}
                onAction={handleNotesAction}
                permissions={permissions}
                entityPermissions={{
                  edit: 'edit-research-notes',
                  delete: 'delete-research-notes'
                }}
              />
              {notes?.links && (
                <Pagination
                  from={notes?.from || 0}
                  to={notes?.to || 0}
                  total={notes?.total || 0}
                  links={notes?.links}
                  entityName={t("notes")}
                  onPageChange={(url) => router.get(url)}
                />
              )}
            </div>
          )}

          {activeTab === 'citations' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">{t('Research Citations')}</h3>
                {hasPermission(permissions, 'create-research-citations') && (
                  <button
                    onClick={handleAddCitation}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t('Add Citation')}
                  </button>
                )}
              </div>
              <div className="mb-6">
                <SearchAndFilterBar
                  searchTerm={citationsSearchTerm}
                  onSearchChange={setCitationsSearchTerm}
                  onSearch={handleCitationsSearch}
                  filters={[
                    {
                      name: 'citations_type',
                      label: t('Citation Type'),
                      type: 'select',
                      value: citationsType,
                      onChange: setCitationsType,
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
                      name: 'citations_source_id',
                      label: t('Source'),
                      type: 'select',
                      value: citationsSource,
                      onChange: setCitationsSource,
                      options: [
                        { value: 'all', label: t('All Sources') },
                        ...(sources || []).map((source: any) => ({ value: source.id.toString(), label: source.source_name }))
                      ]
                    }
                  ]}
                  showFilters={showCitationsFilters}
                  setShowFilters={setShowCitationsFilters}
                  hasActiveFilters={() => citationsSearchTerm !== '' || citationsType !== 'all' || citationsSource !== 'all'}
                  activeFilterCount={() => (citationsSearchTerm ? 1 : 0) + (citationsType !== 'all' ? 1 : 0) + (citationsSource !== 'all' ? 1 : 0)}
                  onResetFilters={() => {
                    setCitationsSearchTerm('');
                    setCitationsType('all');
                    setCitationsSource('all');
                    setShowCitationsFilters(false);
                    router.get(route('legal-research.projects.show', project.id), { citations_page: 1 });
                  }}
                  onApplyFilters={applyCitationsFilters}
                />
              </div>
              <CrudTable
                columns={citationsColumns}
                actions={actions}
                data={citations?.data || []}
                from={citations?.from || 1}
                onAction={handleCitationsAction}
                permissions={permissions}
                entityPermissions={{
                  edit: 'edit-research-citations',
                  delete: 'delete-research-citations'
                }}
              />
              {citations?.links && (
                <Pagination
                  from={citations?.from || 0}
                  to={citations?.to || 0}
                  total={citations?.total || 0}
                  links={citations?.links}
                  entityName={t("citations")}
                  onPageChange={(url) => router.get(url)}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Notes Modal */}
      <CrudFormModal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        onSubmit={handleNotesSubmit}
        formConfig={{
          fields: [
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
            ? t('Add Research Note')
            : formMode === 'edit'
              ? t('Edit Research Note')
              : t('View Research Note')
        }
        mode={formMode}
      />

      {/* Citations Modal */}
      <CrudFormModal
        isOpen={isCitationsModalOpen}
        onClose={() => setIsCitationsModalOpen(false)}
        onSubmit={handleCitationsSubmit}
        formConfig={{
          fields: [
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
              type: formMode === 'view' ? 'text' : 'select',
              options: formMode === 'view' ? undefined : [
                { value: null, label: t('No Source') },
                ...(sources || []).map((source: any) => ({ value: source.id, label: source.source_name }))
              ],
              readOnly: formMode === 'view'
            },
            { name: 'page_number', label: t('Page Number'), type: 'text' },
            { name: 'notes', label: t('Notes'), type: 'textarea', rows: 3 }
          ],
          modalSize: 'lg'
        }}
        initialData={currentItem ? {
          ...currentItem,
          source_id: currentItem.source?.source_name || currentItem.source_id
        } : null}
        title={
          formMode === 'create'
            ? t('Add Research Citation')
            : formMode === 'edit'
              ? t('Edit Research Citation')
              : t('View Research Citation')
        }
        mode={formMode}
      />

      {/* Delete Modal */}
      <CrudDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={currentItem?.citation_text || currentItem?.title || ''}
        entityName={modalType.slice(0, -1)}
      />
    </PageTemplate>
  );
}