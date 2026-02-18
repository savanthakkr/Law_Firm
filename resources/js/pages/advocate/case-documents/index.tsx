import { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { usePage, router } from '@inertiajs/react';
import { Plus, Download } from 'lucide-react';
import { hasPermission } from '@/utils/authorization';
import { CrudTable } from '@/components/CrudTable';
import { CrudFormModal } from '@/components/CrudFormModal';
import { CrudDeleteModal } from '@/components/CrudDeleteModal';
import { toast } from '@/components/custom-toast';
import { useTranslation } from 'react-i18next';
import { Pagination } from '@/components/ui/pagination';
import { SearchAndFilterBar } from '@/components/ui/search-and-filter-bar';

export default function CaseDocuments() {
  const { t } = useTranslation();
  const { auth, caseDocuments, documentTypes, filters: pageFilters = {} } = usePage().props as any;
  const permissions = auth?.permissions || [];

  const [searchTerm, setSearchTerm] = useState(pageFilters.search || '');
  const [selectedDocType, setSelectedDocType] = useState(pageFilters.document_type || 'all');
  const [selectedConfidentiality, setSelectedConfidentiality] = useState(pageFilters.confidentiality || 'all');
  const [selectedStatus, setSelectedStatus] = useState(pageFilters.status || 'all');
  const [showFilters, setShowFilters] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');

  const hasActiveFilters = () => {
    return searchTerm !== '' || selectedDocType !== 'all' || selectedConfidentiality !== 'all' || selectedStatus !== 'all';
  };

  const activeFilterCount = () => {
    return (searchTerm ? 1 : 0) + (selectedDocType !== 'all' ? 1 : 0) + (selectedConfidentiality !== 'all' ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const applyFilters = () => {
    router.get(route('advocate.case-documents.index'), {
      page: 1,
      search: searchTerm || undefined,
      document_type: selectedDocType !== 'all' ? selectedDocType : undefined,
      confidentiality: selectedConfidentiality !== 'all' ? selectedConfidentiality : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const handleSort = (field: string) => {
    const direction = pageFilters.sort_field === field && pageFilters.sort_direction === 'asc' ? 'desc' : 'asc';
    router.get(route('advocate.case-documents.index'), {
      sort_field: field,
      sort_direction: direction,
      page: 1,
      search: searchTerm || undefined,
      document_type: selectedDocType !== 'all' ? selectedDocType : undefined,
      confidentiality: selectedConfidentiality !== 'all' ? selectedConfidentiality : undefined,
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
      case 'download':
        handleDownload(item);
        break;
    }
  };

  const handleAddNew = () => {
    setCurrentItem(null);
    setFormMode('create');
    setIsFormModalOpen(true);
  };

  const handleDownload = (doc: any) => {
    window.open(route('advocate.case-documents.download', doc.id), '_blank');
  };

  const handleFormSubmit = (formData: any) => {
    if (formMode === 'create') {
      toast.loading(t('Creating case document...'));
      router.post(route('advocate.case-documents.store'), formData, {
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
            toast.error(`Failed to create case document: ${Object.values(errors).join(', ')}`);
          }
        }
      });
    } else if (formMode === 'edit') {
      toast.loading(t('Updating case document...'));
      router.post(route('advocate.case-documents.update', currentItem.id), {
        ...formData,
        _method: 'PUT'
      }, {
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
            toast.error(`Failed to update case document: ${Object.values(errors).join(', ')}`);
          }
        }
      });
    }
  };

  const handleDeleteConfirm = () => {
    toast.loading(t('Deleting case document...'));
    router.delete(route('advocate.case-documents.destroy', currentItem.id), {
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
          toast.error(`Failed to delete case document: ${Object.values(errors).join(', ')}`);
        }
      }
    });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedDocType('all');
    setSelectedConfidentiality('all');
    setSelectedStatus('all');
    setShowFilters(false);
    router.get(route('advocate.case-documents.index'), {
      page: 1,
      per_page: pageFilters.per_page
    }, { preserveState: true, preserveScroll: true });
  };

  const pageActions = [];
  if (hasPermission(permissions, 'create-case-documents')) {
    pageActions.push({
      label: t('Add Case Document'),
      icon: <Plus className="h-4 w-4 mr-2" />,
      variant: 'default',
      onClick: () => handleAddNew()
    });
  }

  const breadcrumbs = [
    { title: t('Dashboard'), href: route('dashboard') },
    { title: t('Advocate'), href: route('advocate.company-profiles.index') },
    { title: t('Case Documents') }
  ];

  const columns = [
    { key: 'document_id', label: t('Document ID'), sortable: true },
    { key: 'document_name', label: t('Document Name'), sortable: true },
    {
      key: 'document_type_id',
      label: t('Type'),
      render: (value: string, row: any) => {
        const docType = row.document_type;
        return docType ? (
          <span 
            className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium"
            style={{ 
              backgroundColor: `${docType.color}20`, 
              color: docType.color 
            }}
          >
            {docType.name}
          </span>
        ) : '-';
      }
    },
    {
      key: 'confidentiality',
      label: t('Confidentiality'),
      render: (value: string) => {
        const confidentialities = {
          public: { label: t('Public'), class: 'bg-green-50 text-green-700 ring-green-600/20' },
          confidential: { label: t('Confidential'), class: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20' },
          privileged: { label: t('Privileged'), class: 'bg-red-50 text-red-700 ring-red-600/20' }
        };
        const conf = confidentialities[value as keyof typeof confidentialities];
        return (
          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${conf?.class || 'bg-gray-50 text-gray-700 ring-gray-600/20'}`}>
            {conf?.label || value}
          </span>
        );
      }
    },

    {
      key: 'status',
      label: t('Status'),
      render: (value: string) => (
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${value === 'active'
          ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
          : 'bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20'
          }`}>
          {value === 'active' ? t('Active') : t('Archived')}
        </span>
      )
    },
    {
      key: 'created_at',
      label: t('Created At'),
      sortable: true,
        type: 'date',
    }
  ];

  const actions = [
    { label: t('View'), icon: 'Eye', action: 'view', className: 'text-blue-500', requiredPermission: 'view-case-documents' },
    { label: t('Edit'), icon: 'Edit', action: 'edit', className: 'text-amber-500', requiredPermission: 'edit-case-documents' },
    { label: t('Download'), icon: 'Download', action: 'download', className: 'text-green-500', requiredPermission: 'download-case-documents' },
    { label: t('Delete'), icon: 'Trash2', action: 'delete', className: 'text-red-500', requiredPermission: 'delete-case-documents' }
  ];

  const docTypeOptions = [
    { value: 'all', label: t('All Types') },
    ...(documentTypes || []).map((type: any) => ({
      value: type.id.toString(),
      label: type.name
    }))
  ];

  const confidentialityOptions = [
    { value: 'all', label: t('All Levels') },
    { value: 'public', label: t('Public') },
    { value: 'confidential', label: t('Confidential') },
    { value: 'privileged', label: t('Privileged') }
  ];

  const statusOptions = [
    { value: 'all', label: t('All Statuses') },
    { value: 'active', label: t('Active') },
    { value: 'archived', label: t('Archived') }
  ];

  return (
    <PageTemplate title={t("Case Documents")} url="/advocate/case-documents" actions={pageActions} breadcrumbs={breadcrumbs} noPadding>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow mb-4 p-4">
        <SearchAndFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearch={handleSearch}
          filters={[
            { name: 'document_type', label: t('Document Type'), type: 'select', value: selectedDocType, onChange: setSelectedDocType, options: docTypeOptions },
            { name: 'confidentiality', label: t('Confidentiality'), type: 'select', value: selectedConfidentiality, onChange: setSelectedConfidentiality, options: confidentialityOptions },
            { name: 'status', label: t('Status'), type: 'select', value: selectedStatus, onChange: setSelectedStatus, options: statusOptions }
          ]}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          hasActiveFilters={hasActiveFilters}
          activeFilterCount={activeFilterCount}
          onResetFilters={handleResetFilters}
          onApplyFilters={applyFilters}
          currentPerPage={pageFilters.per_page?.toString() || "10"}
          onPerPageChange={(value) => {
            router.get(route('advocate.case-documents.index'), {
              page: 1,
              per_page: parseInt(value),
              search: searchTerm || undefined,
              document_type: selectedDocType !== 'all' ? selectedDocType : undefined,
              confidentiality: selectedConfidentiality !== 'all' ? selectedConfidentiality : undefined,
              status: selectedStatus !== 'all' ? selectedStatus : undefined
            }, { preserveState: true, preserveScroll: true });
          }}
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        <CrudTable
          columns={columns}
          actions={actions}
          data={caseDocuments?.data || []}
          from={caseDocuments?.from || 1}
          onAction={handleAction}
          sortField={pageFilters.sort_field}
          sortDirection={pageFilters.sort_direction}
          onSort={handleSort}
          permissions={permissions}
          entityPermissions={{
            view: 'view-case-documents',
            create: 'create-case-documents',
            edit: 'edit-case-documents',
            delete: 'delete-case-documents'
          }}
        />

        <Pagination
          from={caseDocuments?.from || 0}
          to={caseDocuments?.to || 0}
          total={caseDocuments?.total || 0}
          links={caseDocuments?.links}
          entityName={t("case documents")}
          onPageChange={(url) => router.get(url)}
        />
      </div>

      <CrudFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        formConfig={{
          fields: [
            { name: 'document_name', label: t('Document Name'), type: 'text', required: true },
            { name: 'file', label: t('File'), type: 'media-picker', required: formMode === 'create' },
            {
              name: 'document_type_id',
              label: t('Document Type'),
              type: 'select',
              required: true,
              options: documentTypes ? documentTypes.map((type: any) => ({
                value: type.id.toString(),
                label: type.name
              })) : []
            },
            {
              name: 'confidentiality',
              label: t('Confidentiality Level'),
              type: 'select',
              required: true,
              options: [
                { value: 'public', label: t('Public') },
                { value: 'confidential', label: t('Confidential') },
                { value: 'privileged', label: t('Privileged') }
              ]
            },
            { name: 'document_date', label: t('Document Date'), type: 'date' },
            { name: 'description', label: t('Description'), type: 'textarea' },
            {
              name: 'status',
              label: t('Status'),
              type: 'select',
              options: [
                { value: 'active', label: t('Active') },
                { value: 'archived', label: t('Archived') }
              ],
              defaultValue: 'active'
            }
          ],
          modalSize: 'xl'
        }}
        initialData={currentItem}
        title={
          formMode === 'create'
            ? t('Add New Case Document')
            : formMode === 'edit'
              ? t('Edit Case Document')
              : t('View Case Document')
        }
        mode={formMode}
      />

      <CrudDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={currentItem?.document_name || ''}
        entityName="case document"
      />
    </PageTemplate>
  );
}