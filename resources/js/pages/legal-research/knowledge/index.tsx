import { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { usePage, router } from '@inertiajs/react';
import { Plus, BookOpen, Globe, Lock } from 'lucide-react';
import { hasPermission } from '@/utils/authorization';
import { CrudTable } from '@/components/CrudTable';
import { CrudFormModal } from '@/components/CrudFormModal';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { toast } from '@/components/custom-toast';
import { useTranslation } from 'react-i18next';
import { Pagination } from '@/components/ui/pagination';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';

export default function KnowledgeArticles() {
  const { t } = useTranslation();
  const { auth, articles, categories, filters: pageFilters = {} } = usePage().props as any;
  const permissions = auth?.permissions || [];

  const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
  const [selectedCategory, setSelectedCategory] = useState(pageFilters.category_id || 'all');
  const [selectedStatus, setSelectedStatus] = useState(pageFilters.status || 'all');
  const [selectedPublic, setSelectedPublic] = useState(pageFilters.is_public || 'all');
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
    router.get(route('legal-research.knowledge.index'), {
      page: 1,
      search: searchTerm || undefined,
      category_id: selectedCategory !== 'all' ? selectedCategory : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      is_public: selectedPublic !== 'all' ? selectedPublic : undefined,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const handleSort = (field: string) => {
    const direction = pageFilters.sort_field === field && pageFilters.sort_direction === 'asc' ? 'desc' : 'asc';
    router.get(route('legal-research.knowledge.index'), {
      sort_field: field,
      sort_direction: direction,
      page: 1,
      search: searchTerm || undefined,
      category_id: selectedCategory !== 'all' ? selectedCategory : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      is_public: selectedPublic !== 'all' ? selectedPublic : undefined,
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
      case 'publish':
        handlePublish(item);
        break;
    }
  };

  const handleAddNew = () => {
    setCurrentItem(null);
    setFormMode('create');
    setIsFormModalOpen(true);
  };

  const handlePublish = (article: any) => {
    const newStatus = article.status === 'published' ? 'draft' : 'published';
    toast.loading(`${newStatus === 'published' ? t('Publishing') : t('Unpublishing')} article...`);

    router.put(route('legal-research.knowledge.publish', article.id), {}, {
      onSuccess: (page) => {
        toast.dismiss();
        if (page.props.flash.success) {
          toast.success(page.props.flash.success);
        }
      },
      onError: (errors) => {
        toast.dismiss();
        toast.error(`Failed to update article status: ${Object.values(errors).join(', ')}`);
      }
    });
  };

  const handleFormSubmit = (formData: any) => {
    // Convert tags string to array
    if (formData.tags && typeof formData.tags === 'string') {
      formData.tags = formData.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean);
    }

    const action = formMode === 'create' ? 'store' : 'update';
    const route_name = formMode === 'create' 
      ? 'legal-research.knowledge.store' 
      : 'legal-research.knowledge.update';
    
    toast.loading(t(`${formMode === 'create' ? 'Creating' : 'Updating'} knowledge article...`));

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
        toast.error(`Failed to ${action} knowledge article: ${Object.values(errors).join(', ')}`);
      }
    });
  };

  const handleDeleteConfirm = () => {
    toast.loading(t('Deleting knowledge article...'));
    router.delete(route('legal-research.knowledge.destroy', currentItem.id), {
      onSuccess: (page) => {
        setIsDeleteModalOpen(false);
        toast.dismiss();
        if (page.props.flash.success) {
          toast.success(page.props.flash.success);
        }
      },
      onError: (errors) => {
        toast.dismiss();
        toast.error(`Failed to delete knowledge article: ${Object.values(errors).join(', ')}`);
      }
    });
  };

  const pageActions = [];
  if (hasPermission(permissions, 'create-knowledge-articles')) {
    pageActions.push({
      label: t('Add Article'),
      icon: <Plus className="h-4 w-4 mr-2" />,
      variant: 'default',
      onClick: () => handleAddNew()
    });
  }

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Legal Research') },
    { title: t('Knowledge Base') }
  ];

  const columns = [
    {
      key: 'title',
      label: t('Title'),
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'category',
      label: t('Category'),
      render: (value: any) => value?.name || '-'
    },
    {
      key: 'tags',
      label: t('Tags'),
      render: (value: string[]) => (
        <div className="flex flex-wrap gap-1">
          {(value || []).slice(0, 3).map((tag, index) => (
            <span key={index} className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20">
              {tag}
            </span>
          ))}
          {(value || []).length > 3 && (
            <span className="text-xs text-gray-500">+{(value || []).length - 3} more</span>
          )}
        </div>
      )
    },
    {
      key: 'is_public',
      label: t('Visibility'),
      render: (value: boolean) => (
        <div className="flex items-center gap-2">
          {value ? t('Public') : t('Private')}
        </div>
      )
    },
    {
      key: 'status',
      label: t('Status'),
      render: (value: string) => {
        const statusColors = {
          draft: 'bg-gray-50 text-gray-700 ring-gray-600/20',
          published: 'bg-green-50 text-green-700 ring-green-600/20',
          archived: 'bg-red-50 text-red-700 ring-red-600/20'
        };
        
        return (
          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${statusColors[value as keyof typeof statusColors] || statusColors.draft}`}>
            {t(value.charAt(0).toUpperCase() + value.slice(1))}
          </span>
        );
      }
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
      requiredPermission: 'view-knowledge-articles'
    },
    {
      label: t('Edit'),
      icon: 'Edit',
      action: 'edit',
      className: 'text-amber-500',
      requiredPermission: 'edit-knowledge-articles'
    },
    {
      label: t('Publish/Unpublish'),
      icon: 'Globe',
      action: 'toggle-status',
      className: 'text-green-500',
      requiredPermission: 'publish-knowledge-articles'
    },
    {
      label: t('Delete'),
      icon: 'Trash2',
      action: 'delete',
      className: 'text-red-500',
      requiredPermission: 'delete-knowledge-articles'
    }
  ];

  const categoryOptions = [
    { value: 'all', label: t('All Categories') },
    ...(categories || []).map((cat: any) => ({ value: cat.id.toString(), label: cat.name }))
  ];

  return (
    <PageTemplate
      title={t("Knowledge Base")}
      url="/legal-research/knowledge"
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
              name: 'category_id',
              label: t('Category'),
              type: 'select',
              value: selectedCategory,
              onChange: setSelectedCategory,
              options: categoryOptions
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
                { value: 'published', label: t('Published') },
                { value: 'archived', label: t('Archived') }
              ]
            },
            {
              name: 'is_public',
              label: t('Visibility'),
              type: 'select',
              value: selectedPublic,
              onChange: setSelectedPublic,
              options: [
                { value: 'all', label: t('All') },
                { value: '1', label: t('Public') },
                { value: '0', label: t('Private') }
              ]
            }
          ]}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          hasActiveFilters={() => searchTerm !== '' || selectedCategory !== 'all' || selectedStatus !== 'all' || selectedPublic !== 'all'}
          activeFilterCount={() => (searchTerm ? 1 : 0) + (selectedCategory !== 'all' ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0) + (selectedPublic !== 'all' ? 1 : 0)}
          onResetFilters={() => {
            setSearchTerm('');
            setSelectedCategory('all');
            setSelectedStatus('all');
            setSelectedPublic('all');
            setShowFilters(false);
            router.get(route('legal-research.knowledge.index'), { page: 1, per_page: pageFilters.per_page });
          }}
          onApplyFilters={applyFilters}
          currentPerPage={pageFilters.per_page?.toString() || "10"}
          onPerPageChange={(value) => {
            router.get(route('legal-research.knowledge.index'), {
              page: 1,
              per_page: parseInt(value),
              search: searchTerm || undefined,
              category_id: selectedCategory !== 'all' ? selectedCategory : undefined,
              status: selectedStatus !== 'all' ? selectedStatus : undefined,
              is_public: selectedPublic !== 'all' ? selectedPublic : undefined
            });
          }}
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        <CrudTable
          columns={columns}
          actions={actions}
          data={articles?.data || []}
          from={articles?.from || 1}
          onAction={handleAction}
          sortField={pageFilters.sort_field}
          sortDirection={pageFilters.sort_direction}
          onSort={handleSort}
          permissions={permissions}
          entityPermissions={{
            view: 'view-knowledge-articles',
            create: 'create-knowledge-articles',
            edit: 'edit-knowledge-articles',
            delete: 'delete-knowledge-articles'
          }}
        />

        <Pagination
          from={articles?.from || 0}
          to={articles?.to || 0}
          total={articles?.total || 0}
          links={articles?.links}
          entityName={t("knowledge articles")}
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
            { name: 'title', label: t('Title'), type: 'text', required: true },
            { 
              name: 'category_id', 
              label: t('Category'), 
              type: 'select',
              options: [
                ...(categories || []).map((cat: any) => ({ value: cat.id, label: cat.name }))
              ]
            },
            { name: 'content', label: t('Content'), type: 'textarea', required: true, rows: 10 },
            { name: 'tags', label: t('Tags'), type: 'text', placeholder: 'Enter tags separated by commas (e.g., contract, law, precedent)' },
            {
              name: 'is_public',
              label: t('Make Public'),
              type: 'checkbox',
              defaultValue: false
            },
            {
              name: 'status',
              label: t('Status'),
              type: 'select',
              options: [
                { value: 'draft', label: t('Draft') },
                { value: 'published', label: t('Published') },
                { value: 'archived', label: t('Archived') }
              ],
              defaultValue: 'draft'
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
            ? t('Add New Knowledge Article')
            : t('Edit Knowledge Article')
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
            { name: 'title', label: t('Title'), type: 'text' },
            {
              name: 'category',
              label: t('Category'),
              type: 'text',
              render: () => {
                return <div className="rounded-md border bg-gray-50 p-2">
                  {currentItem?.category?.name || t('No Category')}
                </div>;
              }
            },
            { name: 'content', label: t('Content'), type: 'textarea', rows: 10 },
            {
              name: 'tags_display',
              label: t('Tags'),
              type: 'text',
              render: () => {
                const tags = currentItem?.tags || [];
                return <div className="rounded-md border bg-gray-50 p-2">
                  {tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {tags.map((tag: string, index: number) => (
                        <span key={index} className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : t('No tags')}
                </div>;
              }
            },
            {
              name: 'is_public',
              label: t('Visibility'),
              type: 'text',
              render: () => {
                const isPublic = currentItem?.is_public;
                return <div className="rounded-md border bg-gray-50 p-2">
                  {isPublic ? t('Public') : t('Private')}
                </div>;
              }
            },
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
            { name: 'created_at', label: t('Created At'), type: 'text' },
            { name: 'updated_at', label: t('Updated At'), type: 'text' }
          ],
          modalSize: 'xl'
        }}
        initialData={currentItem}
        title={t('View Knowledge Article')}
        mode="view"
      />

      <CrudDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={currentItem?.title || ''}
        entityName="knowledge article"
      />
    </PageTemplate>
  );
}