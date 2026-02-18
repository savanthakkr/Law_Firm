import { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { usePage, router } from '@inertiajs/react';
import { Plus, Scale, Star, Calendar } from 'lucide-react';
import { hasPermission } from '@/utils/authorization';
import { CrudTable } from '@/components/CrudTable';
import { CrudFormModal } from '@/components/CrudFormModal';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { toast } from '@/components/custom-toast';
import { useTranslation } from 'react-i18next';
import { Pagination } from '@/components/ui/pagination';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';

export default function LegalPrecedents() {
  const { t } = useTranslation();
  const { auth, precedents, categories, jurisdictions, filters: pageFilters = {} } = usePage().props as any;
  const permissions = auth?.permissions || [];

  const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
  const [selectedCategory, setSelectedCategory] = useState(pageFilters.category_id || 'all');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState(pageFilters.jurisdiction || 'all');
  const [selectedStatus, setSelectedStatus] = useState(pageFilters.status || 'all');
  const [selectedRelevance, setSelectedRelevance] = useState(pageFilters.relevance_score || 'all');
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
    router.get(route('legal-research.precedents.index'), {
      page: 1,
      search: searchTerm || undefined,
      category_id: selectedCategory !== 'all' ? selectedCategory : undefined,
      jurisdiction: selectedJurisdiction !== 'all' ? selectedJurisdiction : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      relevance_score: selectedRelevance !== 'all' ? selectedRelevance : undefined,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const handleSort = (field: string) => {
    const direction = pageFilters.sort_field === field && pageFilters.sort_direction === 'asc' ? 'desc' : 'asc';
    router.get(route('legal-research.precedents.index'), {
      sort_field: field,
      sort_direction: direction,
      page: 1,
      search: searchTerm || undefined,
      category_id: selectedCategory !== 'all' ? selectedCategory : undefined,
      jurisdiction: selectedJurisdiction !== 'all' ? selectedJurisdiction : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      relevance_score: selectedRelevance !== 'all' ? selectedRelevance : undefined,
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

  const handleToggleStatus = (precedent: any) => {
    const newStatus = precedent.status === 'active' ? 'archived' : 'active';
    toast.loading(`${newStatus === 'active' ? t('Activating') : t('Archiving')} precedent...`);

    router.put(route('legal-research.precedents.toggle-status', precedent.id), {}, {
      onSuccess: (page) => {
        toast.dismiss();
        if (page.props.flash.success) {
          toast.success(page.props.flash.success);
        }
      },
      onError: (errors) => {
        toast.dismiss();
        toast.error(`Failed to update precedent status: ${Object.values(errors).join(', ')}`);
      }
    });
  };

  const handleFormSubmit = (formData: any) => {
    // Convert key_points string to array
    if (formData.key_points && typeof formData.key_points === 'string') {
      formData.key_points = formData.key_points.split(',').map((point: string) => point.trim()).filter(Boolean);
    }

    const action = formMode === 'create' ? 'store' : 'update';
    const route_name = formMode === 'create' 
      ? 'legal-research.precedents.store' 
      : 'legal-research.precedents.update';
    
    toast.loading(t(`${formMode === 'create' ? 'Creating' : 'Updating'} legal precedent...`));

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
        toast.error(`Failed to ${action} legal precedent: ${Object.values(errors).join(', ')}`);
      }
    });
  };

  const handleDeleteConfirm = () => {
    toast.loading(t('Deleting legal precedent...'));
    router.delete(route('legal-research.precedents.destroy', currentItem.id), {
      onSuccess: (page) => {
        setIsDeleteModalOpen(false);
        toast.dismiss();
        if (page.props.flash.success) {
          toast.success(page.props.flash.success);
        }
      },
      onError: (errors) => {
        toast.dismiss();
        toast.error(`Failed to delete legal precedent: ${Object.values(errors).join(', ')}`);
      }
    });
  };

  const pageActions = [];
  if (hasPermission(permissions, 'create-legal-precedents')) {
    pageActions.push({
      label: t('Add Legal Precedent'),
      icon: <Plus className="h-4 w-4 mr-2" />,
      variant: 'default',
      onClick: () => handleAddNew()
    });
  }

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Legal Research') },
    { title: t('Legal Precedents') }
  ];

  const columns = [
    {
      key: 'case_name',
      label: t('Case Name'),
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'citation',
      label: t('Citation'),
      render: (value: string) => (
        <span className=" text-sm">{value}</span>
      )
    },
    {
      key: 'jurisdiction',
      label: t('Jurisdiction'),
      render: (value: string) => (
        <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20">
          {value}
        </span>
      )
    },
    {
      key: 'category',
      label: t('Category'),
      render: (value: any) => value?.name || '-'
    },
    {
      key: 'relevance_score',
      label: t('Relevance'),
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 text-yellow-500" />
          <span className="font-medium">{value}/10</span>
        </div>
      )
    },
    {
      key: 'decision_date',
      label: t('Decision Date'),
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
          overruled: 'bg-red-50 text-red-700 ring-red-600/20',
          questioned: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
          archived: 'bg-gray-50 text-gray-700 ring-gray-600/20'
        };
        
        return (
          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${statusColors[value as keyof typeof statusColors] || statusColors.active}`}>
            {t(value.charAt(0).toUpperCase() + value.slice(1))}
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
      requiredPermission: 'view-legal-precedents'
    },
    {
      label: t('Edit'),
      icon: 'Edit',
      action: 'edit',
      className: 'text-amber-500',
      requiredPermission: 'edit-legal-precedents'
    },
    {
      label: t('Toggle Status'),
      icon: 'ToggleLeft',
      action: 'toggle-status',
      className: 'text-green-500',
      requiredPermission: 'edit-legal-precedents'
    },
    {
      label: t('Delete'),
      icon: 'Trash2',
      action: 'delete',
      className: 'text-red-500',
      requiredPermission: 'delete-legal-precedents'
    }
  ];

  const categoryOptions = [
    { value: 'all', label: t('All Categories') },
    ...(categories || []).map((cat: any) => ({ value: cat.id.toString(), label: cat.name }))
  ];

  const jurisdictionOptions = [
    { value: 'all', label: t('All Jurisdictions') },
    ...(jurisdictions || []).map((jurisdiction: string) => ({ value: jurisdiction, label: jurisdiction }))
  ];

  return (
    <PageTemplate
      title={t("Legal Precedents")}
      url="/legal-research/precedents"
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
              name: 'jurisdiction',
              label: t('Jurisdiction'),
              type: 'select',
              value: selectedJurisdiction,
              onChange: setSelectedJurisdiction,
              options: jurisdictionOptions
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
                { value: 'overruled', label: t('Overruled') },
                { value: 'questioned', label: t('Questioned') },
                { value: 'archived', label: t('Archived') }
              ]
            },
            {
              name: 'relevance_score',
              label: t('Min Relevance'),
              type: 'select',
              value: selectedRelevance,
              onChange: setSelectedRelevance,
              options: [
                { value: 'all', label: t('All Scores') },
                { value: '8', label: t('8+ Stars') },
                { value: '6', label: t('6+ Stars') },
                { value: '4', label: t('4+ Stars') }
              ]
            }
          ]}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          hasActiveFilters={() => searchTerm !== '' || selectedCategory !== 'all' || selectedJurisdiction !== 'all' || selectedStatus !== 'all' || selectedRelevance !== 'all'}
          activeFilterCount={() => (searchTerm ? 1 : 0) + (selectedCategory !== 'all' ? 1 : 0) + (selectedJurisdiction !== 'all' ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0) + (selectedRelevance !== 'all' ? 1 : 0)}
          onResetFilters={() => {
            setSearchTerm('');
            setSelectedCategory('all');
            setSelectedJurisdiction('all');
            setSelectedStatus('all');
            setSelectedRelevance('all');
            setShowFilters(false);
            router.get(route('legal-research.precedents.index'), { page: 1, per_page: pageFilters.per_page });
          }}
          onApplyFilters={applyFilters}
          currentPerPage={pageFilters.per_page?.toString() || "10"}
          onPerPageChange={(value) => {
            router.get(route('legal-research.precedents.index'), {
              page: 1,
              per_page: parseInt(value),
              search: searchTerm || undefined,
              category_id: selectedCategory !== 'all' ? selectedCategory : undefined,
              jurisdiction: selectedJurisdiction !== 'all' ? selectedJurisdiction : undefined,
              status: selectedStatus !== 'all' ? selectedStatus : undefined,
              relevance_score: selectedRelevance !== 'all' ? selectedRelevance : undefined
            });
          }}
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        <CrudTable
          columns={columns}
          actions={actions}
          data={precedents?.data || []}
          from={precedents?.from || 1}
          onAction={handleAction}
          sortField={pageFilters.sort_field}
          sortDirection={pageFilters.sort_direction}
          onSort={handleSort}
          permissions={permissions}
          entityPermissions={{
            view: 'view-legal-precedents',
            create: 'create-legal-precedents',
            edit: 'edit-legal-precedents',
            delete: 'delete-legal-precedents'
          }}
        />

        <Pagination
          from={precedents?.from || 0}
          to={precedents?.to || 0}
          total={precedents?.total || 0}
          links={precedents?.links}
          entityName={t("legal precedents")}
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
            { name: 'case_name', label: t('Case Name'), type: 'text', required: true },
            { name: 'citation', label: t('Citation'), type: 'text', required: true },
            { name: 'jurisdiction', label: t('Jurisdiction'), type: 'text', required: true },
            { 
              name: 'category_id', 
              label: t('Category'), 
              type: 'select',
              options: [
                ...(categories || []).map((cat: any) => ({ value: cat.id, label: cat.name }))
              ]
            },
            { name: 'summary', label: t('Summary'), type: 'textarea', required: true, rows: 4 },
            { 
              name: 'relevance_score', 
              label: t('Relevance Score (1-10)'), 
              type: 'number', 
              required: true,
              min: 1,
              max: 10,
              defaultValue: 5
            },
            { name: 'decision_date', label: t('Decision Date'), type: 'date' },
            { name: 'court_level', label: t('Court Level'), type: 'text' },
            { name: 'key_points', label: t('Key Points'), type: 'text', placeholder: 'Enter key points separated by commas' },
            {
              name: 'status',
              label: t('Status'),
              type: 'select',
              options: [
                { value: 'active', label: t('Active') },
                { value: 'overruled', label: t('Overruled') },
                { value: 'questioned', label: t('Questioned') },
                { value: 'archived', label: t('Archived') }
              ],
              defaultValue: 'active'
            }
          ],
          modalSize: 'xl'
        }}
        initialData={currentItem ? {
          ...currentItem,
          key_points: currentItem.key_points ? currentItem.key_points.join(', ') : ''
        } : null}
        title={
          formMode === 'create'
            ? t('Add New Legal Precedent')
            : t('Edit Legal Precedent')
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
            { name: 'case_name', label: t('Case Name'), type: 'text' },
            { name: 'citation', label: t('Citation'), type: 'text' },
            { name: 'jurisdiction', label: t('Jurisdiction'), type: 'text' },
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
            { name: 'summary', label: t('Summary'), type: 'textarea', rows: 4 },
            {
              name: 'relevance_score',
              label: t('Relevance Score'),
              type: 'text',
              render: () => {
                return <div className="rounded-md border bg-gray-50 p-2">
                  {currentItem?.relevance_score}/10
                </div>;
              }
            },
            { name: 'decision_date', label: t('Decision Date'), type: 'text' },
            { name: 'court_level', label: t('Court Level'), type: 'text' },
            {
              name: 'key_points_display',
              label: t('Key Points'),
              type: 'text',
              render: () => {
                const keyPoints = currentItem?.key_points || [];
                return <div className="rounded-md border bg-gray-50 p-2">
                  {keyPoints.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1">
                      {keyPoints.map((point: string, index: number) => (
                        <li key={index} className="text-sm">{point}</li>
                      ))}
                    </ul>
                  ) : t('No key points')}
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
        title={t('View Legal Precedent')}
        mode="view"
      />

      <CrudDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={currentItem?.case_name || ''}
        entityName="legal precedent"
      />
    </PageTemplate>
  );
}